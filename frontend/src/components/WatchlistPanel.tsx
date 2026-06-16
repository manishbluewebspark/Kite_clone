import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { RiArrowUpSLine, RiArrowDownSLine } from "react-icons/ri";
import {
  useWatchlistStore,
  startWatchlistPolling,
  stopWatchlistPolling,
} from "../store/useWatchlistStore";
import { useInstrumentListStore } from "../store/useInstrumentListStore";

export default function WatchlistPanel() {
  const {
    entries,
    quotes,
    loading: watchlistLoading,
    fetchWatchlist,
    removeStock,
    addStockFromHolding,
  } = useWatchlistStore();

  const {
    rows,
    page,
    totalPages,
    total,
    loading: instrumentsLoading,
    setQuery,
    setPage,
    fetchPage,
  } = useInstrumentListStore();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchWatchlist();
    fetchPage(); // pehla page load
    startWatchlistPolling();
    return () => stopWatchlistPolling();
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setQuery(val); // debounced backend search trigger karega
  };

  const handleBuy = (row: any) => {
    // BUY click pe instrument ko watchlist/holdings me add karo
    addStockFromHolding({
      name: row.symbol,
      full_name: row.name,
      token: row.token,
      exch_seg: row.exch_seg,
      lotsize: Number(row.lotsize),
    });
  };

  return (
    <div
      className="flex flex-col border-r shrink-0"
      style={{
        width: "440px",
        height: "100%",
        borderColor: "var(--border-overlay-12)",
        backgroundColor: "var(--color-primary)",
      }}
    >
      {/* ── Search Bar (yahin se search chalega) ── */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: "var(--border-overlay-12)" }}
      >
        <FiSearch style={{ color: "var(--text-on-dark-45)", fontSize: "15px", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search eg: infy bse, nifty fut, index fund, et"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--text-on-dark)", fontSize: "12px" }}
        />
      </div>

      {/* ── Saved Watchlist Section ── */}
      {entries.length > 0 && (
        <>
          <div
            className="px-3 py-1.5 text-xs font-semibold border-b"
            style={{
              color: "var(--text-on-dark-80)",
              borderColor: "var(--border-overlay-12)",
              backgroundColor: "var(--bg-overlay-08)",
            }}
          >
            My Watchlist ({entries.length})
          </div>

          <div className="shrink-0 max-h-[200px] overflow-y-auto border-b" style={{ borderColor: "var(--border-overlay-12)" }}>
            {entries.map((entry) => {
              const q = quotes[entry.token];
              const isUp = q ? q.isUp : true;
              const price = q?.ltp ?? 0;
              const change = q?.change ?? 0;

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-3 py-2.5 border-b cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ borderColor: "var(--border-overlay-12)" }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    removeStock(entry.id);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold truncate" style={{ color: isUp ? "#22c55e" : "#ef4444" }}>
                      {entry.symbol}
                    </span>
                    <span
                      className="text-[9px] px-1 ml-1.5 rounded font-bold"
                      style={{ color: "var(--text-on-dark-45)", backgroundColor: "var(--bg-overlay-10)" }}
                    >
                      {entry.exchange}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-sm font-semibold" style={{ color: "var(--text-on-dark-80)" }}>
                      {change > 0 ? "+" : ""}{change.toFixed(2)}
                    </div>
                    <div className="flex items-center justify-end gap-0.5">
                      {isUp ? <RiArrowUpSLine size={12} style={{ color: "#22c55e" }} /> : <RiArrowDownSLine size={12} style={{ color: "#ef4444" }} />}
                      <span className="text-xs font-medium" style={{ color: isUp ? "#22c55e" : "#ef4444" }}>
                        {price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── All Instruments Section (search yahin filter karega) ── */}
      <div
        className="px-3 py-1.5 text-xs font-semibold border-b flex items-center justify-between"
        style={{
          color: "var(--text-on-dark-80)",
          borderColor: "var(--border-overlay-12)",
          backgroundColor: "var(--bg-overlay-08)",
        }}
      >
        <span>All Instruments ({total})</span>
        {instrumentsLoading && <span className="text-[10px]" style={{ color: "var(--text-on-dark-45)" }}>Loading...</span>}
      </div>

      <div className="flex-1 overflow-y-auto">
        {rows.length === 0 && !instrumentsLoading && (
          <div className="px-3 py-4 text-xs text-center" style={{ color: "var(--text-on-dark-45)" }}>
            No instruments found
          </div>
        )}

        {rows.map((row) => (
          <div
            key={`${row.exch_seg}-${row.token}`}
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: "var(--border-overlay-12)" }}
          >
            <button
              onClick={() => handleBuy(row)}
              className="text-[10px] font-bold px-2 py-1 rounded text-white shrink-0 mr-2"
              style={{ backgroundColor: "#16a34a" }}
            >
              BUY
            </button>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: "var(--text-on-dark-80)" }}>
                {row.symbol}
              </div>
              <div className="text-[10px]" style={{ color: "var(--text-on-dark-45)" }}>
                {row.exch_seg} • {row.expiry || "—"}
              </div>
            </div>

            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0"
              style={{ color: "var(--text-on-dark-45)", backgroundColor: "var(--bg-overlay-10)" }}
            >
              {row.lotsize}
            </span>
          </div>
        ))}
      </div>

      {/* ── Pagination (ye hi "tabs" hai) ── */}
      <div className="flex items-center justify-between border-t px-3 py-2" style={{ borderColor: "var(--border-overlay-12)" }}>
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="text-xs px-2 py-1 rounded disabled:opacity-30"
          style={{ color: "var(--text-on-dark-55)" }}
        >
          ← Prev
        </button>
        <span className="text-xs" style={{ color: "var(--text-on-dark-55)" }}>
          Page {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="text-xs px-2 py-1 rounded disabled:opacity-30"
          style={{ color: "var(--text-on-dark-55)" }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}