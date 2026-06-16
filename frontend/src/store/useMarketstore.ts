import { create } from "zustand";
import { socket } from "../lib/socket";

export interface MarketIndex {
  name: string;
  last: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  isUp: boolean;
}

interface MarketState {
  indices: MarketIndex[];
  lastFetched: string | null;
  connected: boolean;
  error: string | null;
  initSocketListeners: () => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  indices: [],
  lastFetched: null,
  connected: false,
  error: null,

  initSocketListeners: () => {
    socket.on("connect", () => set({ connected: true }));
    socket.on("disconnect", () => set({ connected: false }));

    socket.on("market:update", (payload) => {
      if (payload.success) {
        set({ indices: payload.data, lastFetched: payload.fetchedAt, error: null });
      } else {
        set({ error: payload.message });
      }
    });
  },
}));