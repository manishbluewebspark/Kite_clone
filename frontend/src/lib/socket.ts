// import { io } from "socket.io-client";

// export const socket = io(import.meta.env.VITE_API_URL, {
//   withCredentials: true,
// });

// // ── TEMPORARY DEBUG — disconnect reason dekhne ke liye ───────────────────────
// socket.on("connect", () => {
//   console.log("✅ Socket connected:", socket.id);
// });

// socket.on("disconnect", (reason) => {
//   console.log("❌ Socket disconnected. Reason:", reason);
// });

// socket.on("connect_error", (err) => {
//   console.log("⚠️ Connect error:", err.message);
// });
// // lib/socket.ts me add karo
// socket.on("market:update", (payload) => {
//   console.log("📊 market:update received:", payload);
// });


import { io } from "socket.io-client";

// Socket ke liye sirf origin chahiye, API path nahi
// Prod me same origin se connect karo (empty string = current domain)
// Dev me localhost:5000 backend directly
const SOCKET_URL = import.meta.env.PROD
  ? ""                          // prod: same origin (nginx proxy karega /socket.io/)
  : "http://localhost:5000";    // dev: direct backend

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected. Reason:", reason);
});

socket.on("connect_error", (err) => {
  console.log("⚠️ Connect error:", err.message);
});

socket.on("market:update", (payload) => {
  console.log("📊 market:update received:", payload);
});