import express from "express";
import DemoTrade from "../models/DemoTrade.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getLTP } from "../services/angelSession.js";
import { subscribeInstrument, unsubscribeInstrument } from "../services/angelMarketSocket.js";
import { getExchangeType } from "../utils/exchangeMap.js";

const router = express.Router();

router.post("/open", authMiddleware, async (req, res) => {
  try {
    const { symbol, name, exchange, token, transaction_type, quantity } = req.body;

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
      entry_price: entryPrice,
      status: "OPEN",
    });

    // ⬅️ NAYA: socket pe is instrument ko subscribe karo
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

    const pnl = trade.transaction_type === "BUY"
      ? (exitPrice - trade.entry_price) * trade.quantity
      : (trade.entry_price - exitPrice) * trade.quantity;

    await trade.update({
      exit_price: exitPrice,
      status: "CLOSED",
      pnl: parseFloat(pnl.toFixed(2)),
      closed_at: new Date(),
    });

    // ⬅️ NAYA: agar koi aur OPEN trade isi token ka nahi hai, to unsubscribe karo
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