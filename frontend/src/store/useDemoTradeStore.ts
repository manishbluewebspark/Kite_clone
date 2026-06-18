import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { socket } from "../lib/socket";

export interface DemoTrade {
  id: number;
  symbol: string;
  name: string;
  exchange: string;
  token: string;
  transaction_type: "BUY" | "SELL";
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  status: "OPEN" | "CLOSED";
  pnl: number;
  opened_at: string;
  closed_at: string | null;
}

interface LiveQuote {
  ltp: number;
  change: number;
  changePct: number;
  isUp: boolean;
}

interface DemoTradeState {
  trades: DemoTrade[];
  liveQuotes: Record<string, LiveQuote>;
  loading: boolean;
  error: string | null;
  fetchTrades: (status?: "OPEN" | "CLOSED") => Promise<void>;
  initLiveQuoteListener: () => void;
  openTrade: (data: {
    symbol: string;
    name: string;
    exchange: string;
    token: string;
    transaction_type: "BUY" | "SELL";
    quantity: number;
  }) => Promise<DemoTrade | null>;
  closeTrade: (id: number) => Promise<void>;
}

export const useDemoTradeStore = create<DemoTradeState>((set, get) => ({
  trades: [],
  liveQuotes: {},
  loading: false,
  error: null,

  fetchTrades: async (status) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get("/api/demo-trades", {
        params: status ? { status } : {},
      });
      if (data.success) {
        set({ trades: data.data, loading: false });
      }
    } catch (err: any) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // ── Socket listener — sirf ek baar register hoga ──────────────────────────
  initLiveQuoteListener: () => {
    socket.off("demo:tick"); // safe re-init, duplicate listeners se bachne ke liye
    socket.on("demo:tick", (payload) => {
      if (payload.success) {
        set((state) => ({
          liveQuotes: { ...state.liveQuotes, ...payload.data },
        }));
      }
    });
  },

  openTrade: async (tradeData) => {
    set({ error: null });
    try {
      const { data } = await axiosInstance.post("/api/demo-trades/open", tradeData);
      if (data.success) {
        set({ trades: [data.data, ...get().trades] });
        return data.data;
      }
      return null;
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message });
      return null;
    }
  },

  closeTrade: async (id) => {
    set({ error: null });
    try {
      const { data } = await axiosInstance.post(`/api/demo-trades/${id}/close`);
      if (data.success) {
        set({
          trades: get().trades.map((t) => (t.id === id ? data.data : t)),
        });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message });
    }
  },
}));