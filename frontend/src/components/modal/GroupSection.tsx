import { useState, useRef } from "react";
import StockRow from "./StockRow";
import { 
  IoChevronDown, 
  IoChevronUp
} from "react-icons/io5";
import { AiOutlineEdit } from "react-icons/ai";
import { HiDotsVertical } from "react-icons/hi";
import { GoScreenFull } from "react-icons/go";

interface GroupSectionProps {
  name: string;
  entries: any[];
  quotes: Record<string, any>;
  hoveredStockId: number | null;
  expandedStockId: number | null;
  onHover: (id: number | null) => void;
  onStockClick: (id: number) => void;
  onRemove: (id: number) => void;
  onReorder?: (newEntries: any[]) => void;
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
  onReorder,
}: GroupSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [localEntries, setLocalEntries] = useState(entries);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const dragItemId = useRef<number | null>(null);

  const prevEntries = useRef(entries);
  if (entries !== prevEntries.current && dragItemId.current === null) {
    prevEntries.current = entries;
    setLocalEntries(entries);
  }

  const handleDragStart = (id: number) => {
    dragItemId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragItemId.current !== null && dragItemId.current !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    const fromId = dragItemId.current;
    if (fromId === null || fromId === targetId) return;

    const updated = [...localEntries];
    const fromIdx = updated.findIndex((e) => e.id === fromId);
    const toIdx = updated.findIndex((e) => e.id === targetId);
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    setLocalEntries(updated);
    onReorder?.(updated);
    dragItemId.current = null;
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    dragItemId.current = null;
    setDragOverId(null);
  };

  const isAnyStockHovered =
    hoveredStockId !== null &&
    localEntries.some((e) => e.id === hoveredStockId);

  const showIcons = isHeaderHovered || isAnyStockHovered;

  return (
    <div className="mx-2 my-1.5 rounded border border-gray-300 shrink-0">
      {/* Group Header */}
      <div
        className="flex items-center justify-between px-2 py-1.5"
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
        style={{
          borderColor: "var(--border-overlay-12)",
          backgroundColor: "var(--bg-overlay-08)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="text-[12px] font-semibold"
            style={{ color: "var(--text-on-dark-80)" }}
          >
            {name}&nbsp;
            <span
              className="font-normal text-[11px]"
              style={{ color: "var(--text-on-dark-45)" }}
            >
              ({localEntries.length})
            </span>
          </span>
        </div>

        {/* Icons: visible on header hover OR any stock row hover */}
        <div
          className="flex items-center gap-2.5 transition-opacity duration-150"
          style={{ opacity: showIcons ? 1 : 0 }}
        >
          <button
            onClick={() => setIsCollapsed((p) => !p)}
            title={isCollapsed ? "Expand" : "Collapse"}
            className="text-black hover:text-orange-500 transition-colors duration-200 flex items-center bg-transparent border-none cursor-pointer p-0.5"
          >
            {isCollapsed ? (
              <IoChevronDown size={14} />
            ) : (
              <IoChevronUp size={14} />
            )}
          </button>

          <button
            title="Expand view"
            className="text-black hover:text-orange-500 transition-colors duration-200 flex items-center bg-transparent border-none cursor-pointer p-0.5"
          >
            <GoScreenFull size={14} />
          </button>

          <button
            title="Edit group"
            className="text-black hover:text-orange-500 transition-colors duration-200 flex items-center bg-transparent border-none cursor-pointer p-0.5"
          >
            <AiOutlineEdit size={14} />
          </button>

          <button
            title="More options"
            className="text-black hover:text-orange-500 transition-colors duration-200 flex items-center bg-transparent border-none cursor-pointer p-0.5"
          >
            <HiDotsVertical size={16} />
          </button>
        </div>
      </div>

      {/* Stock Rows */}
      {!isCollapsed && (
        <div style={{ overflow: "visible" }}>
          {localEntries.map((entry) => (
            <StockRow
              key={entry.id}
              entry={entry}
              quote={quotes[entry.token]}
              isHovered={hoveredStockId === entry.id}
              isExpanded={expandedStockId === entry.id}
              onHover={onHover}
              onClick={onStockClick}
              onRemove={onRemove}
              isDragOver={dragOverId === entry.id}
              isDragging={dragItemId.current === entry.id}
              onDragStart={() => handleDragStart(entry.id)}
              onDragOver={(e) => handleDragOver(e, entry.id)}
              onDrop={(e) => handleDrop(e, entry.id)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
}