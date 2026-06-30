// import express from "express";
// import { fetchIndicesData } from "../services/marketBroadcast.js";
// import { getSmartApi } from "../services/angelSession.js";

// const router = express.Router();

// router.get("/indices", async (req, res) => {
//   try {
//     const indices = await fetchIndicesData();
//     res.json({ success: true, data: indices, fetchedAt: new Date().toISOString() });
//   } catch (err) {
//     console.error("❌ Indices error:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── POST /api/market/quotes ───────────────────────────────────────────────────
// // Body: { tokens: [{ exchange: "NSE", token: "2885" }] }
// // router.post("/quotes", async (req, res) => {
// //   const { tokens } = req.body;

// //   if (!tokens?.length) {
// //     return res.status(400).json({ success: false, message: "tokens array required" });
// //   }

// //   try {
// //     const smartApi = await getSmartApi();

// //     const exchangeTokens = {};
// //     tokens.forEach(({ exchange, token }) => {
// //       if (!exchangeTokens[exchange]) exchangeTokens[exchange] = [];
// //       exchangeTokens[exchange].push(token);
// //     });

// //     const result = await smartApi.marketData({ mode: "LTP", exchangeTokens });

// //     if (!result || result.status === false) {
// //       throw new Error(result?.message || "marketData LTP failed");
// //     }

// //     const quotes = {};
// //     (result.data?.fetched || []).forEach((d) => {
// //       const ltp    = parseFloat(d.ltp   || 0);
// //       const close  = parseFloat(d.close || 0);
// //       const chg    = parseFloat((ltp - close).toFixed(2));
// //       const chgPct = close > 0 ? parseFloat(((chg / close) * 100).toFixed(2)) : 0;

// //       quotes[d.symbolToken] = {
// //         ltp,
// //         change:    chg,
// //         changePct: chgPct,
// //         isUp:      chg >= 0,
// //         symbol:    d.tradingSymbol || "",
// //       };
// //     });

// //     res.json({ success: true, data: quotes, fetchedAt: new Date().toISOString() });
// //   } catch (err) {
// //     console.error("❌ Quotes error:", err.message);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });


// router.post("/quotes", async (req, res) => {
//   const { tokens } = req.body;

//   if (!tokens?.length) {
//     return res.status(400).json({ success: false, message: "tokens array required" });
//   }

//   try {
//     const smartApi = await getSmartApi();

//     const exchangeTokens = {};
//     tokens.forEach(({ exchange, token }) => {
//       if (!exchangeTokens[exchange]) exchangeTokens[exchange] = [];
//       exchangeTokens[exchange].push(token);
//     });

//     // 🔥 FIX: Use OHLC mode to get proper close price
//     const result = await smartApi.marketData({ mode: "OHLC", exchangeTokens });

//     if (!result || result.status === false) {
//       throw new Error(result?.message || "marketData OHLC failed");
//     }

//     const quotes = {};
//     (result.data?.fetched || []).forEach((d) => {
//       const ltp = parseFloat(d.ltp || 0);
//       const close = parseFloat(d.close || d.prevClose || d.previousClose || 0);
//       const open = parseFloat(d.open || 0);
//       const dayHigh = parseFloat(d.dayHigh || d.high || 0);
//       const dayLow = parseFloat(d.dayLow || d.low || 0);
      
//       let chg = 0;
//       let chgPct = 0;
//       let isUp = false;
//       let isDown = false;
//       let isFlat = true;
      
//       if (close > 0 && ltp > 0) {
//         chg = parseFloat((ltp - close).toFixed(2));
//         chgPct = close > 0 ? parseFloat(((chg / close) * 100).toFixed(2)) : 0;
//         isUp = chg > 0;
//         isDown = chg < 0;
//         isFlat = chg === 0;
//       } else {

//         chg = 0;
//         chgPct = 0;
//         isUp = false;
//         isDown = false;
//         isFlat = true;
//       }

//       quotes[d.symbolToken] = {
//         ltp,
//         change: chg,
//         changePct: chgPct,
//         isUp,
//         isDown,
//         isFlat,
//         symbol: d.tradingSymbol || d.symbol || "",
//         close: close,
//         open: open,
//         dayHigh: dayHigh,
//         dayLow: dayLow,
//         prevClose: close,
//       };
//     });

//     res.json({ success: true, data: quotes, fetchedAt: new Date().toISOString() });
//   } catch (err) {
//     console.error("❌ Quotes error:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });




// // ── GET /api/market/holdings ──────────────────────────────────────────────────
// router.get("/holdings", async (req, res) => {
//   try {
//     const smartApi = await getSmartApi();
//     const result = await smartApi.getHolding();

//     if (!result || result.status === false) {
//       throw new Error(result?.message || "getHolding failed");
//     }

//     const holdings = (result.data || []).map((h) => {
//       const ltp      = parseFloat(h.ltp          || 0);
//       const avgPrice = parseFloat(h.averageprice  || 0);
//       const qty      = parseInt(h.quantity        || 0);
//       const invested = parseFloat((avgPrice * qty).toFixed(2));
//       const curVal   = parseFloat((ltp * qty).toFixed(2));
//       const pnl      = parseFloat((curVal - invested).toFixed(2));
//       const pnlPct   = invested > 0 ? parseFloat(((pnl / invested) * 100).toFixed(2)) : 0;
//       const dayChg   = parseFloat(h.pnlpercentage || 0);

//       return {
//         name:             h.tradingsymbol?.replace("-EQ", "") || "",
//         full_name:        h.symbolname   || h.tradingsymbol   || "",
//         exchange:         h.exchange     || "NSE",
//         token:            h.symboltoken  || "",
//         qty,
//         avg_cost:         avgPrice,
//         ltp,
//         invested,
//         cur_val:          curVal,
//         pnl,
//         pnl_percent:      pnlPct,
//         day_chg_percent:  `${dayChg >= 0 ? "+" : ""}${dayChg.toFixed(2)}%`,
//         day_chg_positive: dayChg >= 0,
//         product:          h.product || "DELIVERY",
//       };
//     });

//     const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
//     const totalCurVal   = holdings.reduce((s, h) => s + h.cur_val,  0);
//     const totalPnl      = parseFloat((totalCurVal - totalInvested).toFixed(2));
//     const pnlPercent    = totalInvested > 0
//       ? parseFloat(((totalPnl / totalInvested) * 100).toFixed(2))
//       : 0;

//     res.json({
//       success: true,
//       data: holdings,
//       summary: {
//         count:         holdings.length,
//         totalInvested: parseFloat(totalInvested.toFixed(2)),
//         totalCurVal:   parseFloat(totalCurVal.toFixed(2)),
//         totalPnl,
//         pnlPercent,
//         barCurrentPct: totalInvested > 0
//           ? Math.min(100, Math.round((totalCurVal / totalInvested) * 100))
//           : 0,
//       },
//       fetchedAt: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("❌ Holdings error:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── GET /api/market/funds ─────────────────────────────────────────────────────
// router.get("/funds", async (req, res) => {
//   try {
//     const smartApi = await getSmartApi();
//     const result = await smartApi.getRMS();

//     if (!result || result.status === false) {
//       throw new Error(result?.message || "getRMS failed");
//     }

//     const d = result.data || {};

//     res.json({
//       success: true,
//       data: {
//         availableCash:   parseFloat(d.availablecash   || 0),
//         availableMargin: parseFloat(d.availablemargin || 0),
//         usedMargin:      parseFloat(d.utilisedmargin  || 0),
//         openingBalance:  parseFloat(d.openingbalance  || 0),
//         collateral:      parseFloat(d.collateral      || 0),
//         m2mUnrealized:   parseFloat(d.m2munrealized   || 0),
//         m2mRealized:     parseFloat(d.m2mrealized     || 0),
//       },
//       fetchedAt: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("❌ Funds error:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// export default router;


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
//
// FIX: F&O instruments (NFO/BFO options, futures) ke liye Angel One ka OHLC
// mode aksar empty/zero response deta hai. LTP mode F&O ke liye zyada
// reliable hai. Strategy:
//   1. Pehle LTP mode try karo — sabse reliable, sab segments pe kaam karta hai
//   2. Agar OHLC data chahiye (open/high/low/prevClose ke liye), to LTP ke
//      response se hi prevClose-based change nikalo, ya OHLC alag se try karo
//      aur fetched/unfetched dono ko merge karo
//   3. Jo tokens fetched mein nahi aaye unke liye bhi 0 ki jagah LTP se fallback
// ──────────────────────────────────────────────────────────────────────────────
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

    // ── Step 1: LTP mode — sabse reliable, F&O ke liye bhi kaam karta hai ──
    const ltpResult = await smartApi.marketData({ mode: "LTP", exchangeTokens });

    if (!ltpResult || ltpResult.status === false) {
      throw new Error(ltpResult?.message || "marketData LTP failed");
    }

    // Debug: kitne fetched/unfetched aaye, console mein check karo
    console.log(
      `📊 LTP fetch: ${ltpResult.data?.fetched?.length || 0} fetched, ` +
      `${ltpResult.data?.unfetched?.length || 0} unfetched ` +
      `(requested: ${tokens.length})`
    );
    // ── DEBUG: requested vs fetched tokens compare karo — kaunse miss ho rahe ──
    const requestedTokens = tokens.map((t) => t.token);
    const fetchedTokens = (ltpResult.data?.fetched || []).map((d) => d.symbolToken);
    const missingTokens = requestedTokens.filter((t) => !fetchedTokens.includes(t));
    if (missingTokens.length) {
      console.log("⚠️ MISSING tokens (requested but not in fetched/unfetched):", missingTokens);
      console.log("⚠️ Original tokens array:", JSON.stringify(tokens));
    }
    if (ltpResult.data?.unfetched?.length) {
      console.log("⚠️ Unfetched (API explicitly rejected):", JSON.stringify(ltpResult.data.unfetched));
    }

    // ── Step 2: OHLC mode bhi try karo — extra fields (open/high/low/close) ke liye
    // Agar ye fail ho jaaye to ignore karo, LTP data fallback rahega
    let ohlcMap = {};
    try {
      const ohlcResult = await smartApi.marketData({ mode: "OHLC", exchangeTokens });
      console.log(
        `📈 OHLC fetch: ${ohlcResult?.data?.fetched?.length || 0} fetched, ` +
        `status: ${ohlcResult?.status}`
      );
      if (ohlcResult && ohlcResult.status !== false) {
        (ohlcResult.data?.fetched || []).forEach((d) => {
          ohlcMap[d.symbolToken] = d;
        });
        // Debug: ek sample OHLC entry print karo dekhne ke liye kya fields aate hain
        if (ohlcResult.data?.fetched?.[0]) {
          console.log("📈 Sample OHLC entry:", JSON.stringify(ohlcResult.data.fetched[0]));
        }
      }
      if (ohlcResult?.data?.unfetched?.length) {
        console.log("⚠️ OHLC unfetched:", JSON.stringify(ohlcResult.data.unfetched));
      }
    } catch (ohlcErr) {
      console.warn("⚠️ OHLC fetch failed, using LTP-only data:", ohlcErr.message);
    }

    const quotes = {};

    (ltpResult.data?.fetched || []).forEach((d) => {
      const ltp = parseFloat(d.ltp || 0);

      // OHLC data agar mila hai to use karo, nahi to LTP response se hi
      // jo bhi mile (close/prevClose) use karo
      // FIX: pehle wali line mein operator precedence bug tha —
      // (a ?? b ?? c ?? d != null ? 0 : 0) hamesha 0 return karta tha
      // chahe ohlcData mojood ho ya na ho. Ab clean fallback chain hai.
      const ohlcData = ohlcMap[d.symbolToken];
      const rawClose =
        ohlcData?.close ??
        ohlcData?.prevClose ??
        d.close ??
        d.prevClose ??
        0;
      const close = parseFloat(rawClose) || 0;
      const open = parseFloat(ohlcData?.open ?? d.open ?? 0);
      const dayHigh = parseFloat(ohlcData?.dayHigh ?? ohlcData?.high ?? d.dayHigh ?? 0);
      const dayLow = parseFloat(ohlcData?.dayLow ?? ohlcData?.low ?? d.dayLow ?? 0);

      let chg = 0;
      let chgPct = 0;
      let isUp = false;
      let isDown = false;
      let isFlat = true;

      if (close > 0 && ltp > 0) {
        chg = parseFloat((ltp - close).toFixed(2));
        chgPct = parseFloat(((chg / close) * 100).toFixed(2));
        isUp = chg > 0;
        isDown = chg < 0;
        isFlat = chg === 0;
      }

      quotes[d.symbolToken] = {
        ltp,
        change: chg,
        changePct: chgPct,
        isUp,
        isDown,
        isFlat,
        symbol: d.tradingSymbol || d.symbol || "",
        close,
        open,
        dayHigh,
        dayLow,
        prevClose: close,
      };
    });

    // ── Unfetched tokens ke liye bhi entry banao (frontend "0.00" ki jagah
    // kam se kam pata chale ki data missing hai, blank na rahe) ──────────────
    (ltpResult.data?.unfetched || []).forEach((u) => {
      const tok = u.symbolToken || u.token;
      if (tok && !quotes[tok]) {
        quotes[tok] = {
          ltp: 0,
          change: 0,
          changePct: 0,
          isUp: false,
          isDown: false,
          isFlat: true,
          symbol: u.tradingSymbol || "",
          close: 0,
          open: 0,
          dayHigh: 0,
          dayLow: 0,
          prevClose: 0,
          unfetched: true, // frontend isse "Data unavailable" dikha sakta hai
        };
      }
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