import express from "express";
import { getKiteLoginUrl, exchangeKiteToken, disconnectKite, getKiteClient } from "../services/kiteSession.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Step 1: Login URL do (frontend redirect karega isi URL pe)
router.get("/login-url", authMiddleware, (req, res) => {
  const url = getKiteLoginUrl(process.env.KITE_API_KEY);
  res.json({ success: true, url });
});

// Step 2: Kite redirect callback (request_token query param ke saath aayega)
router.get("/callback", authMiddleware, async (req, res) => {
  try {
    const { request_token } = req.query;
    if (!request_token) {
      return res.status(400).json({ success: false, message: "request_token missing" });
    }

    await exchangeKiteToken(req.user.id, request_token);

    // success hone pe frontend dashboard pe redirect karo
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?kite=connected`);
  } catch (err) {
    console.error("Kite callback error:", err.message);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?kite=error`);
  }
});

// Disconnect
router.post("/disconnect", authMiddleware, async (req, res) => {
  try {
    await disconnectKite(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Connection status check
router.get("/status", authMiddleware, async (req, res) => {
  try {
    await getKiteClient(req.user.id);
    res.json({ success: true, connected: true });
  } catch {
    res.json({ success: true, connected: false });
  }
});

export default router;