import express from "express";

import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import fundRoutes from "./fundRoutes.js";
import marketRoutes from "./marketRoutes.js";
import watchlistRoutes from "./watchlistRoutes.js";
import instrumentRoutes from "./instrumentRoutes.js";
import demoTradeRoutes from "./demoTradeRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/funds", fundRoutes);
router.use("/market", marketRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/instruments", instrumentRoutes);
router.use("/demo-trades", demoTradeRoutes);

export default router;