// routes/watchlistRoutes.js
import express from "express";
import Watchlist from "../models/Watchlist.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // tumhara existing auth

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { groupNo = 1 } = req.query;
    const items = await Watchlist.findAll({
      where: { userId: req.user.id, groupNo, isDeleted: false },
      order: [["createdAt", "ASC"]],
    });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { symbol, exchange, token, groupNo = 1 } = req.body;
    if (!symbol || !exchange || !token) {
      return res.status(400).json({ success: false, message: "symbol, exchange, token required" });
    }
    const item = await Watchlist.create({ userId: req.user.id, symbol, exchange, token, groupNo });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Watchlist.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    item.isDeleted = true;
    await item.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;