import React, { useState } from "react";

const SEARCH_TABS = ["#", "MF", "IPO", "Events", "Brands", "ETF", "G-Secs"];

interface SearchViewProps {
  rows: any[];
  loading: boolean;
  activeTab: string;
  onTabChange: (t: string) => void;
  addedTokens: Set<string>;
  onAdd: (row: any) => void;
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
  onPageNext,
  onPagePrev,
  page,
  totalPages,
}: SearchViewProps) {
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>
      {/* Category Tabs */}
      <div
        className="flex items-center border-b shrink-0 overflow-x-auto"
        style={{ borderColor: "var(--border-overlay-12)" }}
      >
        {SEARCH_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className="px-3 py-2 text-xs font-semibold shrink-0 border-b-2 transition-colors"
            style={{
              color: activeTab === tab ? "#387ed1" : "var(--text-on-dark-55)",
              borderColor: activeTab === tab ? "#387ed1" : "transparent",
              backgroundColor: "transparent",
            }}
          >
            {tab === "#" ? <b>#</b> : tab}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {loading && (
          <div className="px-3 py-2 text-[10px]" style={{ color: "var(--text-on-dark-45)" }}>
            Loading...
          </div>
        )}

        {rows.length === 0 && !loading && (
          <div className="px-3 py-4 text-xs text-center" style={{ color: "var(--text-on-dark-45)" }}>
            No instruments found
          </div>
        )}

        {rows.map((row) => {
          const token = `${row.exch_seg}-${row.token}`;
          const isAdded = addedTokens.has(row.token);
          const isHovered = hoveredToken === token;

          return (
            <div
              key={token}
              className="flex items-center px-3 py-2 border-b cursor-pointer relative"
              style={{
                borderColor: "var(--border-overlay-08)",
                backgroundColor: isHovered ? "var(--bg-overlay-06)" : "transparent",
              }}
              onMouseEnter={() => setHoveredToken(token)}
              onMouseLeave={() => setHoveredToken(null)}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--text-on-dark-80)" }}
                >
                  {row.symbol}
                </div>
                <div className="text-[10px]" style={{ color: "var(--text-on-dark-45)" }}>
                  {row.name || row.symbol}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isHovered ? (
                  <>
                    <button
                      className="p-1 rounded"
                      style={{ color: "var(--text-on-dark-55)" }}
                      title="Chart"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 12l4-5 3 3 4-6" />
                      </svg>
                    </button>
                    <button
                      className="p-1 rounded"
                      style={{ color: "var(--text-on-dark-55)" }}
                      title="Info"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 6h10M3 10h10" />
                      </svg>
                    </button>
                    {isAdded ? (
                      <span className="text-xs" style={{ color: "var(--text-on-dark-45)" }}>✓</span>
                    ) : (
                      <button
                        onClick={() => onAdd(row)}
                        className="text-lg font-bold leading-none"
                        style={{ color: "#16a34a" }}
                        title="Add to watchlist"
                      >
                        +
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{
                        color: "var(--text-on-dark-45)",
                        backgroundColor: "var(--bg-overlay-10)",
                      }}
                    >
                      {row.exch_seg}
                    </span>
                    {isAdded && (
                      <span className="text-xs" style={{ color: "var(--text-on-dark-45)" }}>✓</span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between border-t px-3 py-1.5 shrink-0"
        style={{ borderColor: "var(--border-overlay-12)" }}
      >
        <button
          disabled={page <= 1}
          onClick={onPagePrev}
          className="text-xs px-2 py-1 rounded disabled:opacity-30"
          style={{ color: "var(--text-on-dark-55)" }}
        >
          ← Prev
        </button>
        <span className="text-[10px]" style={{ color: "var(--text-on-dark-45)" }}>
          Page {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={onPageNext}
          className="text-xs px-2 py-1 rounded disabled:opacity-30"
          style={{ color: "var(--text-on-dark-55)" }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}