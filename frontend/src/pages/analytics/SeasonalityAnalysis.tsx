import { useState, useRef, useEffect } from "react";
import {
    FiSearch,
    FiChevronDown,
    FiCalendar,
    FiSettings,
    FiTrendingUp,
    FiArrowUpRight,
} from "react-icons/fi";
import { BsBarChartFill } from "react-icons/bs";

const cryptos = [
    { abbr: "BT", name: "BTC", pair: "BTCUSDT", badge: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    { abbr: "ET", name: "ETH", pair: "ETHUSDT", badge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
    { abbr: "AL", name: "ALPACA", pair: "ALPACAUSDT", badge: "bg-blue-500/20   text-blue-400   border-blue-500/30" },
    { abbr: "XA", name: "XAG", pair: "XAGUSDT", badge: "bg-slate-500/20  text-slate-400  border-slate-500/30" },
    { abbr: "XA", name: "XAU", pair: "XAUUSDT", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    { abbr: "SO", name: "SOL", pair: "SOLUSDT", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { abbr: "BN", name: "BNB", pair: "BNBUSDT", badge: "bg-amber-500/20  text-amber-400  border-amber-500/30" },
    { abbr: "AD", name: "ADA", pair: "ADAUSDT", badge: "bg-blue-900/40   text-blue-500   border-blue-800/50" },
];

const periods = [
    "1 Year",
    "2 Years",
    "3 Years",
    "5 Years (Recommended)",
    "All Time",
];

export default function SeasonalityAnalysis() {
    const [selectedCrypto, setSelectedCrypto] = useState<typeof cryptos[0] | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState("5 Years (Recommended)");
    const [cryptoOpen, setCryptoOpen] = useState(false);
    const [periodOpen, setPeriodOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filtered = cryptos.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.pair.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClick = (e: MouseEvent): void => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setCryptoOpen(false);
                setPeriodOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">

            {/* ── Header ────────────────────────────────────────── */}
            <div className="flex flex-col items-center pt-12 pb-6 gap-3">

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1 bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/40">
                    <BsBarChartFill className="text-white text-3xl" />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
                    Seasonality Intelligence
                </h1>

                <p className="text-sm text-slate-500 text-center max-w-lg">
                    Advanced pattern recognition and statistical analysis for cryptocurrency seasonal trends
                </p>

                {/* Status badge */}
                <div className="flex items-center gap-2 mt-1 px-4 py-1.5 rounded-full border border-white/10 bg-slate-900/70 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-medium text-slate-200">Live Data Connected</span>
                    <span className="text-xs px-2 py-0.5 rounded-full ml-1 bg-white/5 text-blue-300 border border-blue-400/20">
                        Binance Futures
                    </span>
                </div>
            </div>

            {/* ── Main Card ─────────────────────────────────────── */}
            <div
                ref={dropdownRef}
                className="w-full max-w-7xl mx-auto mt-2 rounded-2xl p-6 bg-slate-900/80 border border-white/10 backdrop-blur-xl"
            >
                {/* Config header row */}
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <FiSettings className="text-blue-400 text-lg" />
                        <span className="text-white font-semibold text-lg">Analysis Configuration</span>
                    </div>

                    <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-blue-300 hover:bg-white/10 transition-colors">
                        <FiTrendingUp className="text-base" />
                        Advanced
                    </button>
                </div>

                <p className="text-sm mb-6 text-slate-600">
                    Configure parameters for your seasonality analysis
                </p>

                {/* Two-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">

                    {/* ── LEFT: Crypto Symbol ── */}
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <FiSearch className="text-blue-400 text-sm" />
                            <span className="text-sm font-medium text-slate-400">Cryptocurrency Symbol</span>
                        </div>

                        {/* Trigger */}
                        <button
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                            onClick={() => { setCryptoOpen((v) => !v); setPeriodOpen(false); }}
                        >
                            {selectedCrypto ? (
                                <span className="flex items-center gap-2 text-slate-200">
                                    <AvatarBadge crypto={selectedCrypto} size="sm" />
                                    <span>{selectedCrypto.name}</span>
                                    <span className="text-slate-500">{selectedCrypto.pair}</span>
                                </span>
                            ) : (
                                <span className="text-slate-500">Select a cryptocurrency</span>
                            )}
                            <FiChevronDown
                                className={`text-base text-slate-500 transition-transform duration-200 ${cryptoOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* Dropdown */}
                        {cryptoOpen && (
                            <div className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-50 bg-slate-950 border border-white/10 shadow-2xl shadow-black/60">
                                {/* Search bar */}
                                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
                                    <FiSearch className="text-slate-500 flex-shrink-0" />
                                    <input
                                        autoFocus
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search cryptocurrency..."
                                        className="flex-1 bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600"
                                    />
                                </div>

                                {/* List */}
                                <div className="max-h-56 overflow-y-auto">
                                    {filtered.map((c, i) => (
                                        <button
                                            key={i}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-slate-200 hover:bg-white/5 transition-colors ${selectedCrypto?.pair === c.pair ? "bg-blue-500/15" : ""
                                                }`}
                                            onClick={() => { setSelectedCrypto(c); setCryptoOpen(false); setSearch(""); }}
                                        >
                                            <AvatarBadge crypto={c} size="md" />
                                            <span className="font-semibold">{c.name}</span>
                                            <span className="text-slate-500">{c.pair}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Historical Period ── */}
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <FiCalendar className="text-blue-400 text-sm" />
                            <span className="text-sm font-medium text-slate-400">Historical Period</span>
                        </div>

                        <button
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-200 hover:border-white/20 transition-colors"
                            onClick={() => { setPeriodOpen((v) => !v); setCryptoOpen(false); }}
                        >
                            {selectedPeriod}
                            <FiChevronDown
                                className={`text-base text-slate-500 transition-transform duration-200 ${periodOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {periodOpen && (
                            <div className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-50 bg-slate-950 border border-white/10 shadow-2xl shadow-black/60">
                                {periods.map((p, i) => (
                                    <button
                                        key={i}
                                        className={`w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-white/5 transition-colors ${selectedPeriod === p ? "bg-blue-500/15" : ""
                                            }`}
                                        onClick={() => { setSelectedPeriod(p); setPeriodOpen(false); }}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Advanced Analysis Banner */}
                <button className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/15 transition-colors text-center">
                    <FiTrendingUp className="text-blue-400 text-base" />
                    <span className="text-sm font-medium text-blue-300 text-center">
                        Generate Advanced Analysis
                    </span>
                    <FiArrowUpRight className="text-blue-400 text-sm" />
                </button>
            </div>
        </div>
    );
}

function AvatarBadge({ crypto, size }: { crypto: typeof cryptos[0]; size: "sm" | "md" }) {
    const dim = size === "md" ? "w-8 h-8 text-xs" : "w-6 h-6 text-xs";
    return (
        <span
            className={`${dim} ${crypto.badge} rounded-lg flex items-center justify-center font-bold flex-shrink-0 border`}
        >
            {crypto.abbr}
        </span>
    );
}