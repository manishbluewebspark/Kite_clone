// src/pages/Bids.tsx
import { useState } from "react";
import { Search } from "lucide-react";
import ipoData from "../data/ipoData.json";
import corporateActionsData from "../data/corporateActionsData.json";

type Tab = "ipo" | "govt" | "auctions" | "corporate" | "sseipo";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IPOItem {
    id: number;
    symbol: string;
    type: string | null;
    company: string;
    dateFrom: string;
    dateTo: string;
    priceMin: number;
    priceMax: number | null;
    minAmount: number;
    minQty: string;
    status: "open" | "closed";
}

interface CorporateAction {
    id: number;
    type: "TAKEOVER" | "BUYBACK";
    symbol: string;
    startsAt: string;
    endsOn: string;
    offerPrice: number;
}

const ipos = ipoData as IPOItem[];
const corpActions = corporateActionsData as CorporateAction[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SmeBadge() {
    return (
        <span className="text-[9px] font-bold border border-blue-400 text-blue-400 px-1 py-px rounded-sm ml-1 leading-none">
            SME
        </span>
    );
}

function TypeBadge({ type }: { type: "TAKEOVER" | "BUYBACK" }) {
    const isTakeover = type === "TAKEOVER";
    return (
        <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm tracking-wide ${isTakeover
                    ? "bg-blue-100 text-blue-500 border border-blue-200"
                    : "bg-red-100 text-red-400 border border-red-200"
                }`}
        >
            {type}
        </span>
    );
}

// ─── Coming Soon Components (Separate for each tab) ───────────────────────────

function GovtSecuritiesComingSoon() {
    return (
        <div className="flex flex-col items-center justify-center  text-gray-400">
            <img
                src="/images/orderbook.svg"
                alt="Govt Securities Coming Soon"
                className="w-40 h-40 mb-4 object-contain"
            />

            <p className="text-[15px] font-medium text-gray-500 mb-1">
                No securities available for bidding currently. <span className="text-blue-500 hover:underline cursor-pointer">Learn more.</span>
            </p>
        </div>
    );
}

function AuctionsComingSoon() {
    return (
        <div className="flex flex-col items-center justify-center  text-gray-400">
            <img
                src="/images/alert (1).svg"
                alt="alert (1)"
                className="w-35 h-35 mb-4 object-contain"
            />
            <p className="text-[15px] font-medium text-gray-500 mb-1">
                There are no stocks for auctions yet.
            </p>
            <p className="text-[15px] font-medium text-gray-500 mb-1">
                The auction market opens at 2.30 PM. Stocks eligible to be
            </p>
            <p className="text-[15px] font-medium text-gray-500 mb-1">
                sold in the auction will be listed here. <span className="text-blue-500 hover:underline cursor-pointer">Learn more.</span>
            </p>
        </div>
    );
}

function SSEIPOComingSoon() {
    return (
        <div className="flex flex-col items-center justify-center  text-gray-400">
            <img
                src="/images/ipo-list.svg"
                alt="Govt Securities Coming Soon"
                className="w-40 h-40 mb-4 object-contain"
            />

            <p className="text-[15px] font-medium text-gray-500 mb-1">
                No active Social Stock Exchange (SSE) issues. SSE allows 
            </p>
            <p className="text-[15px] font-medium text-gray-500 mb-1">
                non-profits to raise funds for their causes. <span className="text-blue-500 hover:underline cursor-pointer">Learn more.</span>
            </p>
        </div>
    );
}

// ─── IPO Tab ─────────────────────────────────────────────────────────────────

function IPOTab() {
    const [search, setSearch] = useState("");
    const openIPOs = ipos.filter((i) => i.status === "open");
    const filtered = ipos.filter(
        (i) =>
            i.symbol.toLowerCase().includes(search.toLowerCase()) ||
            i.company.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-normal text-gray-800">
                    IPOs ({openIPOs.length})
                </h2>
                <div className="flex items-center border border-gray-300 rounded px-2 py-1 gap-1 w-48">
                    <Search size={13} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="text-[12px] text-gray-600 outline-none flex-1 bg-transparent"
                    />
                </div>
            </div>

            {/* Table */}
            <table className="w-full border-collapse text-[12px]">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left font-normal text-gray-400 py-2 pr-4 w-[35%]">Instrument</th>
                        <th className="text-left font-normal text-gray-400 py-2 pr-4">Date</th>
                        <th className="text-right font-normal text-gray-400 py-2 pr-4">Price (₹)</th>
                        <th className="text-right font-normal text-gray-400 py-2 pr-8">Min. amount (₹)</th>
                        <th className="py-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((ipo) => (
                        <tr
                            key={ipo.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                        >
                            {/* Instrument */}
                            <td className="py-3 pr-4">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-800">{ipo.symbol}</span>
                                    {ipo.type === "SME" && <SmeBadge />}
                                </div>
                                <div className="text-gray-400 text-[11px] mt-0.5">{ipo.company}</div>
                            </td>

                            {/* Date */}
                            <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                                {ipo.dateFrom} — {ipo.dateTo}
                            </td>

                            {/* Price */}
                            <td className="py-3 pr-4 text-right text-gray-600">
                                {ipo.priceMax ? `${ipo.priceMin} - ${ipo.priceMax}` : `${ipo.priceMin}`}
                            </td>

                            {/* Min amount */}
                            <td className="py-3 pr-8 text-right">
                                <div className="text-gray-800">{ipo.minAmount.toLocaleString("en-IN")}</div>
                                <div className="text-gray-400 text-[11px]">{ipo.minQty}</div>
                            </td>

                            {/* Action */}
                            <td className="py-3 text-right">
                                {ipo.status === "open" ? (
                                    <button
                                        className="text-white text-[12px] font-semibold px-4 py-1.5 rounded"
                                        style={{ backgroundColor: "#387ED1" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d6cb8")}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#387ED1")}
                                    >
                                        Apply
                                    </button>
                                ) : (
                                    <span className="text-[11px] font-medium text-gray-400 border border-gray-200 px-3 py-1.5 rounded bg-gray-50">
                                        CLOSED
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer link */}
            <div className="text-center mt-4 text-[12px]">
                <a href="#" className="text-blue-500 hover:underline">
                    Don't see an IPO here? View upcoming →
                </a>
            </div>

            {/* Empty applications state */}
            <div className="flex flex-col items-center justify-center mt-10 mb-4 text-gray-400">
                <div>
                    <img
                        src="/images/ipo-applications.svg"
                        alt="No IPO applications"
                        className="w-40 h-40 mb-4 object-contain"
                    />  
                </div>
                <p className="text-[12px]">There are no active IPO applications.</p>
            </div>
        </div>
    );
}

// ─── Corporate Actions Tab ────────────────────────────────────────────────────

function CorporateActionsTab() {
    const [search, setSearch] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const filtered = corpActions
        .filter((c) =>
            c.symbol.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) =>
            sortDir === "asc"
                ? a.symbol.localeCompare(b.symbol)
                : b.symbol.localeCompare(a.symbol)
        );

    return (
        <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-normal text-gray-800">
                    Corporate Actions ({corpActions.length})
                </h2>
                <div className="flex items-center border border-gray-300 rounded px-2 py-1 gap-1 w-48">
                    <Search size={13} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="text-[12px] text-gray-600 outline-none flex-1 bg-transparent"
                    />
                </div>
            </div>

            {/* Table */}
            <table className="w-full border-collapse text-[12px]">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left font-normal text-gray-500 py-2 px-3 w-24">Type</th>
                        <th
                            className="text-left font-normal text-gray-500 py-2 px-3 cursor-pointer select-none"
                            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                        >
                            <span className="flex items-center gap-1">
                                Symbol
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path
                                        d={sortDir === "asc" ? "M2 6l3-3 3 3" : "M2 4l3 3 3-3"}
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </th>
                        <th className="text-right font-normal text-gray-500 py-2 px-3">Starts at</th>
                        <th className="text-right font-normal text-gray-500 py-2 px-3">Ends on</th>
                        <th className="text-right font-normal text-gray-500 py-2 px-3">Offer price</th>
                        <th className="py-2 px-3"></th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((row) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-3">
                                <TypeBadge type={row.type} />
                            </td>
                            <td className="py-3 px-3 font-medium text-gray-800">{row.symbol}</td>
                            <td className="py-3 px-3 text-right text-gray-600">{row.startsAt}</td>
                            <td className="py-3 px-3 text-right text-gray-600">{row.endsOn}</td>
                            <td className="py-3 px-3 text-right text-gray-800">{row.offerPrice.toFixed(2)}</td>
                            <td className="py-3 px-3 text-right">
                                <button
                                    className="text-white text-[12px] font-semibold px-4 py-1.5 rounded"
                                    style={{ backgroundColor: "#387ED1" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d6cb8")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#387ED1")}
                                >
                                    Place bid
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
    { key: "ipo", label: "IPO" },
    { key: "govt", label: "Govt. securities" },
    { key: "auctions", label: "Auctions" },
    { key: "corporate", label: "Corporate actions" },
    { key: "sseipo", label: "SSE IPO" },
];

export default function Bids() {
    const [activeTab, setActiveTab] = useState<Tab>("ipo");

    return (
        <div className="min-h-full bg-white text-[13px]">
            {/* Tab bar */}
            <div className="flex border-b border-gray-200 px-4">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${activeTab === tab.key
                                ? "border-red-500 text-red-500"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="px-6 py-5">
                {activeTab === "ipo" && <IPOTab />}
                {activeTab === "govt" && <GovtSecuritiesComingSoon />}
                {activeTab === "auctions" && <AuctionsComingSoon />}
                {activeTab === "corporate" && <CorporateActionsTab />}
                {activeTab === "sseipo" && <SSEIPOComingSoon />}
            </div>
        </div>
    );
}