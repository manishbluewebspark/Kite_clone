import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import schedule from "node-schedule";
import { Server } from "socket.io";

import sequelize from "./config/db.js";
import { angelLogin } from "./services/angelSession.js";
import { startMarketBroadcast } from "./services/marketBroadcast.js";
import { loadInstruments } from "./services/instrumentService.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import fundRoutes from "./routes/fundRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import instrumentRoutes from "./routes/instrumentRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app); // ⬅️ raw server banaya

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
});

// global access ke liye (ya separate socket.js module bhi bana sakte ho)
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
  socket.on("disconnect", () => console.log("🔌 Client disconnected:", socket.id));
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/funds", fundRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/instruments", instrumentRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL Connected");

    await sequelize.sync({ alter: true });
    console.log("✅ Models Synced");

    try {
      await angelLogin();
    } catch (err) {
      console.error("⚠️  Angel One initial login failed:", err.message);
    }

    schedule.scheduleJob("30 8 * * 1-5", async () => {
      console.log("⏰ Angel One daily token refresh...");
      try {
        await angelLogin();
        console.log("✅ Token refreshed successfully");
      } catch (err) {
        console.error("❌ Token refresh failed:", err.message);
      }
    });

    await loadInstruments();
    // market data ka periodic fetch + socket emit
    startMarketBroadcast(io);

    server.listen(process.env.PORT, () => { // ⬅️ app.listen nahi, server.listen
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Server start failed:", error);
    process.exit(1);
  }
};

startServer();