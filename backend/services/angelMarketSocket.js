import WebSocketV2 from "smartapi-javascript/lib/websocket2.0.js";
import { getSession } from "./angelSession.js";
import { getIO } from "../socket.js";

const INDEX_TOKENS = {
    "NIFTY 50": { token: "99926000", exchangeType: 1 }, // nse_cm
    "NIFTY BANK": { token: "99926009", exchangeType: 1 }, // nse_cm
    "SENSEX": { token: "99919000", exchangeType: 3 }, // bse_cm
};

const tokenNameMap = {
    "99926000": "NIFTY 50",
    "99926009": "NIFTY BANK",
    "99919000": "SENSEX",
};

// ── State to build full MarketIndex objects (LTP alone isn't enough) ────────
const indexState = {
    "NIFTY 50": { last: 0, open: 0, high: 0, low: 0, previousClose: 0 },
    "NIFTY BANK": { last: 0, open: 0, high: 0, low: 0, previousClose: 0 },
    "SENSEX": { last: 0, open: 0, high: 0, low: 0, previousClose: 0 },
};

let wsInstance = null;
let broadcastInterval = null;
const BROADCAST_INTERVAL = 1_000; // 1 second pe clients ko emit karo

// ── Parsed tick se humara index state update karo ────────────────────────────
function updateIndexState(tick) {
    // token me extra escaped quotes aate hain library ke parsing se, unhe clean karo
    const rawToken = (tick.token || "").replace(/"/g, "").trim();
    const name = tokenNameMap[rawToken];
    if (!name) return;

    const ltp = Number(tick.last_traded_price) / 100;
    const open = Number(tick.open_price_day) / 100;
    const high = Number(tick.high_price_day) / 100;
    const low = Number(tick.low_price_day) / 100;
    const close = Number(tick.close_price) / 100;

    indexState[name] = {
        last: ltp,
        open: open || indexState[name].open,
        high: high || indexState[name].high,
        low: low || indexState[name].low,
        previousClose: close || indexState[name].previousClose,
    };
}

// ── indexState ko MarketIndex[] format me convert karke broadcast karo ───────
function buildAndBroadcast() {
    const io = getIO();

    const indices = Object.keys(indexState).map((name) => {
        const s = indexState[name];
        const chg = parseFloat((s.last - s.previousClose).toFixed(2));
        const chgPct = s.previousClose > 0
            ? parseFloat(((chg / s.previousClose) * 100).toFixed(2))
            : 0;

        return {
            name,
            last: s.last,
            change: chg,
            changePct: chgPct,
            open: s.open,
            high: s.high,
            low: s.low,
            previousClose: s.previousClose,
            isUp: chg >= 0,
        };
    });

    // sirf wahi indices bhejo jinka data already aaya hai (last > 0)
    const ready = indices.filter((i) => i.last > 0);
    if (ready.length === 0) return;

    io.emit("market:update", {
        success: true,
        data: ready,
        fetchedAt: new Date().toISOString(),
    });
}

export const startAngelMarketSocket = async () => {
    try {
        const sess = await getSession();

        console.log("🔍 DEBUG session:", {
            hasAccessToken: !!sess.accessToken,
            hasFeedToken: !!sess.feedToken,
            clientId: process.env.ANGEL_CLIENT_ID,
            apiKey: process.env.ANGEL_API_KEY ? "present" : "MISSING",
        });

        if (!sess.accessToken || !sess.feedToken) {
            throw new Error("Angel One session not ready (missing jwtToken/feedToken)");
        }

        wsInstance = new WebSocketV2({
            clientcode: process.env.ANGEL_CLIENT_ID,
            jwttoken: sess.accessToken,
            apikey: process.env.ANGEL_API_KEY,
            feedtype: sess.feedToken,
        });

        console.log("🔍 DEBUG connecting to WebSocket...");
        await Promise.race([
            wsInstance.connect(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("WebSocket connect timeout after 10s")), 10000)
            ),
        ]);
        console.log("✅ Angel One WebSocket V2 connected");

        // ── reconnection enable karo (library ka built-in support) ──────────────
        wsInstance.reconnection("simple", 5000); // 5 second baad simple reconnect

        // ── NSE indices subscribe (NIFTY 50, NIFTY BANK) ─────────────────────────
        wsInstance.fetchData({
            correlationID: "nse_indices",
            action: 1, // ACTION.Subscribe
            mode: 3,   // MODE.SnapQuote
            exchangeType: 1, // EXCHANGES.nse_cm
            tokens: ["99926000", "99926009"],
        });

        // ── BSE index subscribe (SENSEX) ─────────────────────────────────────────
        wsInstance.fetchData({
            correlationID: "bse_indices",
            action: 1,
            mode: 3,
            exchangeType: 3, // EXCHANGES.bse_cm
            tokens: ["99919000"],
        });

        // ── Tick aate hi state update karo (per-tick, sub-second) ────────────────
        wsInstance.on("tick", (data) => {
            //console.log("🔵 RAW TICK:", JSON.stringify(data)); // ⬅️ temporary debug
            try {
                updateIndexState(data);
            } catch (err) {
                console.error("❌ Tick parse error:", err.message);
            }
        });

        // ── Har 1 second pe clients ko latest state broadcast karo ──────────────
        if (broadcastInterval) clearInterval(broadcastInterval);
        broadcastInterval = setInterval(buildAndBroadcast, BROADCAST_INTERVAL);

    } catch (err) {
        console.error("❌ Angel WebSocket start failed:", err.message);
        throw err;
    }
};

export const stopAngelMarketSocket = () => {
    if (broadcastInterval) clearInterval(broadcastInterval);
    if (wsInstance) wsInstance.close();
};