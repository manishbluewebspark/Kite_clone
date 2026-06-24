// import express from "express";
// import http from "http";
// import dotenv from "dotenv";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import { Server } from "socket.io";

// import { connectDB } from "./config/db.js";
// import { angelLogin } from "./services/angelSession.js";
// import { loadInstruments } from "./services/instrumentService.js";
// import { setIO } from "./socket.js";

// import apiRoutes from "./routes/index.js";
// import { startAngelTokenRefreshJob } from "./cron/angelTokenRefresh.js";
// import { startAngelMarketSocket, subscribeInstrument } from "./services/angelMarketSocket.js";
// import { getExchangeType } from "./utils/exchangeMap.js";
// import DemoTrade from "./models/DemoTrade.js";



// dotenv.config();

// // 🛡️ Production safety net — library ke internal bugs se poora server crash na ho
// process.on('uncaughtException', (err) => {
//   console.error('🔴 Uncaught Exception:', err.message);
// });

// process.on('unhandledRejection', (reason) => {
//   console.error('🔴 Unhandled Rejection:', reason);
// });

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: process.env.FRONTEND_URL, credentials: true },
// });

// setIO(io);
// app.set("io", io);

// io.on("connection", (socket) => {
//   console.log("🔌 Client connected:", socket.id);
//   socket.on("disconnect", () => console.log("🔌 Client disconnected:", socket.id));
// });

// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// app.use("/api", apiRoutes);

// // 🔧 Helper: timeout ke saath kisi bhi async step ko wrap karo,
// // taaki ek atka hua step poore server ko hang na kar de.
// function withTimeout(promise, ms, label) {
//   return Promise.race([
//     promise,
//     new Promise((_, reject) =>
//       setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
//     ),
//   ]);
// }

// // 🔁 Open demo trades ko market socket se re-subscribe karo
// async function resubscribeOpenTrades() {
//   const openTrades = await DemoTrade.findAll({ where: { status: "OPEN" } });

//   const uniqueTokens = new Map();
//   openTrades.forEach((t) => uniqueTokens.set(t.token, t.exchange));

//   let subscribed = 0;
//   for (const [token, exchange] of uniqueTokens) {
//     try {
//       const exchangeType = getExchangeType(exchange);
//       subscribeInstrument(token, exchangeType);
//       subscribed += 1;
//     } catch (err) {
//       console.error(`Resubscribe failed for ${token}:`, err.message);
//     }
//   }
//   console.log(`📡 Re-subscribed ${subscribed}/${uniqueTokens.size} open demo-trade instruments`);
// }

// // 🚀 Market-data pipeline (Angel One login + socket + cron + resubscribe).
// // Yeh saare steps "nice to have" hain — agar yeh fail/hang ho, server APIs
// // phir bhi serve karte rahein. Isliye yeh non-blocking background task hai.
// async function initMarketData() {
//   try {
//     await angelLogin();
//   } catch (err) {
//     console.error("⚠️  Angel One initial login failed:", err.message);
//     return;
//   }

//   startAngelTokenRefreshJob();

//   try {
//     await loadInstruments();
//     await withTimeout(startAngelMarketSocket(), 15_000, "startAngelMarketSocket");
//     await resubscribeOpenTrades();
//   } catch (err) {
//     console.error("⚠️  Market-data pipeline failed:", err.message);
//   }
// }

// const startServer = async () => {
//   try {
//     await connectDB();
//     server.listen(process.env.PORT, () => {
//       console.log(`🚀 Server running on port ${process.env.PORT}`);
//     });
//     // Market-data setup background mein — server start ko block nahi karega
//     initMarketData();
//   } catch (error) {
//     console.error("❌ Server start failed:", error);
//     process.exit(1);
//   }
// };

// startServer();



import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import { angelLogin } from "./services/angelSession.js";
import { setIO } from "./socket.js";

import apiRoutes from "./routes/index.js";
import kiteAuthRoutes from "./routes/kiteAuthRoutes.js";

import { startAngelTokenRefreshJob } from "./cron/angelTokenRefresh.js";
import { startAngelMarketSocket, subscribeInstrument } from "./services/angelMarketSocket.js";
import { getExchangeType } from "./utils/exchangeMap.js";
import { loadKiteInstruments } from "./services/kiteService.js";
import DemoTrade from "./models/DemoTrade.js";

import { subscribeKiteToken } from "./services/kiteTickerService.js";

dotenv.config();

// ── Production safety net ─────────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("🔴 Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔴 Unhandled Rejection:", reason);
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

// ── Re-subscribe open demo trades on server restart ───────────────────────────
// async function resubscribeOpenTrades() {
//   try {
//     const openTrades = await DemoTrade.findAll({ where: { status: "OPEN" } });

//     const uniqueTokens = new Map();
//     openTrades.forEach((t) => uniqueTokens.set(t.token, t.exchange));

//     let subscribed = 0;
//     for (const [token, exchange] of uniqueTokens) {
//       try {
//         const exchangeType = getExchangeType(exchange);
//         subscribeInstrument(token, exchangeType);
//         subscribed++;
//       } catch (err) {
//         console.error(`Resubscribe failed for ${token}:`, err.message);
//       }
//     }

//     console.log(
//       `📡 Re-subscribed ${subscribed}/${uniqueTokens.size} open demo-trade instruments`
//     );
//   } catch (err) {
//     console.error("⚠️  resubscribeOpenTrades failed:", err.message);
//   }
// }


// resubscribeOpenTrades function update karo
async function resubscribeOpenTrades() {
  try {
    const openTrades = await DemoTrade.findAll({ where: { status: "OPEN" } });

    const uniqueTokens = new Set();
    openTrades.forEach((t) => uniqueTokens.add(t.token));

    let subscribed = 0;
    for (const token of uniqueTokens) {
      try {
        subscribeKiteToken(token); // ⬅️ Kite Ticker pe subscribe
        subscribed++;
      } catch (err) {
        console.error(`Resubscribe failed for ${token}:`, err.message);
      }
    }

    console.log(`📡 Re-subscribed ${subscribed}/${uniqueTokens.size} tokens on Kite Ticker`);
  } catch (err) {
    console.error("⚠️ resubscribeOpenTrades failed:", err.message);
  }
}

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
    await withTimeout(
      loadKiteInstruments(),
      60_000,
      "loadKiteInstruments"
    );
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

// ── Server start ──────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ DB Connected");

    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });

    // Market data background me — server start block nahi hoga
    initMarketData();
  } catch (error) {
    console.error("❌ Server start failed:", error);
    process.exit(1);
  }
};

startServer();