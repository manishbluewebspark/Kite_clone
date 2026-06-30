import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { socket } from "../lib/socket";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface DemoOrder {
    id: number;
    user_id: number;
    symbol: string;
    name: string;
    exchange: string;
    token: string;
    transaction_type: "BUY" | "SELL";
    quantity: number;
    product: "MIS" | "NRML";
    order_type: "MARKET" | "LIMIT" | "SL" | "SL-M";
    validity: "DAY" | "IOC" | "MINUTES";
    price: number;
    trigger_price: number;
    executed_price: number;
    status: "COMPLETE" | "REJECTED" | "CANCELLED";
    createdAt: string;
    updatedAt: string;
}

export interface DemoPosition {
    id: number;
    user_id: number;
    symbol: string;
    name: string;
    exchange: string;
    token: string;
    product: "MIS" | "NRML";
    transaction_type: "BUY" | "SELL" | null; // null when flat (qty = 0)
    quantity: number;       // positive = long, negative = short, 0 = flat
    average_price: number;
    buy_quantity: number;
    buy_value: number;
    sell_quantity: number;
    sell_value: number;
    realised_pnl: number;
    unrealised_pnl: number;
    last_price: number;     // updated via socket
    status: "OPEN" | "CLOSED";
    updatedAt: string;
    created_at: string;  // snake_case
    closed_at: string | null;
}

export interface PlaceOrderPayload {
    symbol: string;
    name: string;
    exchange: string;
    token: string;
    transaction_type: "BUY" | "SELL";
    quantity: number;
    product?: "MIS" | "NRML";
    order_type?: "MARKET" | "LIMIT" | "SL" | "SL-M";
    validity?: "DAY" | "IOC" | "MINUTES";
    price?: number;
    trigger_price?: number;
}

interface LiveQuote {
    ltp: number;
    change: number;
    changePct: number;
    isUp: boolean;
}

// ─── Store Interface ───────────────────────────────────────────────────────────

interface DemoTradeState {
    orders: DemoOrder[];
    positions: DemoPosition[];
    liveQuotes: Record<string, LiveQuote>;
    loading: boolean;
    error: string | null;

    fetchOrders: () => Promise<void>;
    fetchPositions: (status?: "OPEN" | "CLOSED") => Promise<void>;
    fetchAll: () => Promise<void>;
    initLiveQuoteListener: () => void;
    placeOrder: (
        data: PlaceOrderPayload
    ) => Promise<{
        order: DemoOrder;
        position: DemoPosition;
    } | null>;
    deleteOrder: (id: number) => Promise<void>;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useDemoTradeStore = create<DemoTradeState>((set, get) => ({
    orders: [],
    positions: [],
    liveQuotes: {},
    loading: false,
    error: null,

    // ── Fetch all orders (order book) ──────────────────────────────────────────
    fetchOrders: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await axiosInstance.get("/demo-trades/orders");
            if (data.success) {
                set({ orders: data.data, loading: false });
            }
        } catch (err: any) {
            set({ loading: false, error: err.response?.data?.message || err.message });
        }
    },

    // ── Fetch positions (positions tab) ───────────────────────────────────────
    // fetchPositions: async (status) => {
    //     set({ loading: true, error: null });
    //     try {
    //         const { data } = await axiosInstance.get("/demo-trades/positions", {
    //             params: status ? { status } : {},
    //         });
    //         if (data.success) {
    //             set({ positions: data.data, loading: false });
    //         }
    //     } catch (err: any) {
    //         set({ loading: false, error: err.response?.data?.message || err.message });
    //     }
    // },

    // fetchPositions: async (status) => {
    //     set({ error: null });
    //     try {
    //         const { data } = await axiosInstance.get("/demo-trades/positions", {
    //             params: status ? { status } : {},
    //         });
    //         if (data.success) {
    //             set({ positions: data.data });

    //             // ✅ Saare open positions ke tokens subscribe karo
    //             const openTokens = data.data
    //                 .filter((p: DemoPosition) => p.status === "OPEN")
    //                 .map((p: DemoPosition) => ({ token: p.token, exchange: p.exchange }));

    //             if (openTokens.length > 0) {
    //                 socket.emit("demo:subscribe", { tokens: openTokens });
    //             }

    //         }
    //     } catch (err: any) {
    //         set({ loading: false, error: err.response?.data?.message || err.message });
    //     }
    // },


    fetchPositions: async (status) => {
        set({ error: null });
        try {
            const { data } = await axiosInstance.get("/demo-trades/positions", {
                params: status ? { status } : {},
            });
            if (data.success) {
                const prevTokens = new Set(get().positions.map((p) => p.token));
                set({ positions: data.data });

                const newOpenTokens = data.data
                    .filter((p: DemoPosition) => p.status === "OPEN" && !prevTokens.has(p.token))
                    .map((p: DemoPosition) => ({ token: p.token, exchange: p.exchange }));

                if (newOpenTokens.length > 0) {
                    socket.emit("demo:subscribe", { tokens: newOpenTokens });
                }
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message });
        }
    },
    fetchAll: async () => {
        set({ loading: true, error: null });
        try {
            const [ordersRes, positionsRes] = await Promise.all([
                axiosInstance.get("/demo-trades/orders"),
                axiosInstance.get("/demo-trades/positions"),
            ]);

            const positions = positionsRes.data.success ? positionsRes.data.data : [];

            set({
                orders: ordersRes.data.success ? ordersRes.data.data : [],
                positions,
                loading: false,
            });

            // ✅ Initial load pe saare open tokens subscribe karo
            const openTokens = positions
                .filter((p: DemoPosition) => p.status === "OPEN")
                .map((p: DemoPosition) => p.token);

            if (openTokens.length > 0) {
                socket.emit("demo:subscribe", { tokens: openTokens });
            }
        } catch (err: any) {
            set({ loading: false, error: err.response?.data?.message || err.message });
        }
    },
    // ── Place order — backend dono tables update karta hai ────────────────────
    // placeOrder: async (tradeData) => {
    //     set({ error: null });
    //     try {
    //         const { data } = await axiosInstance.post("/demo-trades/order", tradeData);
    //         if (data.success) {
    //             const { order, position } = data;

    //             set((state) => ({
    //                 // New order always prepend karo
    //                 orders: [order, ...state.orders],

    //                 // Position: agar same id exist karta hai to update, nahi to add
    //                 positions: state.positions.some((p) => p.id === position.id)
    //                     ? state.positions.map((p) => (p.id === position.id ? position : p))
    //                     : [position, ...state.positions],
    //             }));

    //             return { order, position };
    //         }
    //         return null;
    //     } catch (err: any) {
    //         set({ error: err.response?.data?.message || err.message });
    //         return null;
    //     }
    // },

    // useDemoTradeStore.ts — placeOrder ke andar, return se pehle

    placeOrder: async (tradeData) => {
        set({ error: null });
        try {
            const { data } = await axiosInstance.post("/demo-trades/order", tradeData);
            if (data.success) {
                const { order, position } = data;

                set((state) => ({
                    orders: [order, ...state.orders],
                    positions: state.positions.some((p) => p.id === position.id)
                        ? state.positions.map((p) => (p.id === position.id ? position : p))
                        : [position, ...state.positions],
                }));

                // ✅ Naye token ko live subscribe karo
                socket.emit("demo:subscribe", {
                    tokens: [{ token: position.token, exchange: position.exchange }]
                });

                return { order, position };
            }
            return null;
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message });
            return null;
        }
    },

    // ── Delete order from order book ──────────────────────────────────────────
    deleteOrder: async (id) => {
        set({ error: null });
        try {
            const { data } = await axiosInstance.delete(`/demo-trades/orders/${id}`);
            if (data.success) {
                set((state) => ({
                    orders: state.orders.filter((o) => o.id !== id),
                }));
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message });
        }
    },

    // ── Socket listener — live LTP updates ────────────────────────────────────
    initLiveQuoteListener: () => {
        socket.off("demo:tick"); // duplicate listeners se bachne ke liye
        socket.on("demo:tick", (payload) => {
            if (payload.success) {
                set((state) => ({
                    liveQuotes: { ...state.liveQuotes, ...payload.data },
                }));
            }
        });
    },
}));