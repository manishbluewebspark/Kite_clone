import express from "express";
import DemoTrade from "../models/DemoTrade.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getLTP } from "../services/angelSession.js";
import { subscribeInstrument, unsubscribeInstrument } from "../services/angelMarketSocket.js";
import { getExchangeType } from "../utils/exchangeMap.js";

const router = express.Router();

router.post("/open", authMiddleware, async (req, res) => {
  try {
    const {
      symbol,
      name,
      exchange,
      token,
      transaction_type,
      quantity,
      // ── New fields from OrderModal ──
      product = "MIS",           // "MIS" (Intraday) | "NRML" (Overnight)
      order_type = "MARKET",     // "MARKET" | "LIMIT" | "SL" | "SL-M"
      validity = "DAY",          // "DAY" | "IOC" | "MINUTES"
      price = 0,                 // Limit order price
      trigger_price = 0,         // SL/SL-M trigger
      market_protection = false,
    } = req.body;

    if (!symbol || !exchange || !token || !transaction_type || !quantity) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (!["BUY", "SELL"].includes(transaction_type)) {
      return res.status(400).json({ success: false, message: "Invalid transaction_type" });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be positive" });
    }

    const ltpData = await getLTP(exchange, symbol, token);
    const entryPrice = parseFloat(ltpData.ltp);

    const trade = await DemoTrade.create({
      user_id: req.user.id,
      symbol,
      name: name || symbol,
      exchange,
      token,
      transaction_type,
      quantity: Number(quantity),
      product: product.toUpperCase(),
      order_type: order_type.toUpperCase(),
      validity: validity.toUpperCase(),
      price: Number(price),
      trigger_price: Number(trigger_price),
      market_protection: Boolean(market_protection),
      entry_price: entryPrice,
      status: "OPEN",
    });

    try {
      const exchangeType = getExchangeType(exchange);
      subscribeInstrument(token, exchangeType);
    } catch (err) {
      console.error("Subscribe error:", err.message);
    }

    res.json({ success: true, data: trade });
  } catch (err) {
    console.error("Demo trade open error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status.toUpperCase();

    const trades = await DemoTrade.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, data: trades });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:id/close", authMiddleware, async (req, res) => {
  try {
    const trade = await DemoTrade.findOne({
      where: { id: req.params.id, user_id: req.user.id, status: "OPEN" },
    });

    if (!trade) {
      return res.status(404).json({ success: false, message: "Open trade not found" });
    }

    const ltpData = await getLTP(trade.exchange, trade.symbol, trade.token);
    const exitPrice = parseFloat(ltpData.ltp);

    const pnl =
      trade.transaction_type === "BUY"
        ? (exitPrice - trade.entry_price) * trade.quantity
        : (trade.entry_price - exitPrice) * trade.quantity;

    await trade.update({
      exit_price: exitPrice,
      status: "CLOSED",
      pnl: parseFloat(pnl.toFixed(2)),
      closed_at: new Date(),
    });

    try {
      const otherOpenTrades = await DemoTrade.count({
        where: { token: trade.token, status: "OPEN" },
      });
      if (otherOpenTrades === 0) {
        const exchangeType = getExchangeType(trade.exchange);
        unsubscribeInstrument(trade.token, exchangeType);
      }
    } catch (err) {
      console.error("Unsubscribe error:", err.message);
    }

    res.json({ success: true, data: trade });
  } catch (err) {
    console.error("Demo trade close error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const trade = await DemoTrade.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!trade) {
      return res.status(404).json({ success: false, message: "Trade not found" });
    }

    await trade.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

// import express from "express";
// import { Op } from "sequelize";
// import DemoTrade from "../models/DemoTrade.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { getKiteLTP } from "../services/kiteService.js";
// import { subscribeKiteToken, unsubscribeKiteToken } from "../services/kiteTickerService.js";

// const router = express.Router();

// // ── POST /api/demo-trades/open ────────────────────────────────────────────────
// router.post("/open", authMiddleware, async (req, res) => {
//   try {
//     const { symbol, name, exchange, token, transaction_type, quantity } = req.body;

//     if (!symbol || !exchange || !token || !transaction_type || !quantity) {
//       return res.status(400).json({ success: false, message: "All fields required" });
//     }

//     if (!["BUY", "SELL"].includes(transaction_type)) {
//       return res.status(400).json({ success: false, message: "Invalid transaction_type" });
//     }

//     if (Number(quantity) <= 0) {
//       return res.status(400).json({ success: false, message: "Quantity must be positive" });
//     }

//     // Kite se current LTP fetch karo (entry price ke liye)
//     const ltpData = await getKiteLTP(symbol, exchange);
//     const entryPrice = parseFloat(ltpData.ltp);

//     const trade = await DemoTrade.create({
//       user_id: req.user.id,
//       symbol,
//       name: name || symbol,
//       exchange,
//       token, // Kite instrument_token
//       transaction_type,
//       quantity: Number(quantity),
//       entry_price: entryPrice,
//       status: "OPEN",
//     });

//     // Kite Ticker pe subscribe karo — real-time P&L updates ke liye
//     try {
//       subscribeKiteToken(token);
//     } catch (err) {
//       console.error("Kite subscribe error:", err.message);
//     }

//     res.json({ success: true, data: trade });
//   } catch (err) {
//     console.error("Demo trade open error:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── GET /api/demo-trades?status=OPEN|CLOSED ───────────────────────────────────
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const { status } = req.query;
//     const where = { user_id: req.user.id };
//     if (status) where.status = status.toUpperCase();

//     const trades = await DemoTrade.findAll({
//       where,
//       order: [["created_at", "DESC"]],
//     });

//     res.json({ success: true, data: trades });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── POST /api/demo-trades/:id/close ──────────────────────────────────────────
// router.post("/:id/close", authMiddleware, async (req, res) => {
//   try {
//     const trade = await DemoTrade.findOne({
//       where: { id: req.params.id, user_id: req.user.id, status: "OPEN" },
//     });

//     if (!trade) {
//       return res.status(404).json({ success: false, message: "Open trade not found" });
//     }

//     // Kite se exit price fetch karo
//     const ltpData = await getKiteLTP(trade.symbol, trade.exchange);
//     const exitPrice = parseFloat(ltpData.ltp);

//     const pnl =
//       trade.transaction_type === "BUY"
//         ? (exitPrice - trade.entry_price) * trade.quantity
//         : (trade.entry_price - exitPrice) * trade.quantity;

//     await trade.update({
//       exit_price: exitPrice,
//       status: "CLOSED",
//       pnl: parseFloat(pnl.toFixed(2)),
//       closed_at: new Date(),
//     });

//     // Agar koi aur OPEN trade isi token ka nahi hai to Kite Ticker se unsubscribe karo
//     try {
//       const otherOpen = await DemoTrade.count({
//         where: {
//           token: trade.token,
//           status: "OPEN",
//           id: { [Op.ne]: trade.id },
//         },
//       });

//       if (otherOpen === 0) {
//         unsubscribeKiteToken(trade.token); // ⬅️ fixed: Kite wala use karo
//       }
//     } catch (err) {
//       console.error("Kite unsubscribe error:", err.message);
//     }

//     res.json({ success: true, data: trade });
//   } catch (err) {
//     console.error("Demo trade close error:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ── DELETE /api/demo-trades/:id ───────────────────────────────────────────────
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const trade = await DemoTrade.findOne({
//       where: { id: req.params.id, user_id: req.user.id },
//     });

//     if (!trade) {
//       return res.status(404).json({ success: false, message: "Trade not found" });
//     }

//     // Delete se pehle agar OPEN tha to Kite Ticker se bhi unsubscribe karo
//     if (trade.status === "OPEN") {
//       try {
//         const otherOpen = await DemoTrade.count({
//           where: {
//             token: trade.token,
//             status: "OPEN",
//             id: { [Op.ne]: trade.id },
//           },
//         });

//         if (otherOpen === 0) {
//           unsubscribeKiteToken(trade.token);
//         }
//       } catch (err) {
//         console.error("Kite unsubscribe on delete error:", err.message);
//       }
//     }

//     await trade.destroy();
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// export default router;