import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X, Layers, RotateCcw, Pencil, ChevronUp } from "lucide-react";
import { useDemoTradeStore } from "../../store/useDemoTradeStore";
import toast from 'react-hot-toast';

type TabKey = "quick" | "regular" | "iceberg";

const TABS: { key: TabKey; label: string }[] = [
  { key: "quick", label: "Quick" },
  { key: "regular", label: "Regular" },
  { key: "iceberg", label: "Iceberg" },
];

// ── Lot size detection ──
function getLotSize(symbol: string): number {
  const s = symbol.toUpperCase();
  if (s.includes("MIDCPNIFTY")) return 120;
  if (s.includes("BANKNIFTY")) return 30;
  if (s.includes("FINNIFTY")) return 60;
  if (s.includes("NIFTY")) return 65;
  if (s.includes("SENSEX")) return 20;
  return 1;
}

interface OrderModalProps {
  symbol?: string;
  exchange: string;
  token: string;
  bfoPrice?: number;
  startPrice?: number;
  defaultOrange?: boolean;
  onClose?: () => void;
  onOrderPlaced?: () => void;
}

export default function OrderModal({
  symbol = "SENSEX JUN 77200 CE",
  exchange,
  token,
  bfoPrice = 433.35,
  startPrice = 433.35,
  defaultOrange = false,
  onClose,
  onOrderPlaced,
}: OrderModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("regular");
  const [isOrange, setIsOrange] = useState(defaultOrange);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const { openTrade } = useDemoTradeStore();

  // ── Draggable state ──
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input")) return;
    dragging.current = true;
    const rect = modalRef.current!.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button, input")) return;
    const touch = e.touches[0];
    dragging.current = true;
    const rect = modalRef.current!.getBoundingClientRect();
    offset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging.current) return;
    const touch = e.touches[0];
    setPos({
      x: touch.clientX - offset.current.x,
      y: touch.clientY - offset.current.y,
    });
    e.preventDefault();
  }, []);

  const onTouchEnd = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  useEffect(() => {
    setIsOrange(defaultOrange);
  }, [defaultOrange]);

  // ── Lot size based qty ──
  const lotSize = getLotSize(symbol);
  const [qty, setQty] = useState(lotSize);
  const [price, setPrice] = useState(startPrice);
  const [intraday, setIntraday] = useState(true);
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [legs, setLegs] = useState(2);
  const [triggerPrice, setTriggerPrice] = useState(0);
  const [showNudge, setShowNudge] = useState(false);

  // Reset qty when symbol changes (new modal open)
  useEffect(() => {
    setQty(getLotSize(symbol));
  }, [symbol]);

  const accent = isOrange ? "#FF7A1A" : "#2563EB";

  // bump increases/decreases by 1 lot
  const bump = (delta: number) =>
    setQty((q) => Math.max(lotSize, q + delta * lotSize));

  // Derived lot count for display
  const lotCount = Math.round(qty / lotSize);

  const handlePlaceOrder = async () => {
    setError("");
    setPlacing(true);
    const transactionType = isOrange ? "SELL" : "BUY";

    try {
      const trade = await openTrade({
        symbol,
        name: symbol,
        exchange,
        token,
        transaction_type: transactionType,
        quantity: qty,
      });

      setPlacing(false);

      if (trade) {
        toast.success(`Order placed successfully! ${transactionType} ${qty} ${symbol}`);
        onOrderPlaced?.();
        onClose?.();
      } else {
        toast.error("Failed to place order. Please try again.");
        setError("Failed to place order. Try again.");
      }
    } catch (err: any) {
      setPlacing(false);
      const message = err?.message || String(err) || "Something went wrong while placing order";
      toast.error(message);
      setError(message || "Failed to place order. Try again.");
    }
  };

  const isQuick = activeTab === "quick";
  const modalWidth = isQuick ? "280px" : "540px";

  const modalPositionStyle: React.CSSProperties = pos
    ? {
      top: pos.y,
      left: pos.x,
      bottom: "auto",
      transform: "none",
      maxHeight: "90vh",
      overflowY: "auto",
      width: modalWidth,
    }
    : {
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      maxHeight: "90vh",
      overflowY: "auto",
      width: modalWidth,
      transition: "width 0.2s ease",
    };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999]" onClick={onClose} />

      <div
        ref={modalRef}
        className="fixed z-[10000]"
        style={modalPositionStyle}
      >
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            width: "100%",
          }}
          className="rounded-sm shadow-xl overflow-hidden border border-gray-200 bg-white select-none relative"
        >
          {/* ── Header ── */}
          <div
            className="px-4 pt-3 pb-2.5"
            style={{ backgroundColor: accent, cursor: dragging.current ? "grabbing" : "grab" }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-[15px] tracking-wide">
                {symbol}
              </span>
              <div className="flex items-center gap-2">
                {activeTab === "iceberg" && (
                  <button
                    onClick={() => setShowNudge((v) => !v)}
                    className="relative w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold"
                  >
                    N
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-white text-white text-[7px] flex items-center justify-center font-bold leading-none">
                      1
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setIsOrange((v) => !v)}
                  aria-pressed={isOrange}
                  aria-label="Toggle buy/sell"
                  className="relative w-9 h-5 rounded-full focus:outline-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.35)" }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300"
                    style={{ transform: isOrange ? "translateX(16px)" : "translateX(0px)" }}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[13px] text-white/95">
              <span className="font-medium">BFO</span>
              <span>₹{bfoPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center border-b-2 border-gray-200 bg-gray-50 px-1">
            <div className="flex flex-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "px-3 py-2.5 text-[13px] relative whitespace-nowrap flex items-center gap-1",
                    activeTab === tab.key ? "" : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                  style={activeTab === tab.key ? { color: accent } : undefined}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span
                      className="absolute left-0 right-0 -bottom-px h-[2px]"
                      style={{ backgroundColor: accent }}
                    />
                  )}
                </button>
              ))}
            </div>
            <Pencil size={13} className="text-gray-400 mr-2 shrink-0" />
          </div>

          {/* ── Nudge popup ── */}
          {showNudge && (
            <div
              className="absolute z-[10001] bg-white border border-gray-200 rounded-md shadow-lg p-3 w-[230px]"
              style={{ top: "88px", right: "12px" }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    N
                  </span>
                  <span className="text-[13px] font-semibold text-gray-800">Nudge</span>
                </div>
                <button onClick={() => setShowNudge(false)} className="text-gray-400 hover:text-gray-600 mt-0.5">
                  <X size={14} />
                </button>
              </div>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                Iceberg MARKET orders are not allowed on BFO due to regulatory reasons. Try placing
                MARKET order with{" "}
                <span className="text-blue-500 cursor-pointer">market protection</span> enabled.
              </p>
            </div>
          )}

          {/* ── Body ── */}
          <div className="px-4 pt-3.5 pb-2">
            {activeTab === "quick" && (
              <QuickBody
                qty={qty}
                setQty={setQty}
                bump={bump}
                lotSize={lotSize}
                lotCount={lotCount}
                price={price}
                setPrice={setPrice}
                accent={accent}
              />
            )}
            {activeTab === "regular" && (
              <RegularBody
                qty={qty}
                bump={bump}
                setQty={setQty}
                lotSize={lotSize}
                lotCount={lotCount}
                price={price}
                setPrice={setPrice}
                intraday={intraday}
                setIntraday={setIntraday}
                orderType={orderType}
                setOrderType={setOrderType}
                triggerPrice={triggerPrice}
                setTriggerPrice={setTriggerPrice}
                accent={accent}
              />
            )}
            {activeTab === "iceberg" && (
              <IcebergBody
                qty={qty}
                bump={bump}
                setQty={setQty}
                lotSize={lotSize}
                lotCount={lotCount}
                price={price}
                setPrice={setPrice}
                intraday={intraday}
                setIntraday={setIntraday}
                orderType={orderType}
                setOrderType={setOrderType}
                triggerPrice={triggerPrice}
                setTriggerPrice={setTriggerPrice}
                legs={legs}
                setLegs={setLegs}
                accent={accent}
              />
            )}
            {error && <div className="mt-2 text-[12px] text-red-500">{error}</div>}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-4 py-2 gap-4 bg-gray-50">
            <div className="flex items-center gap-4 text-[12px]">
              <span className="text-gray-500 whitespace-nowrap">
                Required{" "}
                <span style={{ color: accent }} className="font-medium">
                  ₹{(qty * price).toFixed(2)} + 26.85
                </span>
              </span>
              <span className="text-gray-500 flex items-center gap-1 whitespace-nowrap">
                Available{" "}
                <span style={{ color: accent }} className="font-medium">
                  ₹1,38,231.50
                </span>
                <RotateCcw size={12} className="text-gray-400 ml-0.5" />
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="px-6 py-1.5 rounded-sm text-white text-[14px] font-medium disabled:opacity-60 whitespace-nowrap"
                style={{ backgroundColor: accent }}
              >
                {placing ? "Placing..." : isOrange ? "Sell" : "Buy"}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-sm border border-gray-300 text-gray-700 text-[14px] font-medium bg-white hover:bg-gray-50 whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ──────────────────────────────────────────────
   Shared sub-components
────────────────────────────────────────────── */

function QtyField({
  qty,
  bump,
  accent,
  lotSize,
  setQty,
}: {
  qty: number;
  bump: (d: number) => void;
  accent: string;
  lotSize: number;
  setQty?: (n: number) => void;
}) {
  return (
    <div className="flex flex-col" style={{ width: "140px" }}>
      <div className="relative flex items-stretch border border-gray-300 rounded-sm bg-white group" style={{ height: "44px" }}>

        {/* Floating Label */}
        <span className="absolute -top-2 left-2 text-[11px] font-medium text-gray-500 bg-white px-1 z-10 leading-none">
          Qty.
        </span>

        {/* Input */}
        <input
          type="number"
          value={qty}
          min={lotSize}
          step={lotSize}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (setQty && !isNaN(val) && val >= lotSize) {
              // Snap to nearest lot multiple
              const snapped = Math.round(val / lotSize) * lotSize;
              setQty(Math.max(lotSize, snapped));
            }
          }}
          className="flex-1 min-w-0 px-2 text-[15px] font-medium text-gray-900 outline-none bg-transparent
                     [appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
        />

        {/* Up/Down arrows */}
        <div className="flex flex-col w-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => bump(1)}
            className="flex-1 flex items-center justify-center hover:bg-gray-100 border-b border-gray-400 text-gray-500"
          >
            <ChevronUp size={10} />
          </button>
          <button
            onClick={() => bump(-1)}
            className="flex-1 flex items-center justify-center hover:bg-gray-100 text-gray-500"
          >
            <ChevronDown size={10} />
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-stretch border-l border-gray-300">
          <button className="w-[32px] flex items-center justify-center hover:bg-gray-200 text-gray-400">
            <Layers size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DisabledPriceField({ label = "Market price" }: { label?: string }) {
  return (
    <div>
      <div
        className="relative flex items-stretch border border-gray-200 rounded-sm px-2.5"
        style={{
          height: "44px",
          backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 4px, #e5e7eb 4px, #e5e7eb 5px)",
          backgroundColor: "#f9fafb",
        }}
      >
        <span className="absolute -top-2 left-2 text-[11px] text-gray-400 bg-white px-1 z-10 leading-none">
          {label}
        </span>
        <input
          value="0"
          readOnly
          className="flex-1 min-w-0 text-[14px] outline-none text-gray-300 bg-transparent"
        />
        <button className="text-gray-300 shrink-0">
          <Pencil size={13} />
        </button>
      </div>
    </div>
  );
}

function PriceField({
  price,
  setPrice,
  label = "Price",
  showClear = true,
}: {
  price: number;
  setPrice: (n: number) => void;
  label?: string;
  showClear?: boolean;
}) {
  return (
    <div>
      <label className="text-[12px] text-gray-500">{label}</label>
      <div className="flex items-center mt-1 border border-gray-300 rounded-sm overflow-hidden bg-white">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
          className="flex-1 min-w-0 px-2.5 py-1.5 text-[14px] outline-none w-full
                     [appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
        />
        {showClear && (
          <button
            onClick={() => setPrice(0)}
            className="px-2 text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function SegRadio({
  checked,
  onClick,
  label,
  sub,
  accent,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
  accent: string;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-[13px] text-gray-700">
      <span
        className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
        style={{ borderColor: checked ? accent : "#9CA3AF" }}
      >
        {checked && (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
        )}
      </span>
      <span>
        {label}
        {sub && <span className="text-gray-400 ml-1">{sub}</span>}
      </span>
    </button>
  );
}

/* ──────────────────────────────────────────────
   Tab bodies
────────────────────────────────────────────── */

function QuickBody({
  qty,
  setQty,
  bump,
  lotSize,
  lotCount,
  price,
  setPrice,
  accent,
}: {
  qty: number;
  setQty: (n: number) => void;
  bump: (d: number) => void;
  lotSize: number;
  lotCount: number;
  price: number;
  setPrice: (n: number) => void;
  accent: string;
}) {
  const [intraday, setIntraday] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <QtyField qty={qty} bump={bump} accent={accent} lotSize={lotSize} setQty={setQty} />
      <DisabledPriceField label="Market price" />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={intraday}
            onChange={() => setIntraday((v) => !v)}
            className="w-3.5 h-3.5"
            style={{ accentColor: accent }}
          />
          Intraday
        </label>
        <span className="text-[12px] text-gray-400">
          {lotCount} lot{lotCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

function RegularBody({
  qty,
  bump,
  setQty,
  lotSize,
  lotCount,
  price,
  setPrice,
  intraday,
  setIntraday,
  orderType,
  setOrderType,
  triggerPrice,
  setTriggerPrice,
  accent,
}: {
  qty: number;
  bump: (d: number) => void;
  setQty: (n: number) => void;
  lotSize: number;
  lotCount: number;
  price: number;
  setPrice: (n: number) => void;
  intraday: boolean;
  setIntraday: (v: boolean) => void;
  orderType: "market" | "limit";
  setOrderType: (v: "market" | "limit") => void;
  triggerPrice: number;
  setTriggerPrice: (n: number) => void;
  accent: string;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [validity, setValidity] = useState<"day" | "ioc" | "minutes">("day");
  const [marketProtection, setMarketProtection] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Intraday / Overnight + Advanced */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <SegRadio checked={intraday} onClick={() => setIntraday(true)} label="Intraday" sub="MIS" accent={accent} />
          <SegRadio checked={!intraday} onClick={() => setIntraday(false)} label="Overnight" sub="NRML" accent={accent} />
        </div>
        <button
          onClick={() => setAdvanced((v) => !v)}
          className="text-[12px] font-medium flex items-center gap-0.5"
          style={{ color: accent }}
        >
          Advanced
          <ChevronDown
            size={13}
            style={{ transform: advanced ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          />
        </button>
      </div>

      {/* Qty / Market price / Trigger price */}
      <div className="grid grid-cols-3 gap-2.5 mt-4">
        <div className="min-w-0">
          <QtyField qty={qty} bump={bump} accent={accent} lotSize={lotSize} setQty={setQty} />
          <div className="text-[12px] text-gray-400 mt-1">
            {lotCount} lot{lotCount !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="min-w-0">
          <DisabledPriceField label="Market price" />
        </div>
        <div className="min-w-0">
          <div
            className="relative flex items-stretch border border-gray-200 rounded-sm px-2.5"
            style={{
              height: "44px",
              backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 4px, #e5e7eb 4px, #e5e7eb 5px)",
              backgroundColor: "#f9fafb",
            }}
          >
            <span className="absolute -top-2 left-2 text-[11px] text-gray-400 bg-white px-1 z-10 leading-none">
              Trigger price
            </span>
            <div className="flex-1 text-[14px] text-gray-300 flex items-center">
              0
            </div>
          </div>
        </div>
      </div>

      {/* Market / Limit / SL / SL-M */}
      <div className="flex items-center gap-5">
        <SegRadio checked={orderType === "market"} onClick={() => setOrderType("market")} label="Market" accent={accent} />
        <SegRadio checked={orderType === "limit"} onClick={() => setOrderType("limit")} label="Limit" accent={accent} />
        <span className="ml-auto flex items-center gap-4">
          <SegRadio checked={false} onClick={() => { }} label="SL" accent={accent} />
          <SegRadio checked={false} onClick={() => { }} label="SL-M" accent={accent} />
        </span>
      </div>

      {/* Advanced panel */}
      {advanced && (
        <div className="border-t border-gray-100 pt-3 flex gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-gray-500">Validity</span>
            <label
              className="flex items-center gap-1.5 text-[13px] text-gray-700 cursor-pointer"
              onClick={() => setValidity("day")}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                style={{ borderColor: validity === "day" ? accent : "#9CA3AF" }}
              >
                {validity === "day" && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                )}
              </span>
              Day
            </label>
            <label
              className="flex items-center gap-1.5 text-[13px] text-gray-700 cursor-pointer"
              onClick={() => setValidity("ioc")}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                style={{ borderColor: validity === "ioc" ? accent : "#9CA3AF" }}
              >
                {validity === "ioc" && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                )}
              </span>
              Immediate <span className="text-gray-400 ml-1">IOC</span>
            </label>
            <label
              className="flex items-center gap-1.5 text-[13px] text-gray-700 cursor-pointer"
              onClick={() => setValidity("minutes")}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                style={{ borderColor: validity === "minutes" ? accent : "#9CA3AF" }}
              >
                {validity === "minutes" && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                )}
              </span>
              Minutes
            </label>
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] text-gray-300">&nbsp;</span>
            <div className="flex items-center border border-gray-200 rounded-sm bg-gray-50 px-2.5 py-1.5 text-[13px] text-gray-400 gap-1">
              <span className="flex-1">1 minute</span>
              <ChevronDown size={13} />
            </div>
            <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={marketProtection}
                onChange={() => setMarketProtection((v) => !v)}
                className="w-3.5 h-3.5"
                style={{ accentColor: accent }}
              />
              Market protection
            </label>
          </div>

          <div className="flex flex-col gap-1.5 w-28">
            <label className="text-[12px] text-gray-400">Disclosed qty.</label>
            <div className="border border-gray-200 rounded-sm bg-gray-50 px-2.5 py-1.5 text-[14px] text-gray-300">
              0
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IcebergBody({
  qty,
  bump,
  setQty,
  lotSize,
  lotCount,
  price,
  setPrice,
  intraday,
  setIntraday,
  orderType,
  setOrderType,
  triggerPrice,
  setTriggerPrice,
  legs,
  setLegs,
  accent,
}: {
  qty: number;
  bump: (d: number) => void;
  setQty: (n: number) => void;
  lotSize: number;
  lotCount: number;
  price: number;
  setPrice: (n: number) => void;
  intraday: boolean;
  setIntraday: (v: boolean) => void;
  orderType: "market" | "limit";
  setOrderType: (v: "market" | "limit") => void;
  triggerPrice: number;
  setTriggerPrice: (n: number) => void;
  legs: number;
  setLegs: (n: number) => void;
  accent: string;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [validity, setValidity] = useState<"day" | "ioc" | "minutes">("day");
  const [marketProtection, setMarketProtection] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Intraday / Overnight + Advanced */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <SegRadio checked={intraday} onClick={() => setIntraday(true)} label="Intraday" sub="MIS" accent={accent} />
          <SegRadio checked={!intraday} onClick={() => setIntraday(false)} label="Overnight" sub="NRML" accent={accent} />
        </div>
        <button
          onClick={() => setAdvanced((v) => !v)}
          className="text-[12px] font-medium flex items-center gap-0.5"
          style={{ color: accent }}
        >
          Advanced
          <ChevronDown
            size={13}
            style={{ transform: advanced ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          />
        </button>
      </div>

      {/* Qty / Market price / Trigger price */}
      <div className="grid grid-cols-3 gap-2.5 mt-4">
        <div className="min-w-0">
          <QtyField qty={qty} bump={bump} accent={accent} lotSize={lotSize} setQty={setQty} />
          <div className="text-[12px] text-gray-400 mt-1">
            {lotCount} lot{lotCount !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="min-w-0">
          <DisabledPriceField label="Market price" />
        </div>
        <div className="min-w-0">
          <div className="relative flex items-stretch border border-gray-200 rounded-sm bg-gray-50" style={{ height: "44px" }}>
            <span className="absolute -top-2 left-2 text-[11px] text-gray-400 bg-gray-50 px-1 z-10 leading-none">
              Trigger price
            </span>
            <div className="flex-1 px-2.5 text-[14px] text-gray-300 flex items-center">
              0
            </div>
          </div>
        </div>
      </div>

      {/* Market / Limit / SL / SL-M */}
      <div className="flex items-center gap-5">
        <SegRadio checked={orderType === "market"} onClick={() => setOrderType("market")} label="Market" accent={accent} />
        <SegRadio checked={orderType === "limit"} onClick={() => setOrderType("limit")} label="Limit" accent={accent} />
        <span className="ml-auto flex items-center gap-4">
          <SegRadio checked={false} onClick={() => { }} label="SL" accent={accent} />
          <SegRadio checked={false} onClick={() => { }} label="SL-M" accent={accent} />
        </span>
      </div>

      {/* Number of legs */}
      <div className="w-40">
        <label className="text-[12px] text-gray-500">Number of legs</label>
        <div className="flex items-center mt-1 border border-gray-300 rounded-sm overflow-hidden">
          <input
            type="number"
            value={legs}
            onChange={(e) => setLegs(parseInt(e.target.value) || 1)}
            className="flex-1 px-2.5 py-1.5 text-[14px] outline-none
                       [appearance:textfield]
                       [&::-webkit-outer-spin-button]:appearance-none
                       [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
      <span className="text-[12px] text-gray-400">
        {lotCount} lot{lotCount !== 1 ? "s" : ""} / {Math.max(1, qty)} qty. per leg
      </span>

      {/* Advanced panel */}
      {advanced && (
        <div className="border-t border-gray-100 pt-3 flex gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-gray-500">Validity</span>
            <label
              className="flex items-center gap-1.5 text-[13px] text-gray-700 cursor-pointer"
              onClick={() => setValidity("day")}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                style={{ borderColor: validity === "day" ? accent : "#9CA3AF" }}
              >
                {validity === "day" && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                )}
              </span>
              Day
            </label>
            <label
              className="flex items-center gap-1.5 text-[13px] text-gray-700 cursor-pointer"
              onClick={() => setValidity("ioc")}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                style={{ borderColor: validity === "ioc" ? accent : "#9CA3AF" }}
              >
                {validity === "ioc" && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                )}
              </span>
              Immediate <span className="text-gray-400 ml-1">IOC</span>
            </label>
            <label
              className="flex items-center gap-1.5 text-[13px] text-gray-700 cursor-pointer"
              onClick={() => setValidity("minutes")}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                style={{ borderColor: validity === "minutes" ? accent : "#9CA3AF" }}
              >
                {validity === "minutes" && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                )}
              </span>
              Minutes
            </label>
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] text-gray-300">&nbsp;</span>
            <div className="flex items-center border border-gray-200 rounded-sm bg-gray-50 px-2.5 py-1.5 text-[13px] text-gray-400 gap-1">
              <span className="flex-1">1 minute</span>
              <ChevronDown size={13} />
            </div>
            <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={marketProtection}
                onChange={() => setMarketProtection((v) => !v)}
                className="w-3.5 h-3.5"
                style={{ accentColor: accent }}
              />
              Market protection
            </label>
          </div>

          <div className="flex flex-col gap-1.5 w-28">
            <label className="text-[12px] text-gray-400">Disclosed qty.</label>
            <div className="border border-gray-200 rounded-sm bg-gray-50 px-2.5 py-1.5 text-[14px] text-gray-300">
              0
            </div>
          </div>
        </div>
      )}
    </div>
  );
}