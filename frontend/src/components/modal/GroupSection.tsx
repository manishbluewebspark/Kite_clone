import StockRow from "./StockRow";

interface GroupSectionProps {
  name: string;
  entries: any[];
  quotes: Record<string, any>;
  hoveredStockId: number | null;
  expandedStockId: number | null;
  onHover: (id: number | null) => void;
  onStockClick: (id: number) => void;
  onRemove: (id: number) => void;
}

export default function GroupSection({
  name,
  entries,
  quotes,
  hoveredStockId,
  expandedStockId,
  onHover,
  onStockClick,
  onRemove,
}: GroupSectionProps) {
  return (
    <>
      {/* Group Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b shrink-0"
        style={{
          borderColor: "var(--border-overlay-12)",
          backgroundColor: "var(--bg-overlay-08)",
        }}
      >
        <span className="text-[13px] font-semibold" style={{ color: "var(--text-on-dark-80)" }}>
          {name}
        </span>
        <div className="flex items-center gap-2">
          {/* Collapse */}
          <button style={{ color: "var(--text-on-dark-45)" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10l4-4 4 4" />
            </svg>
          </button>
          {/* Expand */}
          <button style={{ color: "var(--text-on-dark-45)" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {/* Edit */}
          <button style={{ color: "var(--text-on-dark-45)" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M11 3l2 2-7 7H4v-2l7-7z" />
            </svg>
          </button>
          {/* More */}
          <button style={{ color: "var(--text-on-dark-45)" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="3" cy="8" r="1" fill="currentColor" />
              <circle cx="8" cy="8" r="1" fill="currentColor" />
              <circle cx="13" cy="8" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stock Rows */}
      {entries.map((entry) => (
        <StockRow
          key={entry.id}
          entry={entry}
          quote={quotes[entry.token]}
          isHovered={hoveredStockId === entry.id}
          isExpanded={expandedStockId === entry.id}
          onHover={onHover}
          onClick={onStockClick}
          onRemove={onRemove}
        />
      ))}
    </>
  );
}