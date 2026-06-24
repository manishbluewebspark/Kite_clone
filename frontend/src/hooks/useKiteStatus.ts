// import { useState, useEffect } from "react";
// import axiosInstance from "../lib/axios";

// export const useKiteStatus = () => {
//   const [connected, setConnected] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const checkStatus = async () => {
//     try {
//       const { data } = await axiosInstance.get("/api/kite/status");
//       setConnected(data.connected);
//     } catch {
//       setConnected(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const connectKite = async () => {
//     try {
//       const { data } = await axiosInstance.get("/api/kite/login-url");
//       window.location.href = data.url; // Zerodha login page pe redirect
//     } catch (err) {
//       console.error("Kite login URL fetch failed:", err);
//     }
//   };

//   useEffect(() => {
//     checkStatus();
//     // Har 30s pe status check karo (agar callback se connected ho jaye)
//     const interval = setInterval(checkStatus, 30_000);
//     return () => clearInterval(interval);
//   }, []);

//   return { connected, loading, connectKite, checkStatus };
// };

// hooks/useKiteStatus.ts — update karo
import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";

export const useKiteStatus = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const { data } = await axiosInstance.get("/api/kite/status");
      setConnected(data.connected);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // ⬅️ NAYA: URL me access_token ho to automatically backend ko bhejo
  const handleCallbackToken = async () => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");

    if (accessToken) {
      try {
        await axiosInstance.post("/api/kite/set-token", {
          access_token: accessToken,
        });
        console.log("✅ Kite access_token sent to backend");
        setConnected(true);

        // URL clean karo (access_token URL me visible nahi rehna chahiye)
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (err) {
        console.error("Kite token set failed:", err);
      }
    }
  };

  const connectKite = async () => {
    try {
      const { data } = await axiosInstance.get("/api/kite/login-url");
      window.location.href = data.url;
    } catch (err) {
      console.error("Kite login URL fetch failed:", err);
    }
  };

  useEffect(() => {
    handleCallbackToken(); // ⬅️ pehle callback check karo
    checkStatus();
    const interval = setInterval(checkStatus, 30_000);
    return () => clearInterval(interval);
  }, []);

  return { connected, loading, connectKite, checkStatus };
};