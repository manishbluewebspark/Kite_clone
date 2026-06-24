import { KiteTicker } from "kiteconnect";
import { getIO } from "../socket.js";

let ticker = null;
let subscribedTokens = new Set(); // Kite instrument_tokens (integers)
const tokenQuotes = {}; // token -> { ltp, change, changePct, isUp }
let broadcastInterval = null;

const BROADCAST_INTERVAL = 1000; // 1 second

// ── Ticker initialize karo (Kite login ke baad call karo) ────────────────────
export const initKiteTicker = (accessToken) => {
  if (ticker) {
    // Pehle wala band karo
    try { ticker.disconnect(); } catch (_) {}
    ticker = null;
  }

  ticker = new KiteTicker({
    api_key: process.env.KITE_API_KEY,
    access_token: accessToken,
  });

  ticker.connect();

  ticker.on("connect", () => {
    console.log("✅ Kite Ticker WebSocket connected");
    // Already subscribed tokens wapas subscribe karo (reconnect case)
    if (subscribedTokens.size > 0) {
      const tokens = Array.from(subscribedTokens);
      ticker.subscribe(tokens);
      ticker.setMode(ticker.modeFull, tokens);
      console.log(`📡 Kite Ticker re-subscribed ${tokens.length} tokens`);
    }
    startBroadcast();
  });

  ticker.on("ticks", (ticks) => {
    ticks.forEach((tick) => {
      const token = String(tick.instrument_token);
      const ltp = tick.last_price ?? 0;
      const close = tick.ohlc?.close ?? ltp;
      const chg = parseFloat((ltp - close).toFixed(2));
      const chgPct = close > 0 ? parseFloat(((chg / close) * 100).toFixed(2)) : 0;

      tokenQuotes[token] = {
        ltp,
        change: chg,
        changePct: chgPct,
        isUp: chg >= 0,
      };
    });
  });

  ticker.on("reconnect", (retries, interval) => {
    console.log(`🔄 Kite Ticker reconnecting... (retry ${retries}, interval ${interval}s)`);
  });

  ticker.on("noreconnect", () => {
    console.error("❌ Kite Ticker max reconnect attempts reached");
  });

  ticker.on("error", (err) => {
    console.error("❌ Kite Ticker error:", err);
  });

  ticker.on("close", () => {
    console.log("🔌 Kite Ticker disconnected");
    stopBroadcast();
  });

  ticker.on("order_update", (order) => {
    // Future me real orders ke liye use ho sakta hai
  });
};

// ── 1 second pe connected clients ko demo:tick emit karo ─────────────────────
function startBroadcast() {
  if (broadcastInterval) clearInterval(broadcastInterval);

  broadcastInterval = setInterval(() => {
    if (Object.keys(tokenQuotes).length === 0) return;
    const io = getIO();
    io.emit("demo:tick", {
      success: true,
      data: { ...tokenQuotes },
      fetchedAt: new Date().toISOString(),
    });
  }, BROADCAST_INTERVAL);
}

function stopBroadcast() {
  if (broadcastInterval) clearInterval(broadcastInterval);
  broadcastInterval = null;
}

// ── Demo trade open hone par subscribe karo ───────────────────────────────────
export const subscribeKiteToken = (token) => {
  if (!ticker) {
    console.warn("⚠️ Kite Ticker not initialized");
    return;
  }

  const intToken = parseInt(token);
  if (isNaN(intToken)) return;

  subscribedTokens.add(intToken);
  ticker.subscribe([intToken]);
  ticker.setMode(ticker.modeFull, [intToken]);
  console.log(`📡 Kite Ticker subscribed: ${intToken}`);
};

// ── Demo trade close hone par unsubscribe karo ────────────────────────────────
export const unsubscribeKiteToken = (token) => {
  if (!ticker) return;

  const intToken = parseInt(token);
  subscribedTokens.delete(intToken);
  delete tokenQuotes[String(intToken)];

  if (subscribedTokens.size > 0) {
    ticker.unsubscribe([intToken]);
  }
  console.log(`📡 Kite Ticker unsubscribed: ${intToken}`);
};

export const stopKiteTicker = () => {
  stopBroadcast();
  if (ticker) {
    try { ticker.disconnect(); } catch (_) {}
    ticker = null;
  }
  subscribedTokens.clear();
};

export const isKiteTickerConnected = () => !!ticker;