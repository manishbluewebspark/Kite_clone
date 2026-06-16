import express from "express";
import { fetchIndicesData } from "../services/marketBroadcast.js";
import { getSmartApi } from "../services/angelSession.js";

const router = express.Router();

router.get("/indices", async (req, res) => {
  try {
    const indices = await fetchIndicesData();
    res.json({ success: true, data: indices, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("❌ Indices error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/market/quotes ───────────────────────────────────────────────────
// Body: { tokens: [{ exchange: "NSE", token: "2885" }] }
router.post("/quotes", async (req, res) => {
  const { tokens } = req.body;

  if (!tokens?.length) {
    return res.status(400).json({ success: false, message: "tokens array required" });
  }

  try {
    const smartApi = await getSmartApi();

    const exchangeTokens = {};
    tokens.forEach(({ exchange, token }) => {
      if (!exchangeTokens[exchange]) exchangeTokens[exchange] = [];
      exchangeTokens[exchange].push(token);
    });

    const result = await smartApi.marketData({ mode: "LTP", exchangeTokens });

    if (!result || result.status === false) {
      throw new Error(result?.message || "marketData LTP failed");
    }

    const quotes = {};
    (result.data?.fetched || []).forEach((d) => {
      const ltp    = parseFloat(d.ltp   || 0);
      const close  = parseFloat(d.close || 0);
      const chg    = parseFloat((ltp - close).toFixed(2));
      const chgPct = close > 0 ? parseFloat(((chg / close) * 100).toFixed(2)) : 0;

      quotes[d.symbolToken] = {
        ltp,
        change:    chg,
        changePct: chgPct,
        isUp:      chg >= 0,
        symbol:    d.tradingSymbol || "",
      };
    });

    res.json({ success: true, data: quotes, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("❌ Quotes error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/market/holdings ──────────────────────────────────────────────────
router.get("/holdings", async (req, res) => {
  try {
    const smartApi = await getSmartApi();
    const result = await smartApi.getHolding();

    if (!result || result.status === false) {
      throw new Error(result?.message || "getHolding failed");
    }

    const holdings = (result.data || []).map((h) => {
      const ltp      = parseFloat(h.ltp          || 0);
      const avgPrice = parseFloat(h.averageprice  || 0);
      const qty      = parseInt(h.quantity        || 0);
      const invested = parseFloat((avgPrice * qty).toFixed(2));
      const curVal   = parseFloat((ltp * qty).toFixed(2));
      const pnl      = parseFloat((curVal - invested).toFixed(2));
      const pnlPct   = invested > 0 ? parseFloat(((pnl / invested) * 100).toFixed(2)) : 0;
      const dayChg   = parseFloat(h.pnlpercentage || 0);

      return {
        name:             h.tradingsymbol?.replace("-EQ", "") || "",
        full_name:        h.symbolname   || h.tradingsymbol   || "",
        exchange:         h.exchange     || "NSE",
        token:            h.symboltoken  || "",
        qty,
        avg_cost:         avgPrice,
        ltp,
        invested,
        cur_val:          curVal,
        pnl,
        pnl_percent:      pnlPct,
        day_chg_percent:  `${dayChg >= 0 ? "+" : ""}${dayChg.toFixed(2)}%`,
        day_chg_positive: dayChg >= 0,
        product:          h.product || "DELIVERY",
      };
    });

    const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
    const totalCurVal   = holdings.reduce((s, h) => s + h.cur_val,  0);
    const totalPnl      = parseFloat((totalCurVal - totalInvested).toFixed(2));
    const pnlPercent    = totalInvested > 0
      ? parseFloat(((totalPnl / totalInvested) * 100).toFixed(2))
      : 0;

    res.json({
      success: true,
      data: holdings,
      summary: {
        count:         holdings.length,
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalCurVal:   parseFloat(totalCurVal.toFixed(2)),
        totalPnl,
        pnlPercent,
        barCurrentPct: totalInvested > 0
          ? Math.min(100, Math.round((totalCurVal / totalInvested) * 100))
          : 0,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Holdings error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/market/funds ─────────────────────────────────────────────────────
router.get("/funds", async (req, res) => {
  try {
    const smartApi = await getSmartApi();
    const result = await smartApi.getRMS();

    if (!result || result.status === false) {
      throw new Error(result?.message || "getRMS failed");
    }

    const d = result.data || {};

    res.json({
      success: true,
      data: {
        availableCash:   parseFloat(d.availablecash   || 0),
        availableMargin: parseFloat(d.availablemargin || 0),
        usedMargin:      parseFloat(d.utilisedmargin  || 0),
        openingBalance:  parseFloat(d.openingbalance  || 0),
        collateral:      parseFloat(d.collateral      || 0),
        m2mUnrealized:   parseFloat(d.m2munrealized   || 0),
        m2mRealized:     parseFloat(d.m2mrealized     || 0),
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Funds error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;