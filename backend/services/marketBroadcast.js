import { getSmartApi } from "./angelSession.js";

const INDEX_TOKENS = {
  "NIFTY 50":   "99926000",
  "SENSEX":     "99919000",
  "NIFTY BANK": "99926009",
};

const tokenNameMap = {
  [INDEX_TOKENS["NIFTY 50"]]:   "NIFTY 50",
  [INDEX_TOKENS["NIFTY BANK"]]: "NIFTY BANK",
  [INDEX_TOKENS["SENSEX"]]:     "SENSEX",
};

export const fetchIndicesData = async () => {
  const smartApi = await getSmartApi();

  const result = await smartApi.marketData({
    mode: "FULL",
    exchangeTokens: {
      NSE: [INDEX_TOKENS["NIFTY 50"], INDEX_TOKENS["NIFTY BANK"]],
      BSE: [INDEX_TOKENS["SENSEX"]],
    },
  });

  if (!result || result.status === false) {
    throw new Error(result?.message || "marketData API failed");
  }

  const allFetched = result.data?.fetched || [];

  return allFetched
    .filter((d) => tokenNameMap[d.symbolToken])
    .map((d) => {
      const ltp    = parseFloat(d.ltp   || 0);
      const close  = parseFloat(d.close || 0);
      const chg    = parseFloat((ltp - close).toFixed(2));
      const chgPct = close > 0 ? parseFloat(((chg / close) * 100).toFixed(2)) : 0;

      return {
        name:          tokenNameMap[d.symbolToken],
        last:          ltp,
        change:        chg,
        changePct:     chgPct,
        open:          parseFloat(d.open || 0),
        high:          parseFloat(d.high || 0),
        low:           parseFloat(d.low  || 0),
        previousClose: close,
        isUp:          chg >= 0,
      };
    });
};

const POLL_INTERVAL = 15_000;
let intervalRef = null;

export const startMarketBroadcast = (io) => {
  const tick = async () => {
    try {
      const indices = await fetchIndicesData();
      io.emit("market:update", {
        success: true,
        data: indices,
        fetchedAt: new Date().toISOString(),
      });
      console.log("✅ Broadcasted:", indices.map((i) => `${i.name}=${i.last}`).join(", "));
    } catch (err) {
      console.error("❌ Market broadcast error:", err.message);
      io.emit("market:update", { success: false, message: err.message });
    }
  };

  tick(); // immediate pehla broadcast
  intervalRef = setInterval(tick, POLL_INTERVAL);
};

export const stopMarketBroadcast = () => {
  if (intervalRef) clearInterval(intervalRef);
};