import express from "express";
import { getKiteClient } from "../services/kiteSession.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/funds", authMiddleware, async (req, res) => {
  try {
    const kc = await getKiteClient(req.user.id);
    const margins = await kc.getMargins();
    res.json({ success: true, data: margins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/holdings", authMiddleware, async (req, res) => {
  try {
    const kc = await getKiteClient(req.user.id);
    const holdings = await kc.getHoldings();
    res.json({ success: true, data: holdings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/positions", authMiddleware, async (req, res) => {
  try {
    const kc = await getKiteClient(req.user.id);
    const positions = await kc.getPositions();
    res.json({ success: true, data: positions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── REAL order placement ──────────────────────────────────────────────────
router.post("/orders", authMiddleware, async (req, res) => {
  try {
    const kc = await getKiteClient(req.user.id);
    const { exchange, tradingsymbol, transaction_type, quantity, product, order_type, price } = req.body;

    const order = await kc.placeOrder("regular", {
      exchange,
      tradingsymbol,
      transaction_type, // BUY/SELL
      quantity,
      product, // CNC, MIS, NRML
      order_type, // MARKET, LIMIT
      price: price || 0,
    });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/orders", authMiddleware, async (req, res) => {
  try {
    const kc = await getKiteClient(req.user.id);
    const orders = await kc.getOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;