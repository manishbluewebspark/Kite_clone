import WebSocketV2 from "smartapi-javascript/lib/websocket2.0.js";
import { getSession } from "./angelSession.js";
import { getIO } from "../socket.js";

const INDEX_TOKENS = {
  "NIFTY 50": { token: "99926000", exchangeType: 1 },
  "NIFTY BANK": { token: "99926009", exchangeType: 1 },
  "SENSEX": { token: "99919000", exchangeType: 3 },
};

const tokenNameMap = {
  "99926000": "NIFTY 50",
  "99926009": "NIFTY BANK",
  "99919000": "SENSEX",
};

const indexState = {
  "NIFTY 50": { last: 0, open: 0, high: 0, low: 0, previousClose: 0 },
  "NIFTY BANK": { last: 0, open: 0, high: 0, low: 0, previousClose: 0 },
  "SENSEX": { last: 0, open: 0, high: 0, low: 0, previousClose: 0 },
};

// ── NAYA: dynamic instrument subscriptions (demo trades ke liye) ────────────
// Map: token -> { exchangeType, refCount } — refCount track karta hai kitne open trades isi token ko use kar rahe hain
const dynamicSubscriptions = new Map();
const dynamicQuotes = {}; // token -> { ltp, change, changePct, isUp }

let wsInstance = null;
let broadcastInterval = null;
const BROADCAST_INTERVAL = 1_000;

function updateIndexState(tick) {
  const rawToken = (tick.token || "").replace(/"/g, "").trim();
  const name = tokenNameMap[rawToken];
  if (!name) return;

  const ltp = Number(tick.last_traded_price) / 100;
  const open = Number(tick.open_price_day) / 100;
  const high = Number(tick.high_price_day) / 100;
  const low = Number(tick.low_price_day) / 100;
  const close = Number(tick.close_price) / 100;

  indexState[name] = {
    last: ltp,
    open: open || indexState[name].open,
    high: high || indexState[name].high,
    low: low || indexState[name].low,
    previousClose: close || indexState[name].previousClose,
  };
}

// ── NAYA: dynamic (demo trade) instruments ke ticks process karo ────────────
function updateDynamicQuote(tick) {
  const rawToken = (tick.token || "").replace(/"/g, "").trim();
  if (!dynamicSubscriptions.has(rawToken)) return;

  const ltp = Number(tick.last_traded_price) / 100;
  const close = Number(tick.close_price) / 100;
  const chg = parseFloat((ltp - close).toFixed(2));
  const chgPct = close > 0 ? parseFloat(((chg / close) * 100).toFixed(2)) : 0;

  dynamicQuotes[rawToken] = {
    ltp,
    change: chg,
    changePct: chgPct,
    isUp: chg >= 0,
  };
}

function buildAndBroadcast() {
  const io = getIO();

  // ── Indices broadcast (existing) ──
  const indices = Object.keys(indexState).map((name) => {
    const s = indexState[name];
    const chg = parseFloat((s.last - s.previousClose).toFixed(2));
    const chgPct = s.previousClose > 0 ? parseFloat(((chg / s.previousClose) * 100).toFixed(2)) : 0;

    return {
      name,
      last: s.last,
      change: chg,
      changePct: chgPct,
      open: s.open,
      high: s.high,
      low: s.low,
      previousClose: s.previousClose,
      isUp: chg >= 0,
    };
  });

  const ready = indices.filter((i) => i.last > 0);
  if (ready.length > 0) {
    io.emit("market:update", {
      success: true,
      data: ready,
      fetchedAt: new Date().toISOString(),
    });
  }

  // ── NAYA: dynamic demo-trade instruments broadcast ──
  if (Object.keys(dynamicQuotes).length > 0) {
    io.emit("demo:tick", {
      success: true,
      data: dynamicQuotes,
      fetchedAt: new Date().toISOString(),
    });
  }
}

export const startAngelMarketSocket = async () => {
  try {
    console.log("🟡 Step 1: getting session");
    const sess = await getSession();
    console.log("🟡 Step 2: session fetched", !!sess.accessToken, !!sess.feedToken);

    if (!sess.accessToken || !sess.feedToken) {
      throw new Error("Angel One session not ready (missing jwtToken/feedToken)");
    }

    // wsInstance = new WebSocketV2({...});

    wsInstance = new WebSocketV2({
      clientcode: process.env.ANGEL_CLIENT_ID,
      jwttoken: sess.accessToken,
      apikey: process.env.ANGEL_API_KEY,
      feedtype: sess.feedToken,
    });

    console.log("🟡 Step 3: calling connect()");
    await wsInstance.connect();
    console.log("✅ Angel One WebSocket V2 connected");



    // await wsInstance.connect();
    // console.log("✅ Angel One WebSocket V2 connected");

    wsInstance.reconnection("simple", 5000);

    wsInstance.fetchData({
      correlationID: "nse_indices",
      action: 1,
      mode: 3,
      exchangeType: 1,
      tokens: ["99926000", "99926009"],
    });

    wsInstance.fetchData({
      correlationID: "bse_indices",
      action: 1,
      mode: 3,
      exchangeType: 3,
      tokens: ["99919000"],
    });

    wsInstance.on("tick", (data) => {
      try {
        updateIndexState(data);
        updateDynamicQuote(data); // ⬅️ naya
      } catch (err) {
        console.error("❌ Tick parse error:", err.message);
      }
    });

    if (broadcastInterval) clearInterval(broadcastInterval);
    broadcastInterval = setInterval(buildAndBroadcast, BROADCAST_INTERVAL);

  } catch (err) {
    console.error("❌ Angel WebSocket start failed:", err.message);
    throw err;
  }
};

export const stopAngelMarketSocket = () => {
  if (broadcastInterval) clearInterval(broadcastInterval);
  if (wsInstance) wsInstance.close();
};

// ── NAYA: demo trade open hone par token subscribe karo ──────────────────────
export const subscribeInstrument = (token, exchangeType) => {
  if (!wsInstance) {
    console.warn("WebSocket not ready, cannot subscribe:", token);
    return;
  }

  const existing = dynamicSubscriptions.get(token);

  if (existing) {
    existing.refCount += 1; // already subscribed, sirf refcount badhao
    return;
  }

  dynamicSubscriptions.set(token, { exchangeType, refCount: 1 });

  wsInstance.fetchData({
    correlationID: `demo_${token}`,
    action: 1, // Subscribe
    mode: 3,   // SnapQuote
    exchangeType,
    tokens: [token],
  });

  console.log(`📡 Subscribed to demo instrument: ${token} (exchangeType: ${exchangeType})`);
};

// ── NAYA: demo trade close hone par refcount ghatao, 0 ho to unsubscribe ────
export const unsubscribeInstrument = (token, exchangeType) => {
  const existing = dynamicSubscriptions.get(token);
  if (!existing) return;

  existing.refCount -= 1;

  if (existing.refCount <= 0) {
    dynamicSubscriptions.delete(token);
    delete dynamicQuotes[token];

    if (wsInstance) {
      wsInstance.fetchData({
        correlationID: `demo_unsub_${token}`,
        action: 0, // Unsubscribe
        mode: 3,
        exchangeType,
        tokens: [token],
      });
      console.log(`📡 Unsubscribed demo instrument: ${token}`);
    }
  }
};

// ── NAYA: server restart hone par existing OPEN trades ko re-subscribe karne ke liye ──
export const getDynamicQuote = (token) => dynamicQuotes[token] || null;