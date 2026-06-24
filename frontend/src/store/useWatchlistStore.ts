// store/useWatchlistStore.ts
import { create } from "zustand";
import axiosInstance from "../lib/axios";

export interface WatchlistEntry {
  id: number;
  symbol: string;
  exchange: string;
  token: string;
  groupNo: number;
}

export interface LiveQuote {
  ltp: number;
  change: number;
  changePct: number;
  isUp: boolean;
  symbol: string;
}

interface HoldingAddResult {
  name: string;
  full_name?: string;
  token: string;
  exch_seg: string;
  lotsize?: number;
  qty?: number;
  avg_cost?: number;
  ltp?: number;
  category?: string;
}

interface WatchlistState {
  groupNo: number;
  entries: WatchlistEntry[];
  quotes: Record<string, LiveQuote>;
  loading: boolean;
  error: string | null;
  setGroup: (groupNo: number) => void;
  fetchWatchlist: () => Promise<void>;
  addStock: (symbol: string, exchange: string, token: string) => Promise<void>;
  addStockFromHolding: (holding: HoldingAddResult) => Promise<void>;
  removeStock: (id: number) => Promise<void>;
  fetchQuotes: () => Promise<void>;
}

let quotesInterval: ReturnType<typeof setInterval> | null = null;

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  groupNo: 1,
  entries: [],
  quotes: {},
  loading: false,
  error: null,

  setGroup: (groupNo) => {
    set({ groupNo });
    get().fetchWatchlist();
  },

  fetchWatchlist: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get("/watchlist", {
        params: { groupNo: get().groupNo },
      });
      if (data.success) {
        set({ entries: data.data, loading: false });
        get().fetchQuotes();
      }
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  addStock: async (symbol, exchange, token) => {
    try {
      const { data } = await axiosInstance.post("/watchlist", {
        symbol, exchange, token, groupNo: get().groupNo,
      });
      if (data.success) {
        set({ entries: [...get().entries, data.data] });
        get().fetchQuotes();
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // ── AddWatchlist modal ke onAdd se call hoga (holding response ke saath) ──
  addStockFromHolding: async (holding) => {
    try {
      const { data } = await axiosInstance.post("/watchlist", {
        symbol: holding.name,
        exchange: holding.exch_seg,
        token: holding.token,
        groupNo: get().groupNo,
      });
      if (data.success) {
        set({ entries: [...get().entries, data.data] });
        get().fetchQuotes();
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  removeStock: async (id) => {
    try {
      await axiosInstance.delete(`/watchlist/${id}`);
      set({ entries: get().entries.filter((e) => e.id !== id) });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchQuotes: async () => {
    const { entries } = get();
    if (!entries.length) return set({ quotes: {} });

    try {
      const tokens = entries.map((e) => ({ exchange: e.exchange, token: e.token }));
      const { data } = await axiosInstance.post("/market/quotes", { tokens });
      if (data.success) {
        set({ quotes: data.data });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));

export const startWatchlistPolling = () => {
  if (quotesInterval) return;
  quotesInterval = setInterval(() => {
    useWatchlistStore.getState().fetchQuotes();
  }, 5_000);
};

export const stopWatchlistPolling = () => {
  if (quotesInterval) clearInterval(quotesInterval);
  quotesInterval = null;
};