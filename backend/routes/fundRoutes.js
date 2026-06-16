import express from "express";
import {
  getFunds,
  addFunds,
  withdrawFunds,
  updateWithdrawalStatus,
  getWithdrawalHistory,
} from "../controllers/fundController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Funds
router.get("/:userId",                          authMiddleware, getFunds);
router.post("/add",                             authMiddleware, addFunds);

// Withdraw
router.post("/withdraw",                        authMiddleware, withdrawFunds);
router.patch("/withdraw/:historyId/status",     authMiddleware, updateWithdrawalStatus);

// History
router.get("/withdraw/history/:userId",         authMiddleware, getWithdrawalHistory);

export default router;