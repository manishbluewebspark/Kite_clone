import { SmartAPI } from "smartapi-javascript";
import { TOTP } from "otpauth";

// ── In-memory session store ───────────────────────────────────────────────────
let session = {
  accessToken: null,
  refreshToken: null,
  feedToken: null,
  smartApi: null,
  loggedInAt: null,
};

// ── Generate TOTP from secret ─────────────────────────────────────────────────
function generateTOTP() {
  const totp = new TOTP({
    secret: process.env.ANGEL_TOTP_SECRET,
    digits: 6,
    period: 30,
    algorithm: "SHA1",
  });
  return totp.generate();
}

// ── Login to Angel One ────────────────────────────────────────────────────────
export async function angelLogin() {
  try {
    console.log("🔐 Angel One login attempt...");

    const smartApi = new SmartAPI({
      api_key: process.env.ANGEL_API_KEY,
    });

    const totp = generateTOTP();
    console.log("📟 TOTP generated:", totp);

    const data = await smartApi.generateSession(
      process.env.ANGEL_CLIENT_ID,
      process.env.ANGEL_MPIN,
      totp
    );

    if (!data || data.status === false) {
      throw new Error(data?.message || "Angel One login failed");
    }

    // Save session
    session.accessToken  = data.data.jwtToken;
    session.refreshToken = data.data.refreshToken;
    session.feedToken    = data.data.feedToken;
    session.smartApi     = smartApi;
    session.loggedInAt   = new Date();

    console.log("✅ Angel One logged in at", session.loggedInAt.toLocaleTimeString("en-IN"));
    return session;
  } catch (err) {
    console.error("❌ Angel One login error:", err.message);
    throw err;
  }
}

// ── Get current session (auto re-login if expired) ───────────────────────────
export async function getSession() {
  const now = new Date();
  const TOKEN_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

  const isExpired =
    !session.accessToken ||
    !session.loggedInAt ||
    now - session.loggedInAt > TOKEN_TTL_MS;

  if (isExpired) {
    console.log("🔄 Session expired, re-logging in...");
    await angelLogin();
  }

  return session;
}

// ── Get SmartAPI instance (ready to use) ─────────────────────────────────────
export async function getSmartApi() {
  const sess = await getSession();
  return sess.smartApi;
}

// ── LTP fetch ────────────────────────────────────────────────────────────────
export const getLTP = async (exchange, tradingsymbol, symboltoken) => {
  const sess = await getSession();
  
  if (!sess.smartApi) {
    throw new Error("Angel One session not initialized");
  }

  const response = await sess.smartApi.getLTPData({
    exchange,
    tradingsymbol,
    symboltoken,
  });

  if (!response.status) {
    throw new Error(response.message || "LTP fetch failed");
  }

  return response.data;
};