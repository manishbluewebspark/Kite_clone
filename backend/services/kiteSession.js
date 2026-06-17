import { KiteConnect } from "kiteconnect";
import crypto from "crypto";
import KiteSession from "../models/KiteSession.js";

// ── Step 1: Login URL generate karo (frontend isko redirect karega) ─────────
export const getKiteLoginUrl = (apiKey) => {
  const kc = new KiteConnect({ api_key: apiKey });
  return kc.getLoginURL();
};

// ── Step 2: request_token aaya redirect se, ab access_token exchange karo ───
export const exchangeKiteToken = async (userId, apiKey, apiSecret, requestToken) => {
  const kc = new KiteConnect({ api_key: apiKey });

  const session = await kc.generateSession(requestToken, apiSecret);
  // session.access_token, session.public_token, session.user_id milega

  await KiteSession.upsert({
    user_id: userId,
    kite_api_key: apiKey,
    kite_api_secret: apiSecret,
    access_token: session.access_token,
    public_token: session.public_token,
    kite_user_id: session.user_id,
    login_time: new Date(),
    is_active: true,
  });

  return session;
};

// ── User ka KiteConnect instance ready karo (saved session se) ──────────────
export const getKiteClient = async (userId) => {
  const sess = await KiteSession.findOne({ where: { user_id: userId, is_active: true } });

  if (!sess || !sess.access_token) {
    throw new Error("Kite account not connected. Please login again.");
  }

  const kc = new KiteConnect({ api_key: sess.kite_api_key });
  kc.setAccessToken(sess.access_token);

  return kc;
};

// ── Disconnect ──────────────────────────────────────────────────────────────
export const disconnectKite = async (userId) => {
  await KiteSession.update(
    { is_active: false, access_token: null },
    { where: { user_id: userId } }
  );
};