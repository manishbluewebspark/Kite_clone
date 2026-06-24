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

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.log("⚠️ Connect error:", err.message);
});