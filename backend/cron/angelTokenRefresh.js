import schedule from "node-schedule";
import { angelLogin } from "../services/angelSession.js";
import { startAngelMarketSocket, stopAngelMarketSocket } from "../services/angelMarketSocket.js";


export const startAngelTokenRefreshJob = () => {
  schedule.scheduleJob("30 8 * * 1-5", async () => {
    console.log("⏰ Angel One daily token refresh...");
    try {
      await angelLogin();
      stopAngelMarketSocket();
      await startAngelMarketSocket();
      console.log("✅ Token refreshed & WebSocket reconnected");
    } catch (err) {
      console.error("❌ Token refresh failed:", err.message);
    }
  });

//   console.log("📅 Angel One token-refresh cron job scheduled (Mon-Fri 8:30 AM)");
};