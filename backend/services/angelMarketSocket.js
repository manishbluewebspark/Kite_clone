import WebSocketV2 from "smartapi-javascript/lib/websocket2.0.js";
import { getSession, angelLogin  } from "./angelSession.js";
import { getIO } from "../socket.js";
import { getExchangeType } from "../utils/exchangeMap.js";


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

// ── Demo-trade dynamic subscriptions (existing) ──────────────────────────────
// Map: token -> { exchangeType, refCount }
const dynamicSubscriptions = new Map();
const dynamicQuotes = {}; // token -> { ltp, change, changePct, isUp }

// ── NAYA: Watchlist subscriptions — REST polling ki jagah ────────────────────
// Map: token -> { exchangeType, refCount, prevClose }
// prevClose store karte hain taaki change/changePct calculate kar sakein
// (Angel One ke tick payload mein close_price aata hai jo prev day close hai)
const watchlistSubscriptions = new Map();
const watchlistQuotes = {}; // token -> { ltp, change, changePct, isUp, symbol }

let wsInstance = null;
let broadcastInterval = null;
const BROADCAST_INTERVAL = 1_000; // socket emit ka interval — WebSocket ticks already real-time hain, ye sirf batching/throttling ke liye hai taaki UI 1s se zyada fast re-render na ho

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

// ── Demo-trade ticks (existing) ───────────────────────────────────────────────
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

// ── NAYA: Watchlist ticks — WebSocket se live update ──────────────────────────
function updateWatchlistQuote(tick) {
  const rawToken = (tick.token || "").replace(/"/g, "").trim();
  const sub = watchlistSubscriptions.get(rawToken);
  if (!sub) return;

  const ltp = Number(tick.last_traded_price) / 100;
  const open = Number(tick.open_price_day) / 100;
  const high = Number(tick.high_price_day) / 100;
  const low = Number(tick.low_price_day) / 100;
  let close = Number(tick.close_price) / 100;

  // Agar close 0 aaye (kabhi kabhi pehli tick mein aisa hota hai), to
  // pehle se stored prevClose use karo taaki change/changePct flicker na kare
  if (close <= 0 && sub.prevClose) {
    close = sub.prevClose;
  } else if (close > 0) {
    sub.prevClose = close; // future ticks ke liye cache karo
  }

  const chg = close > 0 ? parseFloat((ltp - close).toFixed(2)) : 0;
  const chgPct = close > 0 ? parseFloat(((chg / close) * 100).toFixed(2)) : 0;

  watchlistQuotes[rawToken] = {
    ltp,
    change: chg,
    changePct: chgPct,
    isUp: chg >= 0,
    isDown: chg < 0,
    isFlat: chg === 0,
    open,
    dayHigh: high,
    dayLow: low,
    prevClose: close,
    symbol: sub.symbol || "",
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

  // ── Demo-trade dynamic quotes (existing) ──
  if (Object.keys(dynamicQuotes).length > 0) {
    io.emit("demo:tick", {
      success: true,
      data: dynamicQuotes,
      fetchedAt: new Date().toISOString(),
    });
  }

  // ── NAYA: Watchlist quotes broadcast — REST polling ki jagah ye event ────
  if (Object.keys(watchlistQuotes).length > 0) {
    io.emit("watchlist:tick", {
      success: true,
      data: watchlistQuotes,
      fetchedAt: new Date().toISOString(),
    });
  }
}

// export const startAngelMarketSocket = async () => {
//   try {
//     console.log("🟡 Step 1: getting session");
//     const sess = await getSession();
//     console.log("🟡 Step 2: session fetched", !!sess.accessToken, !!sess.feedToken);

//     if (!sess.accessToken || !sess.feedToken) {
//       throw new Error("Angel One session not ready (missing jwtToken/feedToken)");
//     }

//     wsInstance = new WebSocketV2({
//       clientcode: process.env.ANGEL_CLIENT_ID,
//       jwttoken: sess.accessToken,
//       apikey: process.env.ANGEL_API_KEY,
//       feedtype: sess.feedToken,
//     });

//     console.log("🟡 Step 3: calling connect()");
//     await wsInstance.connect();
//     console.log("✅ Angel One WebSocket V2 connected");

//     wsInstance.reconnection("simple", 5000);

//     wsInstance.fetchData({
//       correlationID: "nse_indices",
//       action: 1,
//       mode: 3,
//       exchangeType: 1,
//       tokens: ["99926000", "99926009"],
//     });

//     wsInstance.fetchData({
//       correlationID: "bse_indices",
//       action: 1,
//       mode: 3,
//       exchangeType: 3,
//       tokens: ["99919000"],
//     });

//     wsInstance.on("tick", (data) => {
//       try {
//         updateIndexState(data);
//         updateDynamicQuote(data);
//         updateWatchlistQuote(data); // ⬅️ naya
//       } catch (err) {
//         console.error("❌ Tick parse error:", err.message);
//       }
//     });

//     // ── Reconnect hone par saari watchlist subscriptions wapas bhejo ────────
//     wsInstance.on("connect", () => {
//       console.log("🔌 WebSocket (re)connected — re-subscribing watchlist tokens");
//       resubscribeWatchlistTokens();
//       resubscribeDemoTokens();
//     });

//     if (broadcastInterval) clearInterval(broadcastInterval);
//     broadcastInterval = setInterval(buildAndBroadcast, BROADCAST_INTERVAL);

//   } catch (err) {
//     console.error("❌ Angel WebSocket start failed:", err.message);
//     throw err;
//   }
// };


let reconnecting = false; // ek time pe ek hi reconnect attempt chale, duplicate na ho

export const startAngelMarketSocket = async () => {
  try {
    console.log("🟡 Step 1: getting session");
    const sess = await getSession();
    console.log("🟡 Step 2: session fetched", !!sess.accessToken, !!sess.feedToken);

    if (!sess.accessToken || !sess.feedToken) {
      throw new Error("Angel One session not ready (missing jwtToken/feedToken)");
    }

    wsInstance = new WebSocketV2({
      clientcode: process.env.ANGEL_CLIENT_ID,
      jwttoken: sess.accessToken,
      apikey: process.env.ANGEL_API_KEY,
      feedtype: sess.feedToken,
    });

    console.log("🟡 Step 3: calling connect()");
    await wsInstance.connect();
    console.log("✅ Angel One WebSocket V2 connected");
    reconnecting = false; // successful connect pe reset karo

    // ⚠️ Library ka built-in "simple" reconnection HATA do — ye stale
    // token se hi retry karta hai, humein khud fresh-login reconnect
    // chahiye. Agar aage bhi rakhna hai to rakh sakte ho as fallback,
    // lekin humara error handler usse pehle hi intercept kar lega.
    // wsInstance.reconnection("simple", 5000);

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
        updateDynamicQuote(data);
        updateWatchlistQuote(data);
      } catch (err) {
        console.error("❌ Tick parse error:", err.message);
      }
    });

    wsInstance.on("connect", () => {
      console.log("🔌 WebSocket (re)connected — re-subscribing watchlist tokens");
      resubscribeWatchlistTokens();
      resubscribeDemoTokens();
    });

    // ── NAYA: error/close handler — 401 pe fresh login karke poora
    // socket recreate karo (token constructor-time pe fix hota hai,
    // isliye purana instance kaam ka nahi rehta) ──────────────────────
    wsInstance.on("error", (err) => {
      handleSocketFailure(err);
    });

    wsInstance.on("close", () => {
      console.warn("⚠️ Angel WebSocket closed");
      handleSocketFailure(new Error("WebSocket closed"));
    });

    if (broadcastInterval) clearInterval(broadcastInterval);
    broadcastInterval = setInterval(buildAndBroadcast, BROADCAST_INTERVAL);

  } catch (err) {
    console.error("❌ Angel WebSocket start failed:", err.message);
    handleSocketFailure(err); // yahan bhi retry lagao, sirf throw karke mat chhodo
  }
};

// ── NAYA: centralized failure handler — 401 detect karke fresh session
// leta hai aur socket ko poora recreate karta hai (with backoff) ─────────
async function handleSocketFailure(err) {
  console.error("🔴 Angel WebSocket failure:", err.message);

  if (reconnecting) return; // ek hi baar me ek retry chain
  reconnecting = true;

  if (wsInstance) {
    try { wsInstance.close(); } catch (_) { }
  }
  if (broadcastInterval) clearInterval(broadcastInterval);

  const is401 = err.message?.includes("401");

  try {
    if (is401) {
      console.log("🔄 401 detected — forcing fresh Angel One login...");
      await angelLogin(); // naya jwtToken/feedToken generate karo
    }
  } catch (loginErr) {
    console.error("❌ Re-login during reconnect failed:", loginErr.message);
  }

  // 5 second backoff, phir poora socket naye token ke saath recreate karo
  setTimeout(() => {
    startAngelMarketSocket().catch((e) =>
      console.error("❌ Reconnect attempt failed:", e.message)
    );
  }, 5000);
}
export const stopAngelMarketSocket = () => {
  if (broadcastInterval) clearInterval(broadcastInterval);
  if (wsInstance) wsInstance.close();
};

// ── Demo trade subscribe/unsubscribe (existing, unchanged) ───────────────────
export const subscribeInstrument = (token, exchangeType) => {
  if (!wsInstance) {
    console.warn("WebSocket not ready, cannot subscribe:", token);
    return;
  }

  const existing = dynamicSubscriptions.get(token);

  if (existing) {
    existing.refCount += 1;
    return;
  }

  dynamicSubscriptions.set(token, { exchangeType, refCount: 1 });

  wsInstance.fetchData({
    correlationID: `demo_${token}`,
    action: 1,
    mode: 3,
    exchangeType,
    tokens: [token],
  });

  console.log(`📡 Subscribed to demo instrument: ${token} (exchangeType: ${exchangeType})`);
};

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
        action: 0,
        mode: 3,
        exchangeType,
        tokens: [token],
      });
      console.log(`📡 Unsubscribed demo instrument: ${token}`);
    }
  }
};

export const getDynamicQuote = (token) => dynamicQuotes[token] || null;

function resubscribeDemoTokens() {
  if (!wsInstance) return;
  dynamicSubscriptions.forEach(({ exchangeType }, token) => {
    wsInstance.fetchData({
      correlationID: `demo_resub_${token}`,
      action: 1,
      mode: 3,
      exchangeType,
      tokens: [token],
    });
  });
}

// ──────────────────────────────────────────────────────────────────────────
// NAYA: Watchlist subscribe/unsubscribe — REST polling (fetchQuotes) ki
// jagah yeh use hota hai. Lifecycle:
//   1. Watchlist load hone par (ya naya stock add hone par) yahan call karo
//   2. Stock remove hone par / watchlist unmount hone par unsubscribe karo
//   3. refCount tracking — agar same token 2 jagah use ho raha hai
//      (e.g. watchlist mein bhi hai aur demo trade mein bhi open hai),
//      dono independent reference count maintain karte hain taaki ek
//      jagah se hata-ne par dusri jagah ka subscription na toote
// ──────────────────────────────────────────────────────────────────────────

/**
 * Multiple watchlist tokens ko ek saath subscribe karo (batch — efficient,
 * ek hi fetchData call exchangeType ke hisaab se group karke).
 * @param {{ token: string, exchange: string, symbol?: string }[]} items
 * `exchange` string hona chahiye (e.g. "NSE", "NFO", "BFO") — yahan
 * internally getExchangeType() se number mein convert hota hai, isliye
 * caller ko khud number nahi banana padta.
 */
export const subscribeWatchlistTokens = (items) => {
  if (!wsInstance) {
    console.warn("WebSocket not ready, cannot subscribe watchlist tokens");
    return;
  }
  if (!items || items.length === 0) return;

  const toSubscribe = {}; // exchangeType -> token[]

  items.forEach(({ token, exchange, symbol }) => {
    let exchangeType;
    try {
      exchangeType = getExchangeType(exchange);
    } catch (err) {
      console.warn(`⚠️ Skipping watchlist subscribe for unknown exchange "${exchange}" (token ${token})`);
      return;
    }

    const existing = watchlistSubscriptions.get(token);
    if (existing) {
      existing.refCount += 1;
      if (symbol) existing.symbol = symbol;
      return;
    }
    watchlistSubscriptions.set(token, { exchangeType, refCount: 1, symbol: symbol || "", prevClose: 0 });
    if (!toSubscribe[exchangeType]) toSubscribe[exchangeType] = [];
    toSubscribe[exchangeType].push(token);
  });

  // Har exchangeType ke liye ek fetchData call — batched, efficient
  Object.entries(toSubscribe).forEach(([exchangeType, tokens]) => {
    wsInstance.fetchData({
      correlationID: `watchlist_${exchangeType}_${Date.now()}`,
      action: 1, // Subscribe
      mode: 3,   // SnapQuote — full tick with open/high/low/close
      exchangeType: parseInt(exchangeType),
      tokens,
    });
  });

  if (Object.keys(toSubscribe).length > 0) {
    console.log(
      `📡 Subscribed watchlist tokens:`,
      Object.entries(toSubscribe).map(([ex, t]) => `exchangeType=${ex}: [${t.join(",")}]`).join(", ")
    );
  }
};

/**
 * Watchlist tokens unsubscribe karo (refCount ghatao, 0 ho to actual unsubscribe)
 * @param {{ token: string, exchange?: string }[]} items
 * exchange optional hai kyunki agar token already watchlistSubscriptions
 * mein hai, uska exchangeType wahin se mil jaata hai.
 */
export const unsubscribeWatchlistTokens = (items) => {
  if (!items || items.length === 0) return;

  const toUnsubscribe = {}; // exchangeType -> token[]

  items.forEach(({ token }) => {
    const existing = watchlistSubscriptions.get(token);
    if (!existing) return;

    existing.refCount -= 1;
    if (existing.refCount <= 0) {
      const exchangeType = existing.exchangeType;
      watchlistSubscriptions.delete(token);
      delete watchlistQuotes[token];
      if (!toUnsubscribe[exchangeType]) toUnsubscribe[exchangeType] = [];
      toUnsubscribe[exchangeType].push(token);
    }
  });

  if (!wsInstance) return;

  Object.entries(toUnsubscribe).forEach(([exchangeType, tokens]) => {
    wsInstance.fetchData({
      correlationID: `watchlist_unsub_${exchangeType}_${Date.now()}`,
      action: 0, // Unsubscribe
      mode: 3,
      exchangeType: parseInt(exchangeType),
      tokens,
    });
  });

  if (Object.keys(toUnsubscribe).length > 0) {
    console.log(
      `📡 Unsubscribed watchlist tokens:`,
      Object.entries(toUnsubscribe).map(([ex, t]) => `exchangeType=${ex}: [${t.join(",")}]`).join(", ")
    );
  }
};

/**
 * Pura watchlist ke liye replace karo — naya set of tokens diye gaye se
 * jo extra hain unhe unsubscribe karo, jo naye hain unhe subscribe karo.
 * Watchlist tab switch (Watchlist 1 → Watchlist 2) ke liye useful.
 * @param {{ token: string, exchange: string, symbol?: string }[]} items
 */
export const syncWatchlistTokens = (items) => {
  const newTokenSet = new Set(items.map((i) => i.token));
  const currentTokens = Array.from(watchlistSubscriptions.keys());

  // Jo current subscriptions mein hain but naye set mein nahi — unsubscribe
  // (exchange string ki zaroorat nahi, kyunki unsubscribeWatchlistTokens
  // internally stored exchangeType use karta hai)
  const toRemove = currentTokens
    .filter((t) => !newTokenSet.has(t))
    .map((t) => ({ token: t }));

  if (toRemove.length > 0) unsubscribeWatchlistTokens(toRemove);

  // Naye items subscribe karo (subscribeWatchlistTokens khud duplicate
  // check kar leta hai refCount ke through)
  subscribeWatchlistTokens(items);
};

function resubscribeWatchlistTokens() {
  if (!wsInstance) return;
  const toSubscribe = {};
  watchlistSubscriptions.forEach(({ exchangeType }, token) => {
    if (!toSubscribe[exchangeType]) toSubscribe[exchangeType] = [];
    toSubscribe[exchangeType].push(token);
  });
  Object.entries(toSubscribe).forEach(([exchangeType, tokens]) => {
    wsInstance.fetchData({
      correlationID: `watchlist_resub_${exchangeType}_${Date.now()}`,
      action: 1,
      mode: 3,
      exchangeType: parseInt(exchangeType),
      tokens,
    });
  });
  if (Object.keys(toSubscribe).length > 0) {
    console.log(`📡 Re-subscribed ${watchlistSubscriptions.size} watchlist tokens after reconnect`);
  }
}

export const getWatchlistQuote = (token) => watchlistQuotes[token] || null;