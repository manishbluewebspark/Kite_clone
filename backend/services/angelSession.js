import { SmartAPI } from "smartapi-javascript";
import { TOTP } from "otpauth";
import User from "../models/User.js"; // path adjust karo
import { fetchQuote } from "./marketDataGateway.js";

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

// export async function angelLogin() {
//   try {
//     console.log("🔐 Angel One login attempt...");

//     const smartApi = new SmartAPI({
//       api_key: process.env.ANGEL_API_KEY,
//     });

//     const totp = generateTOTP();
//     console.log("📟 TOTP generated:", totp);

//     const data = await smartApi.generateSession(
//       process.env.ANGEL_CLIENT_ID,
//       process.env.ANGEL_MPIN,
//       totp
//     );

//     if (!data || data.status === false) {
//       throw new Error(data?.message || "Angel One login failed");
//     }

//     session.accessToken = data.data.jwtToken;
//     session.refreshToken = data.data.refreshToken;
//     session.feedToken = data.data.feedToken;
//     session.smartApi = smartApi;
//     session.loggedInAt = new Date();

//     await User.update(
//       {
//         jwt_token: session.accessToken,
//         refresh_token: session.refreshToken,
//         feed_token: session.feedToken,
//         token_updated_at: session.loggedInAt,
//       },
//       { where: { user_id: process.env.ANGEL_CLIENT_ID } }
//     );

//     console.log("✅ Angel One logged in at", session.loggedInAt.toLocaleTimeString("en-IN"));
//     return session;
//   } catch (err) {
//     console.error("❌ Angel One login error:", err.message);
//     throw err;
//   }
// }


let loginPromise = null; // in-flight login ka reference

export async function angelLogin() {
  // Agar already ek login chal raha hai, usi promise ko await karo —
  // naya parallel login trigger mat karo
  if (loginPromise) {
    console.log("⏳ Login already in progress, waiting for it...");
    return loginPromise;
  }

  loginPromise = (async () => {
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

      await User.update(
        {
          jwt_token: session.accessToken,
          refresh_token: session.refreshToken,
          feed_token: session.feedToken,
          token_updated_at: session.loggedInAt,
        },
        { where: { user_id: process.env.ANGEL_CLIENT_ID } }
      );

      console.log("✅ Angel One logged in at", session.loggedInAt.toLocaleTimeString("en-IN"));
      return session;
    } catch (err) {
      console.error("❌ Angel One login error:", err.message);
      throw err;
    } finally {
      loginPromise = null; // ✅ chahe success ho ya fail, lock release karo
    }
  })();

  return loginPromise;
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

// ── FIX (production): ab getLTP() seedha smartApi.marketData() call NAHI
// karta — marketDataGateway ke through jaata hai. Iska matlab:
//   - Demo order placement (BUY/SELL click) aur watchlist polling ek hi
//     rate-limited queue share karte hain — combined Angel One rate
//     limit kabhi cross nahi hogi
//   - Agar watchlist ne abhi-abhi (900ms ke andar) yahi token fetch kiya
//     hai, to cached value milegi — extra Angel One call nahi jaayegi
//   - Agar circuit breaker active hai (recent 403 ki wajah se), to yeh
//     turant fail-fast error throw karega instead of hanging/retrying
//     aur block ko aur lamba karne ke instead user ko clear error dikhega
export const getLTP = async (exchange, tradingsymbol, symboltoken) => {
  // exchange mapping (watchlist me nse_cm format aata hai)
  const exchangeMap = {
    nse_cm: "NSE",
    bse_cm: "BSE",
    nse_fo: "NFO",
    mcx_fo: "MCX",
  };
  const normalizedExchange = exchangeMap[exchange] || exchange.toUpperCase();

  try {
    const fetched = await fetchQuote(normalizedExchange, symboltoken);
    return { ltp: parseFloat(fetched.ltp || 0) };
  } catch (err) {
    throw new Error(`LTP not found for ${tradingsymbol}: ${err.message}`);
  }
};