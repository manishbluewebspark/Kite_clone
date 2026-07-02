import { useState, useRef } from "react";
import { RiArrowUpSLine, RiArrowDownSLine, RiDeleteBin5Line } from "react-icons/ri";
import { FiMoreHorizontal } from "react-icons/fi";
import ActionButton from "./ActionButton";
import MoreOptionsMenu from "./MoreOptionsMenu";
import OrderModal from "./OrderModal";
import { AiOutlineAlignCenter } from "react-icons/ai";
import { IoTrendingUpOutline } from "react-icons/io5";

interface StockRowProps {
  entry: any;
  quote: any;
  isHovered: boolean;
  isExpanded: boolean;
  onHover: (id: number | null) => void;
  onClick: (id: number) => void;
  onRemove: (id: number) => void;
  // Drag props
  isDragOver?: boolean;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export default function StockRow({
  entry,
  quote,
  isHovered,
  isExpanded,
  onHover,
  onClick,
  onRemove,
  isDragOver,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: StockRowProps) {
  const isUp = quote ? quote.isUp : true;
  const ltp = quote?.ltp ?? 0;
  // const change = quote?.change ?? 0;
  // const pct = quote?.pct ?? 0;
  const pct = quote?.changePct ?? quote?.pct ?? 0;
  const change = quote?.change ?? 0;
  const open = quote?.open ?? 0;
  const low = quote?.low ?? 0;
  const high = quote?.high ?? 0;
  const prevClose = quote?.prevClose ?? 0;

  const priceBarPct =
    high > low ? Math.min(100, Math.max(0, ((ltp - low) / (high - low)) * 100)) : 50;

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [orderMode, setOrderMode] = useState<"buy" | "sell" | null>(null);

  // Track whether drag was initiated from the handle
  const dragFromHandle = useRef(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (!dragFromHandle.current) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(entry.id));
    onDragStart?.();
  };

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={() => {
          dragFromHandle.current = false;
          onDragEnd?.();
        }}
        className="flex items-center justify-between px-3 py-2 hover: cursor-pointer relative transition-colors duration-100 group/row"
        style={{
          borderColor: isDragOver ? "#387ed1" : "#f3f4f6",
          borderTopWidth: isDragOver ? "2px" : "1px",
          backgroundColor: isDragging
            ? "rgba(0,0,0,0.04)"
            : isHovered || isExpanded
              ? "#f0f2f5"  // light gray - aap apni choice ka color daalein
              : "transparent",
          minHeight: "42px",
          opacity: isDragging ? 0.35 : 1,
        }}
        onMouseEnter={() => onHover(entry.id)}
        onMouseLeave={() => {
          onHover(null);
          dragFromHandle.current = false;
        }}
        onClick={() => onClick(entry.id)}
      >
        {/* ── Drag Handle — absolute outside row, same style as group header ── */}
        <div
          title="Drag to reorder"
          className="cursor-grab active:cursor-grabbing flex items-center justify-center"
          style={{
            position: "absolute",
            left: "-4px",
            top: "55%",
            transform: "translateY(-50%)",
            color: "var(--text-on-dark-30)",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.15s",
            width: "9px",
            height: "20px",
          }}
          onMouseDown={() => { dragFromHandle.current = true; }}
          onMouseUp={() => { dragFromHandle.current = false; }}
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
            <circle cx="3" cy="2.5" r="1.2" />
            <circle cx="7" cy="2.5" r="1.2" />
            <circle cx="3" cy="7" r="1.2" />
            <circle cx="7" cy="7" r="1.2" />
            <circle cx="3" cy="11.5" r="1.2" />
            <circle cx="7" cy="11.5" r="1.2" />
          </svg>
        </div>

        {/* Left: Symbol + exchange badge */}
        <div className="flex-1 min-w-0">
          <span
            className="text-xs truncate"
            style={{ color: isUp ? "#22c55e" : "#ef4444" }}
          >
            {entry.symbol}
          </span>
          <span
            className="text-[8px] px-1 ml-1.5 rounded font-semibold"
            style={{ color: "var(--text-on-dark-45)" }}
          >
            {entry.exchange}
          </span>
        </div>

        {/* Right: change/pct + ltp — hidden when hovered or expanded */}
        {!isHovered && !isExpanded && (
          <div className="flex items-center gap-3 text-right shrink-0 ml-2">
            {/* Change & Pct - fixed width, right aligned */}
            <div
              className="text-xs font-semibold whitespace-nowrap flex justify-end gap-1"
              style={{ color: "var(--text-on-dark-55)", minWidth: "90px" }}
            >
              <span style={{ minWidth: "45px", textAlign: "right" }}>
                {change > 0 ? "+" : ""}
                {change.toFixed(2)}
              </span>
              <span className="text-gray-500" style={{ minWidth: "48px", textAlign: "right" }}>
                {pct > 0 ? "+" : ""}
                {pct.toFixed(2)}%
              </span>
            </div>

            {/* Arrow - fixed width, center aligned */}
            <div className="flex items-center justify-center" style={{ minWidth: "12px" }}>
              {isUp ? (
                <RiArrowUpSLine size={12} style={{ color: "#22c55e" }} />
              ) : (
                <RiArrowDownSLine size={12} style={{ color: "#ef4444" }} />
              )}
            </div>

            {/* LTP - fixed width, right aligned */}
            <div className="flex items-center justify-end" style={{ minWidth: "50px" }}>
              <span
                className="text-xs font-semibold"
                style={{ color: isUp ? "#22c55e" : "#ef4444" }}
              >
                {ltp.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Hover action buttons */}
        {(isHovered || isExpanded) && (
          <div
            className="flex items-center gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionButton
              color="#4584F5"
              label="B"
              className="rounded-sm cursor-pointer"
              onClick={() => setOrderMode("buy")}
            />
            <ActionButton
              color="#FF551F"
              label="S"
              className="rounded-sm cursor-pointer"
              onClick={() => setOrderMode("sell")}
            />
            <ActionButton
              onClick={() => onClick(entry.id)}
              className="rounded-xs"
              icon={<AiOutlineAlignCenter style={{ rotate: "180deg" }} size={12} />}
            />
            <ActionButton
              className="rounded-xs"
              icon={<IoTrendingUpOutline size={12} />}
            />
            <ActionButton
              className="rounded-xs"
              onClick={() => onRemove(entry.id)}
              icon={<RiDeleteBin5Line />}
            />
            <div className="relative">
              <ActionButton
                className="rounded-xs"
                onClick={() => setShowMoreMenu((prev) => !prev)}
                icon={<FiMoreHorizontal size={14} />}
              />
              {showMoreMenu && (
                <MoreOptionsMenu onClose={() => setShowMoreMenu(false)} />
              )}
            </div>
          </div>
        )}

        {/* Order modal */}
        {orderMode && (
          <div
            className="absolute right-0 top-full z-200 mt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <OrderModal
              symbol={entry.symbol}
              exchange={entry.exchange}
              token={entry.token}
              bfoPrice={quote?.bse ?? ltp}
              startPrice={ltp}
              defaultOrange={orderMode === "sell"}
              onClose={() => setOrderMode(null)}
            />
          </div>
        )}
      </div>

      {/* Expanded Detail Card */}
      {isExpanded && (
        <div
          className="border-b px-4 py-3"
          style={{
            borderColor: "#f3f4f6",
            backgroundColor: "var(--bg-overlay-04)",
          }}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex justify-between">
              <span style={{ color: "var(--text-on-dark-45)" }}>Open</span>
              <span className="font-semibold" style={{ color: "var(--text-on-dark-80)" }}>
                {open.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-on-dark-45)" }}>Prev. Close</span>
              <span className="font-semibold" style={{ color: "var(--text-on-dark-80)" }}>
                {prevClose.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-on-dark-45)" }}>Low</span>
              <span className="font-semibold" style={{ color: "#ef4444" }}>
                {low.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-on-dark-45)" }}>High</span>
              <span className="font-semibold" style={{ color: "var(--text-on-dark-80)" }}>
                {high.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Price range bar */}
          <div className="mt-2.5 relative" style={{ height: "4px" }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: "var(--bg-overlay-16)" }}
            />
            <div
              className="absolute rounded-full"
              style={{ left: "25%", right: "20%", top: 0, bottom: 0, backgroundColor: "#ef4444" }}
            />
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${priceBarPct}%`,
                top: "-2px",
                transform: "translateX(-50%)",
                backgroundColor: "var(--text-on-dark-80)",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}