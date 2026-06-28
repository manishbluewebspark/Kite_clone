// import express from "express";
// import { getKiteLoginUrl, exchangeKiteToken, disconnectKite, getKiteClient } from "../services/kiteSession.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Step 1: Login URL do (frontend redirect karega isi URL pe)
// router.get("/login-url", authMiddleware, (req, res) => {
//   const url = getKiteLoginUrl(process.env.KITE_API_KEY);
//   res.json({ success: true, url });
// });

// // Step 2: Kite redirect callback (request_token query param ke saath aayega)
// router.get("/callback", authMiddleware, async (req, res) => {
//   try {
//     const { request_token } = req.query;
//     if (!request_token) {
//       return res.status(400).json({ success: false, message: "request_token missing" });
//     }

//     await exchangeKiteToken(req.user.id, request_token);

//     // success hone pe frontend dashboard pe redirect karo
//     res.redirect(`${process.env.FRONTEND_URL}/dashboard?kite=connected`);
//   } catch (err) {
//     console.error("Kite callback error:", err.message);
//     res.redirect(`${process.env.FRONTEND_URL}/dashboard?kite=error`);
//   }
// });

// // Disconnect
// router.post("/disconnect", authMiddleware, async (req, res) => {
//   try {
//     await disconnectKite(req.user.id);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Connection status check
// router.get("/status", authMiddleware, async (req, res) => {
//   try {
//     await getKiteClient(req.user.id);
//     res.json({ success: true, connected: true });
//   } catch {
//     res.json({ success: true, connected: false });
//   }
// });

// export default router;


import express from "express";
import { KiteConnect } from "kiteconnect";
import { initKiteClient, isKiteConnected } from "../services/kiteService.js";
import { subscribeKiteToken } from "../services/kiteTickerService.js";
import DemoTrade from "../models/DemoOrder.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/login-url", authMiddleware, (req, res) => {
  const kc = new KiteConnect({ api_key: process.env.KITE_API_KEY });
  res.json({ success: true, url: kc.getLoginURL() });
});

router.get("/callback", async (req, res) => {
  try {
    const { request_token } = req.query;

    if (!request_token) {
      return res.status(400).send("request_token missing");
    }

    const kc = new KiteConnect({ api_key: process.env.KITE_API_KEY });
    const session = await kc.generateSession(
      request_token,
      process.env.KITE_API_SECRET
    );

    // Kite client + Ticker initialize karo
    initKiteClient(session.access_token);

    // ⬅️ NAYA: Kite login ke baad open trades auto re-subscribe
    try {
      const openTrades = await DemoTrade.findAll({ where: { status: "OPEN" } });
      const uniqueTokens = new Set(openTrades.map((t) => t.token));

      let count = 0;
      for (const token of uniqueTokens) {
        subscribeKiteToken(token);
        count++;
      }

      if (count > 0) {
        console.log(`📡 Kite login: re-subscribed ${count} open demo-trade tokens`);
      }
    } catch (err) {
      console.error("Re-subscribe after Kite login failed:", err.message);
    }

    console.log("✅ Kite session established");
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?kite=connected`);
  } catch (err) {
    console.error("❌ Kite callback error:", err.message);
    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?kite=error&msg=${encodeURIComponent(err.message)}`
    );
  }
});

router.get("/status", authMiddleware, (req, res) => {
  res.json({ success: true, connected: isKiteConnected() });
});


// routes/kiteAuthRoutes.js me ek extra route add karo dev ke liye
// GET /api/kite/manual-connect?request_token=xxx
router.get("/manual-connect", authMiddleware, async (req, res) => {
  try {
    const { request_token } = req.query;
    if (!request_token) {
      return res.status(400).json({ success: false, message: "request_token required" });
    }

    const kc = new KiteConnect({ api_key: process.env.KITE_API_KEY });
    const session = await kc.generateSession(request_token, process.env.KITE_API_SECRET);

    initKiteClient(session.access_token);

    // Open trades re-subscribe
    const openTrades = await DemoTrade.findAll({ where: { status: "OPEN" } });
    const uniqueTokens = new Set(openTrades.map((t) => t.token));
    for (const token of uniqueTokens) {
      subscribeKiteToken(token);
    }

    console.log("✅ Kite manually connected via request_token");
    res.json({ success: true, message: "Kite connected successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// routes/kiteAuthRoutes.js me naya route add karo
router.post("/set-token", authMiddleware, async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ success: false, message: "access_token required" });
    }

    initKiteClient(access_token);

    // Open trades re-subscribe
    const openTrades = await DemoTrade.findAll({ where: { status: "OPEN" } });
    const uniqueTokens = new Set(openTrades.map((t) => t.token));
    for (const token of uniqueTokens) {
      subscribeKiteToken(token);
    }

    console.log("✅ Kite access_token set manually");
    res.json({ success: true, message: "Kite connected" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;