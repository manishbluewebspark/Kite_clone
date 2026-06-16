import express from "express";
import Holding from "../models/Holding.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── GET /api/holdings/me ──────────────────────────────────────────────────────


// POST /api/holdings — modal se "Add Holding" save
router.post("/", protect, async (req, res) => {
    try {
        const {
            name,        // e.g. "SENSEX25JUN74500CE"
            full_name,   // display name e.g. "SENSEX 18 JUN 74500 CE"
            token,
            exch_seg,
            lotsize,
            qty,
            avg_cost,
            ltp,         // modal khulte time jo current price dikha tha
            category,    // optional, default "kite"
        } = req.body;

        if (!name || !qty || !avg_cost) {
            return res.status(400).json({
                success: false,
                message: "name, qty, avg_cost required",
            });
        }

        const invested = qty * avg_cost;
        const currentLtp = ltp ?? avg_cost;
        const cur_val = qty * currentLtp;
        const pnl = cur_val - invested;
        const pnl_percent = invested > 0 ? (pnl / invested) * 100 : 0;

        const holding = await Holding.create({
            user_id: req.user.id, // apne auth middleware ke hisaab se field name adjust karo
            name,
            full_name: full_name || name,
            token,
            exch_seg,
            lot_size: lotsize || 1,
            category: category || "kite",
            qty,
            avg_cost,
            ltp: currentLtp,
            invested,
            cur_val,
            pnl,
            pnl_percent,
            net_chg: pnl_percent,
        });

        res.status(201).json({ success: true, data: holding });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Logged-in user ki saari holdings
// GET /api/holdings/me
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.user_id || req.user.userId;

        const holdings = await Holding.findAll({
            where: { user_id: userId },
            order: [["name", "ASC"]],
        });

        if (!holdings.length) {
            return res.json({
                success: true,
                holdings: [],      // ← Change kiya: data → holdings
                summary: {
                    count: 0,
                    totalInvested: 0,
                    totalCurVal: 0,
                    totalPnl: 0,
                    pnlPercent: 0,
                    barCurrentPct: 0,
                },
            });
        }

        // Summary calculate karo
        const totalInvested = holdings.reduce((sum, h) => sum + parseFloat(h.invested || 0), 0);
        const totalCurVal = holdings.reduce((sum, h) => sum + parseFloat(h.cur_val || 0), 0);
        const totalPnl = totalCurVal - totalInvested;
        const pnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

        res.json({
            success: true,
            holdings,      // ← Change kiya: data → holdings
            summary: {
                count: holdings.length,
                totalInvested: parseFloat(totalInvested.toFixed(2)),
                totalCurVal: parseFloat(totalCurVal.toFixed(2)),
                totalPnl: parseFloat(totalPnl.toFixed(2)),
                pnlPercent: parseFloat(pnlPercent.toFixed(2)),
                barCurrentPct: totalInvested > 0
                    ? Math.min(100, Math.round((totalCurVal / totalInvested) * 100))
                    : 0,
            },
        });
    } catch (err) {
        console.error("❌ Holdings fetch error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── PATCH /api/holdings/update-ltp ───────────────────────────────────────────
// Frontend se live LTP aa jaata hai, DB update karo
// Body: [{ name: "RELIANCE", ltp: 2950.5 }, ...]
router.patch("/update-ltp", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.user_id || req.user.userId;
        const updates = req.body; // array of { name, ltp }

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ success: false, message: "updates array required" });
        }

        const results = await Promise.all(
            updates.map(async ({ name, ltp }) => {
                const holding = await Holding.findOne({
                    where: { user_id: userId, name: name.toUpperCase() },
                });

                if (!holding) return { name, updated: false };

                const ltpNum = parseFloat(ltp);
                const qtyNum = parseInt(holding.qty);
                const avgCost = parseFloat(holding.avg_cost);

                const curVal = parseFloat((ltpNum * qtyNum).toFixed(2));
                const invested = parseFloat((avgCost * qtyNum).toFixed(2));
                const pnl = parseFloat((curVal - invested).toFixed(2));
                const pnlPct = invested > 0 ? parseFloat(((pnl / invested) * 100).toFixed(2)) : 0;

                await holding.update({ ltp: ltpNum, cur_val: curVal, pnl, pnl_percent: pnlPct, net_chg: pnlPct });

                return { name, updated: true };
            })
        );

        res.json({ success: true, results });
    } catch (err) {
        console.error("❌ LTP update error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/holdings/admin/:userId ──────────────────────────────────────────
// Admin: kisi bhi user ki holdings dekho
router.get("/admin/:userId", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        const holdings = await Holding.findAll({
            where: { user_id: req.params.userId },
            order: [["name", "ASC"]],
        });

        res.json({ success: true, data: holdings, count: holdings.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;