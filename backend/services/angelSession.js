import { SmartAPI } from "smartapi-javascript";
import { TOTP } from "otpauth";
import User from "../models/User.js"; // path adjust karo

let session = {
  accessToken: null,
  refreshToken: null,
  feedToken: null,
  smartApi: null,
  loggedInAt: null,
};

function generateTOTP() {
  const totp = new TOTP({
    secret: process.env.ANGEL_TOTP_SECRET,
    digits: 6,
    period: 30,
    algorithm: "SHA1",
  });
  return totp.generate();
}

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

    session.accessToken = data.data.jwtToken;
    session.refreshToken = data.data.refreshToken;
    session.feedToken = data.data.feedToken;
    session.smartApi = smartApi;
    session.loggedInAt = new Date();

    // ⬅️ NAYA: DB me bhi update karo (jis user ka ye Angel One account hai)
    await User.update(
      {
        jwt_token: session.accessToken,
        refresh_token: session.refreshToken,
        feed_token: session.feedToken,
        token_updated_at: session.loggedInAt,
      },
      { where: { user_id: process.env.ANGEL_CLIENT_ID } } // ya jo bhi tumhara identifying field ho
    );

    console.log("✅ Angel One logged in at", session.loggedInAt.toLocaleTimeString("en-IN"));
    return session;
  } catch (err) {
    console.error("❌ Angel One login error:", err.message);
    throw err;
  }
}

export async function getSession() {
  const now = new Date();
  const TOKEN_TTL_MS = 6 * 60 * 60 * 1000;

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

export async function getSmartApi() {
  const sess = await getSession();
  return sess.smartApi;
}

export async function getFeedToken() {
  const sess = await getSession();
  return sess.feedToken;
}

export const getLTP = async (exchange, tradingsymbol, symboltoken) => {
  const sess = await getSession();

  if (!sess.smartApi) {
    throw new Error("Angel One session not initialized");
  }

  // exchange mapping (watchlist me nse_cm format aata hai)
  const exchangeMap = {
    nse_cm: "NSE",
    bse_cm: "BSE",
    nse_fo: "NFO",
    mcx_fo: "MCX",
  };
  const normalizedExchange = exchangeMap[exchange] || exchange.toUpperCase();

  const response = await sess.smartApi.marketData({
    mode: "LTP",
    exchangeTokens: {
      [normalizedExchange]: [symboltoken],
    },
  });

  if (!response.status) {
    throw new Error(response.message || "LTP fetch failed");
  }

  const fetched = response?.data?.fetched?.[0];
  if (!fetched) {
    throw new Error(`LTP not found for ${tradingsymbol}`);
  }

  return { ltp: fetched.ltp };
};