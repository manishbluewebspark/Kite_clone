// services/marketDataGateway.js
//
// ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
// Angel One ka combined rate limit ~9 req/sec hai across SAARE marketData
// calls (LTP + OHLC + Quote — sab milake count hota hai). Pehle hum 4-5 alag
// jagah se independently Angel One ko hit kar rahe the:
//   1. Watchlist polling (3s interval)
//   2. Demo order placement (getLTP, on-demand)
//   3. Bulk LTP route (on-demand)
//   4. Indices broadcast (interval)
// In sab ka koi centralized coordination nahi tha — jab 2-3 simultaneously
// fire hote the, combined rate cross ho jaata aur Angel One account ko
// 5-30 minutes ke liye block kar deta (403 "exceeding access rate").
//
// Yeh file ek SINGLE CHOKEPOINT banata hai jiske through saari marketData
// calls guaranteed serialized aur rate-limited jaati hain. Koi bhi naya
// feature jo LTP/OHLC chahta hai, isi gateway ko use kare — direct
// smartApi.marketData() kabhi mat call karo.
//
// Features:
//   - Request queue: ek time pe sirf ek Angel One call jaati hai
//   - Minimum gap enforced between calls (configurable, default 350ms
//     = max ~2.8 req/sec, safe margin neeche 9/sec ki Angel One limit se)
//   - Automatic token batching: agar 100ms ke andar multiple callers same
//     tokens maangte hain, unhe ek hi API call mein merge kar deta hai
//   - In-memory cache: same token ko baar baar fetch karne ki zaroorat
//     nahi agar cache abhi fresh hai (default TTL 1s)
//   - Circuit breaker: agar Angel One 403 de, to kuch der ke liye saari
//     calls ko fail-fast karta hai (real API ko hit nahi karta) taaki
//     block aur lamba na ho
// ─────────────────────────────────────────────────────────────────────────

import { getSmartApi } from "./angelSession.js";

// ── Config ───────────────────────────────────────────────────────────────
const MIN_CALL_GAP_MS = 350;      // max ~2.8 calls/sec — Angel One ke 9/sec se kaafi neeche
const BATCH_WINDOW_MS = 100;      // is window ke andar aaye saare requests merge honge
const CACHE_TTL_MS = 900;         // 900ms cache — agar same token dobara maanga jaaye turant
const CIRCUIT_BREAKER_COOLDOWN_MS = 60_000; // 403 milne par 60s ke liye saari calls fail-fast

// ── State ────────────────────────────────────────────────────────────────
let lastCallTime = 0;
let isProcessing = false;

// Pending requests queue: { exchange, token, resolve, reject }[]
let pendingRequests = [];
let batchTimer = null;

// Cache: "EXCHANGE:TOKEN" -> { data, expiresAt }
const quoteCache = new Map();

// Circuit breaker state
let circuitBrokenUntil = 0;

function getCacheKey(exchange, token) {
  return `${exchange}:${token}`;
}

function getCached(exchange, token) {
  const key = getCacheKey(exchange, token);
  const entry = quoteCache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data;
  }
  return null;
}

function setCached(exchange, token, data) {
  const key = getCacheKey(exchange, token);
  quoteCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ── Core: actual Angel One call, rate-limited ───────────────────────────
async function executeAngelCall(exchangeTokens) {
  // Circuit breaker check
  if (Date.now() < circuitBrokenUntil) {
    const waitSec = Math.ceil((circuitBrokenUntil - Date.now()) / 1000);
    throw new Error(`Circuit breaker active — Angel One rate-limited recently, retry in ${waitSec}s`);
  }

  // Rate-limit gap enforce karo
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_CALL_GAP_MS) {
    await new Promise((r) => setTimeout(r, MIN_CALL_GAP_MS - elapsed));
  }
  lastCallTime = Date.now();

  const smartApi = await getSmartApi();
  let result;
  try {
    result = await smartApi.marketData({ mode: "OHLC", exchangeTokens });
  } catch (err) {
    // 403 explicit detection — agar status code ya message mein indication ho
    const is403 =
      err?.response?.status === 403 ||
      /exceeding access rate|forbidden/i.test(err?.message || "");
    if (is403) {
      circuitBrokenUntil = Date.now() + CIRCUIT_BREAKER_COOLDOWN_MS;
      console.error(
        `🔴 Circuit breaker tripped — Angel One 403. Pausing all marketData calls for ${CIRCUIT_BREAKER_COOLDOWN_MS / 1000}s`
      );
    }
    throw err;
  }

  if (!result || result.status === false) {
    const is403 = result?.errorcode === "AB1004" || /exceeding access rate/i.test(result?.message || "");
    if (is403) {
      circuitBrokenUntil = Date.now() + CIRCUIT_BREAKER_COOLDOWN_MS;
      console.error(
        `🔴 Circuit breaker tripped — Angel One rate limit (${result?.message}). Pausing for ${CIRCUIT_BREAKER_COOLDOWN_MS / 1000}s`
      );
    }
    throw new Error(result?.message || "marketData failed");
  }

  return result;
}

// ── Batch processor: pending queue ko flush karke ek Angel One call banata hai
async function processBatch() {
  if (isProcessing) return; // already chal raha hai, wait karo agle cycle ka
  if (pendingRequests.length === 0) return;

  isProcessing = true;
  const batch = pendingRequests;
  pendingRequests = [];

  try {
    // Unique exchange:token combos nikalo
    const uniqueMap = new Map(); // key -> { exchange, token }
    batch.forEach((req) => {
      uniqueMap.set(getCacheKey(req.exchange, req.token), { exchange: req.exchange, token: req.token });
    });

    const exchangeTokens = {};
    uniqueMap.forEach(({ exchange, token }) => {
      if (!exchangeTokens[exchange]) exchangeTokens[exchange] = [];
      exchangeTokens[exchange].push(token);
    });

    console.log(
      `📡 Gateway batch: ${uniqueMap.size} unique tokens, ${batch.length} requests merged`
    );

    const result = await executeAngelCall(exchangeTokens);

    const fetchedMap = new Map();
    (result.data?.fetched || []).forEach((d) => {
      fetchedMap.set(d.symbolToken, d);
      // Cache mein bhi daal do — exchange determine karna padega, fetched mein exchange field hota hai
      const ex = d.exchange || "";
      setCached(ex, d.symbolToken, d);
    });

    // Har pending request ko uska data resolve karo
    batch.forEach((req) => {
      const data = fetchedMap.get(req.token);
      if (data) {
        req.resolve(data);
      } else {
        req.reject(new Error(`LTP not found for token ${req.token} (${req.exchange})`));
      }
    });
  } catch (err) {
    // Saari pending requests ko reject karo
    batch.forEach((req) => req.reject(err));
  } finally {
    isProcessing = false;
    // Agar is dauran naye requests aa gaye hain, unhe bhi process karo
    if (pendingRequests.length > 0) {
      scheduleBatch();
    }
  }
}

function scheduleBatch() {
  if (batchTimer) return; // already scheduled
  batchTimer = setTimeout(() => {
    batchTimer = null;
    processBatch();
  }, BATCH_WINDOW_MS);
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Single token ka quote fetch karo (cache + batching + rate-limit ke saath)
 * @param {string} exchange - e.g. "NSE", "NFO", "BFO"
 * @param {string} token
 * @returns {Promise<object>} raw Angel One fetched-item object
 */
export function fetchQuote(exchange, token) {
  const cached = getCached(exchange, token);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    pendingRequests.push({ exchange, token, resolve, reject });
    scheduleBatch();
  });
}

/**
 * Multiple tokens ek saath fetch karo. Internally batching + rate-limit
 * apply hota hai automatically. Caller ko alag se rate-limit handle
 * karne ki zaroorat NAHI hai — gateway sab sambhalta hai.
 * @param {{exchange: string, token: string}[]} tokens
 * @returns {Promise<Record<string, object>>} symbolToken -> raw data map
 */
export async function fetchQuotesBatch(tokens) {
  const results = await Promise.allSettled(
    tokens.map(({ exchange, token }) => fetchQuote(exchange, token))
  );

  const quotes = {};
  results.forEach((res, idx) => {
    if (res.status === "fulfilled") {
      quotes[tokens[idx].token] = res.value;
    }
    // Rejected wale silently skip — caller "unfetched" treat karega
  });
  return quotes;
}

/**
 * Circuit breaker status check karne ke liye — health endpoint ya
 * debugging ke liye useful
 */
export function getGatewayStatus() {
  return {
    circuitBroken: Date.now() < circuitBrokenUntil,
    circuitBreakerResetsAt: circuitBrokenUntil > 0 ? new Date(circuitBrokenUntil).toISOString() : null,
    pendingRequests: pendingRequests.length,
    cacheSize: quoteCache.size,
    lastCallTime: lastCallTime > 0 ? new Date(lastCallTime).toISOString() : null,
  };
}

// Periodic cache cleanup — expired entries hata do (memory leak na ho)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of quoteCache.entries()) {
    if (entry.expiresAt <= now) quoteCache.delete(key);
  }
}, 30_000);