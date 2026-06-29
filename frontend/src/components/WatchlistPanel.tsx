import { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { IoAddOutline } from "react-icons/io5";
import {
  useWatchlistStore,
  startWatchlistPolling,
  stopWatchlistPolling,
} from "../store/useWatchlistStore";
import { useInstrumentListStore } from "../store/useInstrumentListStore";
import NewGroupModal from "../components/modal/NewGroupModal";
import ListsPanel from "../components/modal/ListsPanel";
import SearchView from "../components/modal/SearchView";
import GroupSection from "../components/modal/GroupSection";
import EmptyGroup from "../components/modal/EmptyGroup";
import BottomTabs from "../components/modal/BottomTabs";
import { RiSoundModuleFill } from "react-icons/ri";

// ─── Types ───────────────────────────────────────────────────────────────────
interface WatchlistGroup {
  id: string;
  name: string;
  color: string;
  stockIds: number[];
}

interface WatchlistTab {
  id: number;
  name: string;
  groups: WatchlistGroup[];
}

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_WATCHLISTS = 7;
const MAX_STOCKS_PER_WATCHLIST = 250;

// ─── WatchlistPanel ──────────────────────────────────────────────────────────
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
    loading: instrumentsLoading,
    setQuery,
    setPage,
    fetchPage,
  } = useInstrumentListStore();

  // ── State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState("#");
  const [hoveredStockId, setHoveredStockId] = useState<number | null>(null);
  const [expandedStockId, setExpandedStockId] = useState<number | null>(null);

  // Watchlist tabs (up to 7)
  const [watchlistTabs, setWatchlistTabs] = useState<WatchlistTab[]>([
    { id: 1, name: "Watchlist 1", groups: [{ id: "default", name: "Default", color: "#888", stockIds: [] }] },
    { id: 2, name: "Watchlist 2", groups: [{ id: "default2", name: "Default", color: "#888", stockIds: [] }] },
    { id: 3, name: "Watchlist 3", groups: [{ id: "default3", name: "Default", color: "#888", stockIds: [] }] },
    { id: 4, name: "Watchlist 4", groups: [{ id: "default4", name: "Default", color: "#888", stockIds: [] }] },
    { id: 5, name: "Watchlist 5", groups: [{ id: "default5", name: "Default", color: "#888", stockIds: [] }] },
    { id: 6, name: "Watchlist 6", groups: [{ id: "default6", name: "Default", color: "#888", stockIds: [] }] },
    { id: 7, name: "Watchlist 7", groups: [{ id: "default7", name: "Default", color: "#888", stockIds: [] }] },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);

  // Modal states
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showListsPanel, setShowListsPanel] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Effects ──
  useEffect(() => {
    fetchWatchlist();
    fetchPage();
    startWatchlistPolling();
    return () => stopWatchlistPolling();
  }, []);

  // Ctrl+K shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Handlers ──
  // const handleSearchChange = (val: string) => {
  //   setSearchQuery(val);
  //   setIsSearching(val.trim().length > 0);
  //   if (val.trim().length > 0) {
  //     setQuery(val);
  //   }
  // };

  const handleSearchChange = (val: string) => {
  setSearchQuery(val);

  // ⬅️ 1 char pe bhi search mode active karo (pehle > 0 tha jo empty string pe false tha)
  setIsSearching(val.length > 0);

  if (val.length > 0) {
    setQuery(val);
  } else {
    // Search clear hone par results bhi clear karo
    setQuery("");
  }
};

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
    }
  };

  const handleAddToWatchlist = (row: any) => {
    addStockFromHolding({
      name: row.symbol,
      full_name: row.name,
      token: row.token,
      exch_seg: row.exch_seg,
      lotsize: Number(row.lotsize),
    });
  };

  const handleCreateGroup = (name: string, color: string) => {
    const newGroup: WatchlistGroup = {
      id: `group_${Date.now()}`,
      name: name,
      color: color,
      stockIds: [],
    };
    setWatchlistTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, groups: [...tab.groups, newGroup] }
          : tab
      )
    );
  };

  const handleCreateList = (name: string) => {
    if (watchlistTabs.length >= MAX_WATCHLISTS) return;
    const newId = watchlistTabs.length + 1;
    setWatchlistTabs((prev) => [
      ...prev,
      {
        id: newId,
        name: name,
        groups: [{ id: `default_${newId}`, name: "Default", color: "#888", stockIds: [] }],
      },
    ]);
    setActiveTabId(newId);
  };

  const handleStockClick = (stockId: number) => {
    setExpandedStockId((prev) => (prev === stockId ? null : stockId));
  };

  const activeTab = watchlistTabs.find((t) => t.id === activeTabId);
  const totalStocksInActiveTab = entries.length;
  const addedTokens = new Set(entries.map((e) => e.token));


  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setIsSearching(false);
      setSearchQuery("");
      setQuery("");
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
    ref={panelRef} 
      className="flex flex-col border-r shrink-0 relative overflow-hidden"
      style={{
        width: "425px",
        borderColor: "var(--border-overlay-12)",
        backgroundColor: "var(--color-primary)",
      }}
    >
      {/* ── Search Bar ── */}
      <div
        className="p-2 shrink-0"
        style={{ borderColor: "var(--border-overlay-12)" }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xs border border-gray-200">

          {/* Search Icon */}
          <FiSearch
            style={{
              color: "var(--text-on-dark-45)",
              fontSize: "13px",
              flexShrink: 0,
            }}
          />

          {/* Divider */}
          <div
            className="w-px h-4 shrink-0"
            style={{ backgroundColor: "var(--border-overlay-20)" }}
          />

          {/* Input */}
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search eg: infy bse, nifty fut, index fund, et"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onBlur={handleSearchBlur}
            className="flex-1 bg-transparent outline-none"
            style={{
              color: "var(--text-on-dark)",
              fontSize: "11px",
              minWidth: 0,
            }}
          />

          {/* Ctrl + K */}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-xs border shrink-0 whitespace-nowrap bg-gray-100"
            style={{
              color: "var(--text-on-dark-45)",
              borderColor: "var(--border-overlay-20)",
              lineHeight: "1.4",
            }}
          >
            Ctrl + K
          </span>

          {/* Divider */}
          <div
            className="w-px h-4 shrink-0"
            style={{ backgroundColor: "var(--border-overlay-20)" }}
          />

          {/* Filter Button */}
          <button
            className="shrink-0 flex items-center justify-center"
            style={{ color: "var(--text-on-dark-45)" }}
            title="Filter"
          >
            <RiSoundModuleFill size={14} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SEARCH MODE — shown only when user is typing
      ══════════════════════════════════════════════════════════════════ */}
      {isSearching ? (
        <SearchView
          rows={rows}
          loading={instrumentsLoading}
          activeTab={activeSearchTab}
          onTabChange={setActiveSearchTab}
          addedTokens={addedTokens}
          onAdd={handleAddToWatchlist}
          onPageNext={() => setPage(page + 1)}
          onPagePrev={() => setPage(page - 1)}
          page={page}
          totalPages={totalPages}
          onBuy={(_row) => {}}
          onSell={(_row) => {}}
          onChart={(_row) => {}}
          onInfo={(_row) => {}}
            onClose={() => {
    setIsSearching(false);
    setSearchQuery("");
    setQuery("");
  }}
        />
      ) : (
        /* ══════════════════════════════════════════════════════════════
            NORMAL WATCHLIST MODE
        ══════════════════════════════════════════════════════════════ */
        <>
          {/* Header: Watchlist 1 (6/250) + New group */}
          <div
            className="flex items-center justify-between px-3 py-1.5 shrink-0"
            style={{ borderColor: "var(--border-overlay-12)" }}
          >
            <span className="text-xs" style={{ color: "var(--text-on-dark-55)" }}>
              Watchlist {activeTabId} ({totalStocksInActiveTab} / {MAX_STOCKS_PER_WATCHLIST})
            </span>
            <button
              className="text-xs flex items-center gap-1"
              style={{ color: "#387ed1" }}
              onClick={() => setShowNewGroupModal(true)}
            >
              <IoAddOutline size={14} />
              New group
            </button>
          </div>

          {/* Stock List — scrollable */}
          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {entries.length === 0 && !watchlistLoading && (
              <div
                className="px-3 py-6 text-xs text-center"
                style={{ color: "var(--text-on-dark-45)" }}
              >
                No stocks in watchlist. Use the search bar to add.
              </div>
            )}

            {/* Group Header */}
            {entries.length > 0 && (
              <GroupSection
                name={`Default`}
                entries={entries}
                quotes={quotes}
                hoveredStockId={hoveredStockId}
                expandedStockId={expandedStockId}
                onHover={setHoveredStockId}
                onStockClick={handleStockClick}
                onRemove={removeStock}
              />
            )}

            {/* Extra groups from this watchlist tab */}
            {activeTab?.groups.slice(1).map((group) => (
              <EmptyGroup key={group.id} name={group.name} />
            ))}
          </div>

          {/* ── New Group Modal ── */}
          <NewGroupModal
            isOpen={showNewGroupModal}
            onClose={() => setShowNewGroupModal(false)}
            onCreate={handleCreateGroup}
          />
        </>
      )}

      {/* ── Bottom Tabs ── */}
      <BottomTabs
        tabs={watchlistTabs}
        activeTabId={activeTabId}
        onSwitch={(id: number) => {
          setActiveTabId(id);
          setExpandedStockId(null);
        }}
        onLayersClick={() => setShowListsPanel(true)}
      />

      {/* ── Lists Panel ── */}
      <ListsPanel
        isOpen={showListsPanel}
        tabs={watchlistTabs}
        activeTabId={activeTabId}
        onSelectTab={(id: number) => {
          setActiveTabId(id);
          setShowListsPanel(false);
          setExpandedStockId(null);
        }}
        onClose={() => setShowListsPanel(false)}
        onCreateList={handleCreateList}
      />
    </div>
  );
}