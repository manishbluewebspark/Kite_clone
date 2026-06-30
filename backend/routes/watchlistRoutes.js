// // routes/watchlistRoutes.js
// import express from "express";
// import Watchlist from "../models/Watchlist.js";
// import { authMiddleware } from "../middleware/authMiddleware.js"; // tumhara existing auth

// const router = express.Router();

// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const { groupNo = 1 } = req.query;
//     const items = await Watchlist.findAll({
//       where: { userId: req.user.id, groupNo, isDeleted: false },
//       order: [["createdAt", "ASC"]],
//     });
//     res.json({ success: true, data: items });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.post("/", authMiddleware, async (req, res) => {
//   try {
//     const { symbol, exchange, token, groupNo = 1 } = req.body;
//     if (!symbol || !exchange || !token) {
//       return res.status(400).json({ success: false, message: "symbol, exchange, token required" });
//     }
//     const item = await Watchlist.create({ userId: req.user.id, symbol, exchange, token, groupNo });
//     res.json({ success: true, data: item });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const item = await Watchlist.findOne({ where: { id: req.params.id, userId: req.user.id } });
//     if (!item) return res.status(404).json({ success: false, message: "Not found" });
//     item.isDeleted = true;
//     await item.save();
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// export default router;



import express from "express";
import Watchlist from "../models/Watchlist.js"; // path apne project ke hisaab se adjust karo
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  subscribeWatchlistTokens,
  unsubscribeWatchlistTokens,
  syncWatchlistTokens,
} from "../services/angelMarketSocket.js";

const router = express.Router();

// ── GET /api/watchlist?groupNo=1 ──────────────────────────────────────────────
// Watchlist fetch karte waqt yahan ab REST polling start nahi hoti — ye sirf
// list deta hai. Live quotes WebSocket se "watchlist:tick" event ke through
// aate hain (socket.js mein already broadcast ho raha hai).
//
// FIX: yahan hum saare fetched entries ko WebSocket pe subscribe bhi kar
// dete hain — taaki jaise hi watchlist load ho, turant live ticks aana
// shuru ho jaayein, REST polling ka wait nahi karna padta.
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { groupNo = 1 } = req.query;

    const entries = await Watchlist.findAll({
      where: { userId: req.user.id, groupNo: groupNo },
      order: [["createdAt", "ASC"]],
    });

    const data = entries.map((e) => ({
      id: e.id,
      symbol: e.symbol,
      exchange: e.exchange,
      token: e.token,
      groupNo: e.groupNo,
    }));

    // ── NAYA: WebSocket pe subscribe karo (REST polling ki jagah) ──────────
    // syncWatchlistTokens use karte hain taaki agar pehle kisi aur group
    // ke tokens subscribed the (tab switch hua), wo unsubscribe ho jaayein
    // aur sirf is group ke tokens active rahein
    syncWatchlistTokens(
      data.map((e) => ({ token: e.token, exchange: e.exchange, symbol: e.symbol }))
    );

    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ Watchlist fetch error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/watchlist ───────────────────────────────────────────────────────
// Naya stock add karo — DB mein save + WebSocket pe subscribe
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { symbol, exchange, token, groupNo = 1 } = req.body;

    if (!symbol || !exchange || !token) {
      return res.status(400).json({ success: false, message: "symbol, exchange, token required" });
    }

    // Duplicate check
    const existing = await Watchlist.findOne({
      where: { userId: req.user.id, token, exchange, groupNo: groupNo },
    });
    if (existing) {
      return res.json({
        success: true,
        data: {
          id: existing.id,
          symbol: existing.symbol,
          exchange: existing.exchange,
          token: existing.token,
          groupNo: existing.groupNo,
        },
      });
    }

    const entry = await Watchlist.create({
      userId: req.user.id,
      symbol,
      exchange,
      token,
      groupNo: groupNo,
    });

    // ── NAYA: turant WebSocket pe subscribe karo — naye stock ka LTP
    // turant live aana shuru ho jaaye, REST poll ka wait na karna pade
    subscribeWatchlistTokens([{ token, exchange, symbol }]);

    res.json({
      success: true,
      data: {
        id: entry.id,
        symbol: entry.symbol,
        exchange: entry.exchange,
        token: entry.token,
        groupNo: entry.groupNo,
      },
    });
  } catch (err) {
    console.error("❌ Watchlist add error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/watchlist/:id ─────────────────────────────────────────────────
// Stock remove karo — DB se delete + WebSocket unsubscribe (refCount based)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const entry = await Watchlist.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: "Watchlist entry not found" });
    }

    const { token } = entry;
    await entry.destroy();

    // ── NAYA: WebSocket unsubscribe (refCount-based, safe agar token
    // kahin aur bhi use ho raha ho jaise demo-trade mein) ──────────────────
    unsubscribeWatchlistTokens([{ token }]);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Watchlist remove error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;