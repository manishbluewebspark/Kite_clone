// import express from "express";
// import { searchInstruments, getInstrumentCount, loadInstruments } from "../services/instrumentService.js";
// import { getLTP, getSmartApi } from "../services/angelSession.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // GET /api/instruments/search?q=SENSEX&exchange=BFO&limit=30
// // router.get("/search", authMiddleware, (req, res) => {
// //   try {
// //     const { q, exchange, limit } = req.query;

// //     if (getInstrumentCount() === 0) {
// //       return res.status(503).json({
// //         success: false,
// //         message: "Instrument list still loading, try again in a few seconds",
// //       });
// //     }

// //     const results = searchInstruments(q, {
// //       exchange,
// //       limit: limit ? parseInt(limit) : 30,
// //     });
// //     res.json({ success: true, count: results.length, data: results });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });


// router.get("/search", authMiddleware, (req, res) => {
//   try {
//     const { q, exchange, limit } = req.query;

//     if (getInstrumentCount() === 0) {
//       return res.status(503).json({
//         success: false,
//         message: "Instrument list loading, try again in a moment",
//       });
//     }

//     // ⬅️ q.trim().length < 2 check hatao — 1 char pe bhi search allow karo
//     const results = searchInstruments(q, {
//       exchange,
//       limit: limit ? parseInt(limit) : 30,
//     });

//     res.json({ success: true, count: results.length, data: results });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // GET /api/instruments/list?page=1&limit=50&q=NIFTY&exchange=NFO
// router.get("/list", authMiddleware, (req, res) => {
//   try {
//     const { page = 1, limit = 50, q = "", exchange } = req.query;

//     if (getInstrumentCount() === 0) {
//       return res.status(503).json({
//         success: false,
//         message: "Instrument list still loading, try again in a few seconds",
//       });
//     }

//     const allResults = searchInstruments(q, { exchange }); // limit nahi diya -> full filtered set
//     const pageNum = Math.max(1, parseInt(page));
//     const limitNum = Math.max(1, parseInt(limit));
//     const start = (pageNum - 1) * limitNum;
//     const end = start + limitNum;

//     const paginated = allResults.slice(start, end);

//     res.json({
//       success: true,
//       data: paginated,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total: allResults.length,
//         totalPages: Math.ceil(allResults.length / limitNum),
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // GET /api/instruments/ltp?token=99926009&exchange=NSE&symbol=SBIN-EQ
// router.get("/ltp", authMiddleware, async (req, res) => {
//   try {
//     const { token, exchange, symbol } = req.query;

//     if (!token || !exchange || !symbol) {
//       return res.status(400).json({
//         success: false,
//         message: "token, exchange, symbol required",
//       });
//     }

//     const data = await getLTP(exchange, symbol, token);
//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Admin: force refresh script master
// router.post("/refresh", authMiddleware, async (req, res) => {
//   try {
//     await loadInstruments(true);
//     res.json({ success: true, count: getInstrumentCount() });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // POST /api/instruments/bulk-ltp
// // router.post("/bulk-ltp", authMiddleware, async (req, res) => {
// //   try {
// //     const { instruments } = req.body;

// //     if (!Array.isArray(instruments) || instruments.length === 0) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "instruments array required",
// //       });
// //     }

// //     const smartApi = await getSmartApi();

// //     const ltpPromises = instruments.map(async ({ token, exchange, symbol }) => {
// //       try {
// //         const response = await smartApi.getLTPData({ exchange, tradingsymbol: symbol, symboltoken: token });
// //         if (response.status && response.data) {
// //           return {
// //             token,
// //             exchange,
// //             symbol,
// //             ltp: response.data.ltp,
// //             change: response.data.change || 0,
// //             changePercent: response.data.changepercent || 0,
// //             open: response.data.open,
// //             high: response.data.high,
// //             low: response.data.low,
// //           };
// //         }
// //         return { token, exchange, symbol, ltp: null, error: true };
// //       } catch (err) {
// //         return { token, exchange, symbol, ltp: null, error: true };
// //       }
// //     });

// //     const results = await Promise.all(ltpPromises);

// //     res.json({ success: true, data: results });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });


// // instrumentRoutes.js me bulk-ltp route replace karo
// router.post("/bulk-ltp", authMiddleware, async (req, res) => {
//   try {
//     const { instruments } = req.body;
//     if (!Array.isArray(instruments) || instruments.length === 0) {
//       return res.status(400).json({ success: false, message: "instruments array required" });
//     }

//     // Exchange ke hisaab se group karo
//     const grouped = {};
//     for (const { token, exchange } of instruments) {
//       const ex = exchange.toUpperCase();
//       if (!grouped[ex]) grouped[ex] = [];
//       grouped[ex].push(token);
//     }

//     const smartApi = await getSmartApi();
//     const response = await smartApi.marketData({
//       mode: "LTP",
//       exchangeTokens: grouped,
//     });

//     const fetched = response?.data?.fetched ?? [];
//     const resultMap = {};
//     for (const item of fetched) {
//       resultMap[item.symbolToken] = item.ltp;
//     }

//     const results = instruments.map(({ token, exchange, symbol }) => ({
//       token,
//       exchange,
//       symbol,
//       ltp: resultMap[token] ?? null,
//     }));

//     res.json({ success: true, data: results });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// export default router;

import express from "express";
import { searchInstruments, getInstrumentCount, loadInstruments } from "../services/instrumentService.js";
import { getLTP, getSmartApi } from "../services/angelSession.js";
import { fetchQuotesBatch } from "../services/marketDataGateway.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/instruments/search?q=SENSEX&exchange=BFO&limit=30
router.get("/search", authMiddleware, (req, res) => {
  try {
    const { q, exchange, limit } = req.query;

    if (getInstrumentCount() === 0) {
      return res.status(503).json({
        success: false,
        message: "Instrument list loading, try again in a moment",
      });
    }

    const results = searchInstruments(q, {
      exchange,
      limit: limit ? parseInt(limit) : 30,
    });

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/instruments/list?page=1&limit=50&q=NIFTY&exchange=NFO
router.get("/list", authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 50, q = "", exchange } = req.query;

    if (getInstrumentCount() === 0) {
      return res.status(503).json({
        success: false,
        message: "Instrument list still loading, try again in a few seconds",
      });
    }

    const allResults = searchInstruments(q, { exchange });
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;

    const paginated = allResults.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: allResults.length,
        totalPages: Math.ceil(allResults.length / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/instruments/ltp?token=99926009&exchange=NSE&symbol=SBIN-EQ
// FIX: getLTP() ab internally marketDataGateway use karta hai — rate-limited
router.get("/ltp", authMiddleware, async (req, res) => {
  try {
    const { token, exchange, symbol } = req.query;

    if (!token || !exchange || !symbol) {
      return res.status(400).json({
        success: false,
        message: "token, exchange, symbol required",
      });
    }

    const data = await getLTP(exchange, symbol, token);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: force refresh script master
router.post("/refresh", authMiddleware, async (req, res) => {
  try {
    await loadInstruments(true);
    res.json({ success: true, count: getInstrumentCount() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/instruments/bulk-ltp
//
// FIX (production): pehle yeh route seedha smartApi.marketData() call
// karta tha, watchlist polling se independent. Ab fetchQuotesBatch() use
// karta hai jo automatically:
//   - Watchlist polling + demo-order LTP fetch + yeh route — teeno ek hi
//     rate-limited gateway share karte hain, koi bhi combined rate limit
//     cross nahi kar sakta
//   - 900ms cache — agar koi dusra caller abhi-abhi same token fetch
//     kar chuka hai, to turant cached value milegi (extra Angel One
//     call nahi jaayegi)
router.post("/bulk-ltp", authMiddleware, async (req, res) => {
  try {
    const { instruments } = req.body;
    if (!Array.isArray(instruments) || instruments.length === 0) {
      return res.status(400).json({ success: false, message: "instruments array required" });
    }

    const tokens = instruments.map(({ token, exchange }) => ({
      token,
      exchange: exchange.toUpperCase(),
    }));

    const fetchedMap = await fetchQuotesBatch(tokens);

    const results = instruments.map(({ token, exchange, symbol }) => ({
      token,
      exchange,
      symbol,
      ltp: fetchedMap[token]?.ltp != null ? parseFloat(fetchedMap[token].ltp) : null,
    }));

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;