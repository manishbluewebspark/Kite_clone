import express from "express";
import DemoTrade from "../models/DemoTrade.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getLTP } from "../services/angelSession.js";

const router = express.Router();

// ── Open a demo trade (BUY/SELL simulate) ─────────────────────────────────
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

    res.json({ success: true, data: trade });
  } catch (err) {
    console.error("Demo trade open error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── List all trades for logged-in user (open + closed) ───────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status } = req.query; // optional filter: OPEN or CLOSED

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

// ── Close a demo trade (exit position) ────────────────────────────────────
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

    res.json({ success: true, data: trade });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Delete a trade (optional, cleanup ke liye) ────────────────────────────
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