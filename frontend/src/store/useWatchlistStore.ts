// // store/useWatchlistStore.ts
// import { create } from "zustand";
// import axiosInstance from "../lib/axios";

// export interface WatchlistEntry {
//   id: number;
//   symbol: string;
//   exchange: string;
//   token: string;
//   groupNo: number;
// }

// export interface LiveQuote {
//   ltp: number;
//   change: number;
//   changePct: number;
//   isUp: boolean;
//   symbol: string;
// }

// interface HoldingAddResult {
//   name: string;
//   full_name?: string;
//   token: string;
//   exch_seg: string;
//   lotsize?: number;
//   qty?: number;
//   avg_cost?: number;
//   ltp?: number;
//   category?: string;
// }

// interface WatchlistState {
//   groupNo: number;
//   entries: WatchlistEntry[];
//   quotes: Record<string, LiveQuote>;
//   loading: boolean;
//   error: string | null;
//   setGroup: (groupNo: number) => void;
//   fetchWatchlist: () => Promise<void>;
//   addStock: (symbol: string, exchange: string, token: string) => Promise<void>;
//   addStockFromHolding: (holding: HoldingAddResult) => Promise<void>;
//   removeStock: (id: number) => Promise<void>;
//   fetchQuotes: () => Promise<void>;
// }

// let quotesInterval: ReturnType<typeof setInterval> | null = null;

// export const useWatchlistStore = create<WatchlistState>((set, get) => ({
//   groupNo: 1,
//   entries: [],
//   quotes: {},
//   loading: false,
//   error: null,

//   setGroup: (groupNo) => {
//     set({ groupNo });
//     get().fetchWatchlist();
//   },

//   fetchWatchlist: async () => {
//     set({ loading: true, error: null });
//     try {
//       const { data } = await axiosInstance.get("/watchlist", {
//         params: { groupNo: get().groupNo },
//       });
//       if (data.success) {
//         set({ entries: data.data, loading: false });
//         get().fetchQuotes();
//       }
//     } catch (err: any) {
//       set({ loading: false, error: err.message });
//     }
//   },

//   addStock: async (symbol, exchange, token) => {
//     try {
//       const { data } = await axiosInstance.post("/watchlist", {
//         symbol, exchange, token, groupNo: get().groupNo,
//       });
//       if (data.success) {
//         set({ entries: [...get().entries, data.data] });
//         get().fetchQuotes();
//       }
//     } catch (err: any) {
//       set({ error: err.message });
//     }
//   },

//   // ── AddWatchlist modal ke onAdd se call hoga (holding response ke saath) ──
//   addStockFromHolding: async (holding) => {
//     try {
//       const { data } = await axiosInstance.post("/watchlist", {
//         symbol: holding.name,
//         exchange: holding.exch_seg,
//         token: holding.token,
//         groupNo: get().groupNo,
//       });
//       if (data.success) {
//         set({ entries: [...get().entries, data.data] });
//         get().fetchQuotes();
//       }
//     } catch (err: any) {
//       set({ error: err.message });
//     }
//   },

//   removeStock: async (id) => {
//     try {
//       await axiosInstance.delete(`/watchlist/${id}`);
//       set({ entries: get().entries.filter((e) => e.id !== id) });
//     } catch (err: any) {
//       set({ error: err.message });
//     }
//   },

//   fetchQuotes: async () => {
//     const { entries } = get();
//     if (!entries.length) return set({ quotes: {} });

//     try {
//       const tokens = entries.map((e) => ({ exchange: e.exchange, token: e.token }));
//       const { data } = await axiosInstance.post("/market/quotes", { tokens });
//       if (data.success) {
//         set({ quotes: data.data });
//       }
//     } catch (err: any) {
//       set({ error: err.message });
//     }
//   },
// }));

// export const startWatchlistPolling = () => {
//   if (quotesInterval) return;
//   quotesInterval = setInterval(() => {
//     useWatchlistStore.getState().fetchQuotes();
//   }, 1_000);
// };

// export const stopWatchlistPolling = () => {
//   if (quotesInterval) clearInterval(quotesInterval);
//   quotesInterval = null;
// };


// store/useWatchlistStore.ts
//
// FIX (truly live): REST polling completely hata di gayi hai. Ab watchlist
// quotes WebSocket ke "watchlist:tick" event se aate hain — backend mein
// angelMarketSocket.js har naye tick ko turant broadcast karta hai
// (1s batching interval hai sirf taaki UI 1s se zyada fast re-render na
// kare, lekin underlying data Angel One se truly real-time aa raha hai,
// koi REST API call ki zaroorat hi nahi).
//
// Isse Angel One ka rate-limit (403) issue bhi permanently khatam ho gaya
// hai — WebSocket subscriptions ek baar hone ke baad Angel One khud
// continuously ticks push karta hai, koi repeated REST request nahi lagti.

import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { socket } from "../lib/socket";

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
  isDown?: boolean;
  isFlat?: boolean;
  open?: number;
  dayHigh?: number;
  dayLow?: number;
  prevClose?: number;
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
  initLiveQuoteListener: () => void;
}

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

  // ── Watchlist fetch karo — backend khud WebSocket subscribe kar deta hai
  // is route ke andar (syncWatchlistTokens), frontend ko alag se kuch
  // karne ki zaroorat nahi
  fetchWatchlist: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get("/watchlist", {
        params: { groupNo: get().groupNo },
      });
      if (data.success) {
        const uniqueEntries = data.data.filter(
          (entry: WatchlistEntry, index: number, arr: WatchlistEntry[]) =>
            arr.findIndex((e) => e.token === entry.token && e.exchange === entry.exchange) === index
        );
        set({ entries: uniqueEntries, loading: false });
        // ── REST fetchQuotes() call hata diya — ab zaroorat nahi,
        // WebSocket khud ticks bhejega jaise hi subscribe hoga
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
        const exists = get().entries.some(
          (e) => e.token === data.data.token && e.exchange === data.data.exchange
        );
        if (!exists) {
          set({ entries: [...get().entries, data.data] });
          // Backend route khud subscribeWatchlistTokens() call kar deta hai
        }
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addStockFromHolding: async (holding) => {
    try {
      const alreadyExists = get().entries.some(
        (e) => e.token === holding.token && e.exchange === holding.exch_seg
      );
      if (alreadyExists) return;

      const { data } = await axiosInstance.post("/watchlist", {
        symbol: holding.name,
        exchange: holding.exch_seg,
        token: holding.token,
        groupNo: get().groupNo,
      });
      if (data.success) {
        set({ entries: [...get().entries, data.data] });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  removeStock: async (id) => {
    try {
      await axiosInstance.delete(`/watchlist/${id}`);
      set({ entries: get().entries.filter((e) => e.id !== id) });
      // Backend route khud unsubscribeWatchlistTokens() call kar deta hai
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // ── NAYA: Socket listener — "watchlist:tick" event se live quotes ────────
  // Yeh REST polling (fetchQuotes + setInterval) ki jagah hai. Backend
  // angelMarketSocket.js har 1s mein accumulated ticks broadcast karta hai.
  initLiveQuoteListener: () => {
    socket.off("watchlist:tick"); // duplicate listeners se bachne ke liye
    socket.on("watchlist:tick", (payload) => {
      if (payload.success) {
        set((state) => ({
          quotes: { ...state.quotes, ...payload.data },
        }));
      }
    });
  },
}));

// ── REST polling functions (startWatchlistPolling / stopWatchlistPolling)
// completely hata diye gaye hain — ab koi zaroorat nahi. Inki jagah
// component mein initLiveQuoteListener() call karo (jaise demo-trade
// store mein already pattern hai).