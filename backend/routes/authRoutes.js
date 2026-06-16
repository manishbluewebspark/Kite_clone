import express from "express";
import {
  login,
  me,
  logout,
  sendOtp,
  verifyOtp,
  resetPassword,
} from "../controllers/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= AUTH =================
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/logout", logout);

// ================= FORGOT PASSWORD FLOW =================

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;