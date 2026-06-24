import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import { KiteConnect } from "kiteconnect";
import { initKiteTicker } from "./kiteTickerService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, "..", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "kite_instruments.json");
const CACHE_TTL = 24 * 60 * 60 * 1000;

const KITE_DUMP_URL = "https://api.kite.trade/instruments";
const ALLOWED_EXCHANGES = ["NSE", "BSE", "NFO", "BFO", "MCX", "CDS"];

// ── In-memory state ───────────────────────────────────────────────────────────
let instrumentCache = [];
let lastLoaded = 0;
let kiteClient = null;

// ══════════════════════════════════════════════════════════════════════════════
// INSTRUMENT DUMP
// ══════════════════════════════════════════════════════════════════════════════

export const loadKiteInstruments = async (force = false) => {
    const now = Date.now();

    if (!force && instrumentCache.length > 0 && now - lastLoaded < CACHE_TTL) {
        return instrumentCache;
    }

    // Local cache check
    if (!force && fs.existsSync(CACHE_FILE)) {
        const stat = fs.statSync(CACHE_FILE);
        if (now - stat.mtimeMs < CACHE_TTL) {
            instrumentCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
            lastLoaded = now;
            console.log(`✅ Kite instruments loaded from cache (${instrumentCache.length})`);
            return instrumentCache;
        }
    }

    console.log("⏳ Downloading Kite instrument dump...");

    const { data: csvData } = await axios.get(KITE_DUMP_URL, {
        timeout: 60000,
        responseType: "text",
    });

    const rows = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
    });

    instrumentCache = rows
        .filter((r) => ALLOWED_EXCHANGES.includes(r.exchange))
        .map((r) => ({
            token: r.instrument_token,        // Kite LTP fetch ke liye
            exchange_token: r.exchange_token,
            symbol: r.tradingsymbol,          // search + display
            name: r.name,                     // company name
            expiry: r.expiry,
            strike: r.strike,
            lotsize: r.lot_size,
            instrumenttype: r.instrument_type,
            exch_seg: r.exchange,             // existing frontend field name match
            tick_size: r.tick_size,
            segment: r.segment,
        }));

    lastLoaded = now;

    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(instrumentCache));

    console.log(`✅ Kite instruments downloaded & cached (${instrumentCache.length})`);
    return instrumentCache;
};

export const searchKiteInstruments = (query, { exchange, limit } = {}) => {
    const q = query ? query.trim().toUpperCase() : "";

    let results = instrumentCache.filter((inst) => {
        const matchesQuery = q
            ? inst.symbol.toUpperCase().includes(q) ||
            inst.name.toUpperCase().includes(q)
            : true;
        const matchesExchange = exchange
            ? inst.exch_seg === exchange.toUpperCase()
            : true;
        return matchesQuery && matchesExchange;
    });

    if (q) {
        results.sort((a, b) => {
            const aStarts = a.symbol.toUpperCase().startsWith(q) ? 0 : 1;
            const bStarts = b.symbol.toUpperCase().startsWith(q) ? 0 : 1;
            return aStarts - bStarts;
        });
    }

    return typeof limit === "number" ? results.slice(0, limit) : results;
};

export const getKiteInstrumentCount = () => instrumentCache.length;

export const findKiteInstrumentByToken = (token) =>
    instrumentCache.find((i) => i.token === String(token)) || null;

// ══════════════════════════════════════════════════════════════════════════════
// KITE CLIENT (daily login se milta hai)
// ══════════════════════════════════════════════════════════════════════════════

export const initKiteClient = (accessToken) => {
    kiteClient = new KiteConnect({ api_key: process.env.KITE_API_KEY });
    kiteClient.setAccessToken(accessToken);
    console.log("✅ Kite client initialized with access token");

    // ⬅️ Ticker bhi start karo usi access token se
    initKiteTicker(accessToken);
    return kiteClient;
};

export const getKiteClientInstance = () => {
    if (!kiteClient) throw new Error("Kite not connected. Admin login required.");
    return kiteClient;
};

export const isKiteConnected = () => !!kiteClient;

// ══════════════════════════════════════════════════════════════════════════════
// LTP FETCH
// ══════════════════════════════════════════════════════════════════════════════

// Single instrument LTP
// symbol aur exchange se "NSE:INFY" format banana padega Kite ke liye
export const getKiteLTP = async (symbol, exchange) => {
    const kite = getKiteClientInstance();
    const kiteKey = `${exchange}:${symbol}`;

    const quotes = await kite.getLTP([kiteKey]);
    const q = quotes[kiteKey];

    if (!q) throw new Error(`No LTP from Kite for ${kiteKey}`);

    return {
        ltp: q.last_price,
        symbol,
        exchange,
        kiteKey,
    };
};

// Bulk LTP — watchlist / open positions ke liye
// instruments: [{ symbol, exchange, token }]
// token = Kite instrument_token (jo instrument search se aata hai)
export const getKiteBulkLTP = async (instruments) => {
    const kite = getKiteClientInstance();

    if (!instruments?.length) return {};

    // Deduplicate
    const uniqueMap = new Map();
    instruments.forEach((i) => {
        const key = `${i.exchange}:${i.symbol}`;
        uniqueMap.set(key, i.token);
    });

    const kiteKeys = Array.from(uniqueMap.keys());

    // Kite allows max 500 per call
    const chunks = [];
    for (let i = 0; i < kiteKeys.length; i += 500) {
        chunks.push(kiteKeys.slice(i, i + 500));
    }

    const allQuotes = {};
    for (const chunk of chunks) {
        const quotes = await kite.getLTP(chunk);
        Object.assign(allQuotes, quotes);
    }

    // Result keyed by Kite instrument_token (taaki frontend token se match kare)
    const result = {};
    uniqueMap.forEach((token, kiteKey) => {
        const q = allQuotes[kiteKey];
        if (q) {
            result[token] = {
                ltp: q.last_price,
                change: q.net_change ?? 0,
                changePct: 0, // Kite LTP endpoint me changePct nahi hota, Quote endpoint me hota hai
                isUp: (q.net_change ?? 0) >= 0,
                symbol: kiteKey.split(":")[1],
                exchange: kiteKey.split(":")[0],
            };
        }
    });

    return result;
};