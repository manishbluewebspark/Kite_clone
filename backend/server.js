import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import cron from "node-cron";
import { connectDB } from "./config/db.js";
import { angelLogin } from "./services/angelSession.js";
import { setIO } from "./socket.js";

import apiRoutes from "./routes/index.js";
import kiteAuthRoutes from "./routes/kiteAuthRoutes.js";
import { autoSquareOffAllUsers } from "./services/squareOffService.js";
import { startAngelTokenRefreshJob } from "./cron/angelTokenRefresh.js";
import { startAngelMarketSocket, subscribeInstrument } from "./services/angelMarketSocket.js";
import { getExchangeType } from "./utils/exchangeMap.js";
// import { loadKiteInstruments } from "./services/kiteService.js";
import { loadInstruments } from "./services/instrumentService.js";
import DemoTrade from "./models/DemoOrder.js";
import DemoPosition from "./models/DemoPosition.js";
import { isPastMarketClose } from "./utils/marketTiming.js";
import { subscribeKiteToken } from "./services/kiteTickerService.js";

dotenv.config();

// server.js — sabse upar
process.on("uncaughtException", (err) => {
  console.error("🔴 Uncaught Exception (handled, server alive):", err.message);
  // Yahan crash mat hone do — sirf log karo
});

process.on("unhandledRejection", (reason) => {
  console.error("🔴 Unhandled Rejection (handled, server alive):", reason);
});

const app = express();
const server = http.createServer(app);

// ⬅️ CORS origins — dev + prod dono
const allowedOrigins = [
  process.env.FRONTEND_URL,           // .env se
  "http://3.108.103.221",             // EC2 IP HTTP
  "https://3.108.103.221",            // EC2 IP HTTPS
  "http://localhost:5173",            // Vite dev
  "http://localhost:3000",
  "http://kite.softwaregrowthsetu.com",
  "https://kite.softwaregrowthsetu.com",
].filter(Boolean); // undefined/null filter karo

const corsOptions = {
  origin: (origin, callback) => {
    // Postman/curl jaisi no-origin requests bhi allow karo
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("CORS blocked:", origin);
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
});

setIO(io);
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // ✅ Client naye tokens subscribe karna chahta hai
  socket.on("demo:subscribe", ({ tokens }) => {
    if (!Array.isArray(tokens)) return;

    tokens.forEach((token) => {
      socket.join(`demo:${token}`);   // is socket ko is room mein daalo
    });

    console.log(`📡 Client ${socket.id} subscribed to tokens:`, tokens);

    // Angel WebSocket pe bhi subscribe karo agar already nahi hai
    tokens.forEach((token) => {
      try {
        // exchange dhundhna padega — positions se ya client se bhijwao
        subscribeInstrument(token, 1); // 1 = NSE default, ya client se exchange bhijwao
      } catch (err) {
        console.error(`Angel subscribe failed for ${token}:`, err.message);
      }
    });
  });

  socket.on("disconnect", () =>
    console.log("🔌 Client disconnected:", socket.id)
  );
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions)); // ⬅️ same corsOptions use karo

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", apiRoutes);
app.use("/api/kite", kiteAuthRoutes); // Kite OAuth callback + login-url + status

// ── Helpers ───────────────────────────────────────────────────────────────────
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      )
    ),
  ]);
}

// ── Re-subscribe open demo trades using angel smart api ───────────────────────────
async function resubscribeOpenTrades() {
  try {
    const openTrades = await DemoPosition.findAll({ where: { status: "OPEN" } }); // ← DemoTrade → DemoPosition

    const uniqueTokens = new Map();
    openTrades.forEach((t) => uniqueTokens.set(t.token, t.exchange));

    let subscribed = 0;
    for (const [token, exchange] of uniqueTokens) {
      try {
        const exchangeType = getExchangeType(exchange);
        subscribeInstrument(token, exchangeType);
        subscribed++;
      } catch (err) {
        console.error(`Resubscribe failed for ${token}:`, err.message);
      }
    }

    console.log(`📡 Re-subscribed ${subscribed}/${uniqueTokens.size} open demo-trade instruments`);
  } catch (err) {
    console.error("⚠️  resubscribeOpenTrades failed:", err.message);
  }
}


// resubscribeOpenTrades function from kite 
// async function resubscribeOpenTrades() {
//   try {
//     const openTrades = await DemoTrade.findAll({ where: { status: "OPEN" } });

//     const uniqueTokens = new Set();
//     openTrades.forEach((t) => uniqueTokens.add(t.token));

//     let subscribed = 0;
//     for (const token of uniqueTokens) {
//       try {
//         subscribeKiteToken(token); // ⬅️ Kite Ticker pe subscribe
//         subscribed++;
//       } catch (err) {
//         console.error(`Resubscribe failed for ${token}:`, err.message);
//       }
//     }

//     console.log(`📡 Re-subscribed ${subscribed}/${uniqueTokens.size} tokens on Kite Ticker`);
//   } catch (err) {
//     console.error("⚠️ resubscribeOpenTrades failed:", err.message);
//   }
// }

// ── Market data pipeline (non-blocking background task) ───────────────────────
async function initMarketData() {
  // 1. Angel One login (WebSocket V2 + indices feed ke liye)
  try {
    await angelLogin();
  } catch (err) {
    console.error("⚠️  Angel One initial login failed:", err.message);
    // Angel login fail hone par market socket start nahi kar sakte
    // Lekin Kite instruments load hote rahe isliye return nahi karte
  }

  // 2. Daily Angel token refresh cron (8:30 AM IST Mon-Fri)
  startAngelTokenRefreshJob();

  // 3. Kite instrument dump load karo (free public CSV, no auth)
  try {
    // await withTimeout(
    //   loadKiteInstruments(),
    //   60_000,
    //   "loadKiteInstruments"
    // );
    await withTimeout(loadInstruments(), 60_000, "loadInstruments");
  } catch (err) {
    console.error("⚠️  Kite instruments load failed:", err.message);
  }

  // 4. Angel One WebSocket V2 — indices real-time feed (NIFTY/SENSEX/BANK)
  try {
    await withTimeout(
      startAngelMarketSocket(),
      15_000,
      "startAngelMarketSocket"
    );
  } catch (err) {
    console.error("⚠️  Angel WebSocket start failed:", err.message);
  }

  // 5. Open demo trades ko Angel WebSocket pe re-subscribe karo
  await resubscribeOpenTrades();
}



// Har weekday 3:30 PM IST = 10:00 AM UTC
cron.schedule("0 10 * * 1-5", async () => {
  console.log("⏰ Market close — running auto square-off...");
  await autoSquareOffAllUsers();
}, { timezone: "Asia/Kolkata" });


// ── Server start ──────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ DB Connected");

    // ✅ Ab DB ready hai, safe hai
    if (isPastMarketClose()) {
      await autoSquareOffAllUsers();
    }

    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });

    initMarketData();
  } catch (error) {
    console.error("❌ Server start failed:", error);
    process.exit(1);
  }
};

startServer();