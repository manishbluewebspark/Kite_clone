import { create } from "zustand";
import axiosInstance from "../lib/axios";

export interface Holding {
  name: string;
  full_name: string;
  exchange: string;
  token: string;
  qty: number;
  avg_cost: number;
  ltp: number;
  invested: number;
  cur_val: number;
  pnl: number;
  pnl_percent: number;
  day_chg_percent: string | null;
  day_chg_positive: boolean;
  product: string;
}

export interface HoldingsSummary {
  count: number;
  totalInvested: number;
  totalCurVal: number;
  totalPnl: number;
  pnlPercent: number;
  barCurrentPct: number;
}

interface HoldingsState {
  holdings: Holding[];
  summary: HoldingsSummary | null;
  loading: boolean;
  lastFetched: string | null;
  fetchHoldings: () => Promise<void>;
}

export const useHoldingsStore = create<HoldingsState>((set) => ({
  holdings:    [],
  summary:     null,
  loading:     false,
  lastFetched: null,

  // Angel One se directly live holdings fetch karo — LTP already included hai
  fetchHoldings: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get("/api/market/holdings", {
        withCredentials: true,
      });

      if (data.success) {
       set({ holdings: data.data, summary: data.summary });
      }
    } catch (err: any) {
      set({ loading: false });
      console.error("Holdings store error:", err.message);
    }
  },
}));