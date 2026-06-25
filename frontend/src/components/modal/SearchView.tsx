import { useState, useEffect, useRef } from "react";
import { FiCheck } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { AiOutlineAlignCenter } from "react-icons/ai";
import { IoTrendingUpOutline } from "react-icons/io5";

const SEARCH_TABS = ["#", "MF", "IPO", "Events", "Brands", "ETF", "G-Secs"];

interface Row {
  token: string;
  exch_seg: string;
  symbol: string;
  name?: string;
}

interface SearchViewProps {
  rows: Row[];
  loading: boolean;
  activeTab: string;
  onTabChange: (t: string) => void;
  addedTokens: Set<string>;
  onAdd: (row: Row) => void;
  onBuy: (row: Row) => void;
  onSell: (row: Row) => void;
  onChart: (row: Row) => void;
  onInfo: (row: Row) => void;
  onPageNext: () => void;
  onPagePrev: () => void;
  page: number;
  totalPages: number;
}

export default function SearchView({
  rows,
  loading,
  activeTab,
  onTabChange,
  addedTokens,
  onAdd,
  onBuy,
  onSell,
  onChart,
  onInfo,
}: SearchViewProps) {
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Default to "#" tab on mount if parent hasn't set it
  useEffect(() => {
    if (!activeTab) onTabChange("#");
  }, []);

  // Hide hover when mouse leaves the entire component
  const handleRootMouseLeave = () => {
    setHoveredToken(null);
    setTooltip(null);
  };

  return (
    <div
      ref={rootRef}
      className="flex flex-col flex-1 overflow-hidden"
      style={{ minHeight: 0 }}
      onMouseLeave={handleRootMouseLeave}
    >
      {/* ── Category Tabs ── */}
      <div className="flex items-center border-b border-gray-300 shrink-0 overflow-x-auto">
        {SEARCH_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className="px-3 py-2 text-xs font-semibold shrink-0 border-b-2 transition-colors"
            style={{
              color: activeTab === tab ? "#387ed1" : "#888",
              borderBottomColor: activeTab === tab ? "#387ed1" : "transparent",
              backgroundColor: "transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Results List — visible scrollbar ── */}
      <div
        className="flex-1 overflow-y-scroll"
        style={{
          minHeight: 0,
          scrollbarWidth: "thin",
          scrollbarColor: "#d1d5db transparent",
        }}
      >
        {loading && (
          <div className="px-3 py-2 text-[10px] text-gray-400">Loading...</div>
        )}

        {rows.length === 0 && !loading && (
          <div className="px-3 py-4 text-xs text-center text-gray-400">
            No instruments found
          </div>
        )}

        {rows.map((row) => {
          const tokenKey = `${row.exch_seg}-${row.token}`;
          const isAdded = addedTokens.has(row.token);
          const isHovered = hoveredToken === tokenKey;

          return (
            <div
              key={tokenKey}
              className="flex items-center px-3 py-2 border-b border-gray-100 cursor-pointer relative"
              style={{
                backgroundColor: isHovered ? "#f9f9f9" : "transparent",
              }}
              onMouseEnter={() => setHoveredToken(tokenKey)}
              onMouseLeave={() => {
                setHoveredToken(null);
                setTooltip(null);
              }}
            >
              {/* LEFT — symbol only */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px]  text-gray-800 truncate">
                  {row.symbol}
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isHovered ? (
                  /* ── Hover: B / S / chart / info / + buttons ── */
                  <>
                    {/* B — Buy */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onBuy?.(row); }}
                      className="text-[10px] px-2.5 py-1 rounded-xs text-white leading-none"
                      style={{ backgroundColor: "#387ed1" }}
                      title="Buy"
                    >
                      B
                    </button>

                    {/* S — Sell */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onSell?.(row); }}
                      className="text-[10px] px-2.5 py-1 rounded-xs text-white leading-none"
                      style={{ backgroundColor: "#e8622a" }}
                      title="Sell"
                    >
                      S
                    </button>

                    {/* Chart icon — gray pill with tooltip */}
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); onChart?.(row); }}
                        className="flex items-center justify-center border rounded-xs px-2 py-0.5 border-gray-300"
                        style={{ backgroundColor: "#ffffff" }}
                        // onMouseEnter={() => setTooltip("Chart")}
                        onMouseLeave={() => setTooltip(null)}
                        title="Chart"
                      >
                        <IoTrendingUpOutline size={13} color="#555" />
                      </button>
                      {tooltip === "Chart" && (
                        <div
                          className="absolute z-50 text-white text-[10px] font-semibold px-2 py-1 rounded pointer-events-none"
                          style={{
                            backgroundColor: "#1f2937",
                            bottom: "calc(100% + 5px)",
                            left: "50%",
                            transform: "translateX(-50%)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Chart
                        </div>
                      )}
                    </div>

                    {/* Orderbook / info lines icon — gray pill */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onInfo?.(row); }}
                      className="flex items-center justify-center border rounded-xs px-2 py-0.5 border-gray-300"
                      style={{ backgroundColor: "#ffffff" }}
                      title="Market depth"
                    >
                      <AiOutlineAlignCenter size={13} color="#555" style={{ transform: "rotate(180deg)" }} />
                    </button>

                    {/* + Add / ✓ Already added */}
                    {isAdded ? (
                      <FiCheck className="text-xs" />
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); onAdd(row); }}
                        className="flex items-center justify-center rounded-xs px-2 py-0.5 text-white font-bold  leading-none"
                        style={{ backgroundColor: "#16a34a" }}
                        title="Add to watchlist"
                      >
                        <IoMdAdd size={14} />
                      </button>
                    )}
                  </>
                ) : (
                  /* ── Default: company name + exchange badge ── */
                  <>
                    {/* ── Default: exchange badge only ── */}
                    <>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-xs shrink-0 font-medium"
                        style={{
                          color:
                            row.exch_seg === "NSE"
                              ? "#dc2626" // Red
                              : row.exch_seg === "BSE"
                                ? "#2563eb" // Blue
                                : "#6b7280", // Gray for NFO, MCX, CDS, BFO, etc.
                          backgroundColor:
                            row.exch_seg === "NSE"
                              ? "#fef2f2" // Light Red
                              : row.exch_seg === "BSE"
                                ? "#eff6ff" // Light Blue
                                : "#f3f4f6", // Light Gray for all others
                        }}
                      >
                        {row.exch_seg}
                      </span>
                      {isAdded && (
                        <FiCheck className="text-xs text-gray-400 shrink-0" />
                      )}
                    </>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}