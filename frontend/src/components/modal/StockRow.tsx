import { useState } from "react";
import { RiArrowUpSLine, RiArrowDownSLine } from "react-icons/ri";
import ActionButton from "./ActionButton";
import { RiDeleteBin5Line } from "react-icons/ri";
import MoreOptionsMenu from "./MoreOptionsMenu";
import OrderModal from "./OrderModal";

interface StockRowProps {
    entry: any;
    quote: any;
    isHovered: boolean;
    isExpanded: boolean;
    onHover: (id: number | null) => void;
    onClick: (id: number) => void;
    onRemove: (id: number) => void;
}

export default function StockRow({
    entry,
    quote,
    isHovered,
    isExpanded,
    onHover,
    onClick,
    onRemove,
}: StockRowProps) {
    const isUp = quote ? quote.isUp : true;
    const ltp = quote?.ltp ?? 0;
    const change = quote?.change ?? 0;
    const pct = quote?.pct ?? 0;
    const open = quote?.open ?? 0;
    const low = quote?.low ?? 0;
    const high = quote?.high ?? 0;
    const prevClose = quote?.prevClose ?? 0;

    const priceBarPct =
        high > low ? Math.min(100, Math.max(0, ((ltp - low) / (high - low)) * 100)) : 50;

    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // Order modal: null = closed, "buy" = opened from B (blue), "sell" = opened from S (orange)
    const [orderMode, setOrderMode] = useState<"buy" | "sell" | null>(null);

    return (
        <>
            <div
                className="flex items-center justify-between px-3 py-2.5 border-b cursor-pointer relative"
                style={{
                    borderColor: "var(--border-overlay-08)",
                    backgroundColor: isHovered || isExpanded ? "var(--bg-overlay-06)" : "transparent",
                    minHeight: "42px",
                }}
                onMouseEnter={() => onHover(entry.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onClick(entry.id)}
            >
                {/* Left: Symbol + exchange badge */}
                <div className="flex-1 min-w-0">
                    <span
                        className="text-sm font-semibold truncate"
                        style={{ color: isUp ? "#22c55e" : "#ef4444" }}
                    >
                        {entry.symbol}
                    </span>
                    <span
                        className="text-[9px] px-1 ml-1.5 rounded font-bold"
                        style={{
                            color: "var(--text-on-dark-45)",
                            backgroundColor: "var(--bg-overlay-10)",
                        }}
                    >
                        {entry.exchange}
                    </span>
                </div>

                {/* Right: change/pct + ltp — hidden when hovered or expanded */}
                {!isHovered && !isExpanded && (
                    <div className="text-right shrink-0 ml-2">
                        <div className="text-xs font-semibold" style={{ color: "var(--text-on-dark-55)" }}>
                            {change > 0 ? "+" : ""}
                            {change.toFixed(2)}&nbsp;&nbsp;{pct > 0 ? "+" : ""}
                            {pct.toFixed(2)}%
                        </div>
                        <div className="flex items-center justify-end gap-0.5">
                            {isUp ? (
                                <RiArrowUpSLine size={12} style={{ color: "#22c55e" }} />
                            ) : (
                                <RiArrowDownSLine size={12} style={{ color: "#ef4444" }} />
                            )}
                            <span className="text-xs font-semibold" style={{ color: isUp ? "#22c55e" : "#ef4444" }}>
                                {ltp.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Hover action buttons - stay visible while expanded too, not just on hover */}
                {(isHovered || isExpanded) && (
                    <div
                        className="flex items-center gap-1.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* B opens the order modal defaulted to blue (Buy) */}
                        <ActionButton
                            color="#3b7ddd"
                            label="B"
                            className="rounded-md"
                            onClick={() => setOrderMode("buy")}
                        />
                        {/* S opens the same modal defaulted to orange (Sell) */}
                        <ActionButton
                            color="#f0532e"
                            label="S"
                            className="rounded-md"
                            onClick={() => setOrderMode("sell")}
                        />

                        {/* Lines/menu button — toggles expanded details open/close */}
                        <ActionButton
                            onClick={() => onClick(entry.id)}
                            icon={
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M3 5h10M3 8h10M3 11h10" strokeLinecap="round" />
                                </svg>
                            }
                        />
                        <ActionButton
                            icon={
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M2 12l4-5 3 3 4-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            }
                        />
                        <ActionButton
                            onClick={() => onRemove(entry.id)}
                            icon={
                                <RiDeleteBin5Line className="w-3.5 h-3.5" />
                            }
                        />
                        <div className="relative">
                            <ActionButton
                                onClick={() => setShowMoreMenu((prev) => !prev)}
                                icon={
                                    <span style={{ fontSize: "11px", letterSpacing: "1px", color: "var(--text-on-dark-65)" }}>
                                        •••
                                    </span>
                                }
                            />
                            {showMoreMenu && (
                                <MoreOptionsMenu onClose={() => setShowMoreMenu(false)} />
                            )}
                        </div>
                    </div>
                )}

                {/* Order modal popup — anchored to this row, opened by B (blue) / S (orange) */}
                {orderMode && (
                    <div
                        className="absolute right-0 top-full z-50 mt-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <OrderModal
                            symbol={entry.symbol}
                            bsePrice={quote?.bse ?? ltp}
                            nsePrice={quote?.nse ?? ltp}
                            startPrice={ltp}
                            defaultOrange={orderMode === "sell"}
                            onClose={() => setOrderMode(null)}
                        />
                    </div>
                )}
            </div>

            {/* Expanded Detail Card - NO action buttons here */}
            {isExpanded && (
                <div
                    className="border-b px-4 py-3"
                    style={{
                        borderColor: "var(--border-overlay-12)",
                        backgroundColor: "var(--bg-overlay-04)",
                    }}
                >
                    {/* OHLC */}
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
                            style={{
                                left: "25%",
                                right: "20%",
                                top: 0,
                                bottom: 0,
                                backgroundColor: "#ef4444",
                            }}
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