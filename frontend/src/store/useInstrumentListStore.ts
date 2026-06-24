// store/useInstrumentListStore.ts
import { create } from "zustand";
import axiosInstance from "../lib/axios";

export interface InstrumentRow {
  token: string;
  symbol: string;
  name: string;
  expiry: string;
  strike: string;
  lotsize: string;
  instrumenttype: string;
  exch_seg: string;
  tick_size: string;
}

interface InstrumentListState {
  rows: InstrumentRow[];
  page: number;
  totalPages: number;
  total: number;
  query: string;
  loading: boolean;
  error: string | null;
  setQuery: (q: string) => void;
  setPage: (page: number) => void;
  fetchPage: () => Promise<void>;
}

const LIMIT = 50;
let debounceRef: ReturnType<typeof setTimeout> | null = null;

export const useInstrumentListStore = create<InstrumentListState>((set, get) => ({
  rows: [],
  page: 1,
  totalPages: 1,
  total: 0,
  query: "",
  loading: false,
  error: null,

  setQuery: (q) => {
    set({ query: q, page: 1 });
    if (debounceRef) clearTimeout(debounceRef);
    debounceRef = setTimeout(() => get().fetchPage(), 350);
  },

  setPage: (page) => {
    set({ page });
    get().fetchPage();
  },

  fetchPage: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get("/instruments/list", {
        params: { page: get().page, limit: LIMIT, q: get().query },
      });
      if (data.success) {
        set({
          rows: data.data,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total,
          loading: false,
        });
      }
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },
}));