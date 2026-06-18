import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X, Layers, RotateCcw, Pencil } from "lucide-react";
import { useDemoTradeStore } from "../../store/useDemoTradeStore";

type TabKey = "quick" | "regular" | "mtf" | "iceberg" | "cover";

const TABS: { key: TabKey; label: string; disabled?: boolean }[] = [
  { key: "quick", label: "Quick" },
  { key: "regular", label: "Regular" },
  { key: "mtf", label: "MTF", disabled: true },
  { key: "iceberg", label: "Iceberg" },
  { key: "cover", label: "Cover" },
];

interface OrderModalProps {
  symbol?: string;
  exchange: string;   // ⬅️ naya required prop
  token: string;       // ⬅️ naya required prop
  bsePrice?: number;
  nsePrice?: number;
  startPrice?: number;
  defaultOrange?: boolean;
  onClose?: () => void;
  onOrderPlaced?: () => void; // ⬅️ naya, parent ko refresh trigger karne ke liye
}

export default function OrderModal({
  symbol = "HDFCBANK",
  exchange,
  token,
  bsePrice = 791.15,
  nsePrice = 790.85,
  startPrice = 790.8,
  defaultOrange = false,
  onClose,
  onOrderPlaced,
}: OrderModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("quick");
  const [isOrange, setIsOrange] = useState(defaultOrange);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const { openTrade } = useDemoTradeStore();

  useEffect(() => {
    setIsOrange(defaultOrange);
  }, [defaultOrange]);

  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(startPrice);
  const [intraday, setIntraday] = useState(true);
  const [orderType, setOrderType] = useState<"market" | "limit">("limit");
  const [legs, setLegs] = useState(2);
  const [triggerPrice, setTriggerPrice] = useState(791.05);

  const accent = isOrange ? "#FF7A1A" : "#2563EB";
  const accentSoft = isOrange ? "#FFEDDD" : "#DCE8FF";

  const bump = (delta: number) => setQty((q) => Math.max(1, q + delta));

  // ── Demo trade place karo (BUY ya SELL, isOrange decide karta hai) ────────
  const handlePlaceOrder = async () => {
    setError("");
    setPlacing(true);

    const transactionType = isOrange ? "SELL" : "BUY";

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
      onOrderPlaced?.(); // parent ko batao order ho gaya, refresh kare
      onClose?.();
    } else {
      setError("Failed to place order. Try again.");
    }
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-black/50" onClick={onClose} />

      <div
        className="fixed z-[10000]"
        style={{
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
          className="w-[340px] rounded-md shadow-xl overflow-hidden border border-gray-200 bg-white select-none"
        >
          {/* Header */}
          <div
            className="px-4 pt-3 pb-2.5 transition-colors duration-300"
            style={{ backgroundColor: accent }}
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-[15px] tracking-wide">
                {symbol}
              </span>
              <button
                onClick={() => setIsOrange((v) => !v)}
                aria-pressed={isOrange}
                aria-label="Toggle accent color"
                className="relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                style={{ backgroundColor: "rgba(255,255,255,0.35)" }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300"
                  style={{
                    transform: isOrange ? "translateX(16px)" : "translateX(0px)",
                  }}
                />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-[13px] text-white/95">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                BSE ₹{bsePrice.toFixed(2)}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border border-white inline-block" />
                NSE ₹{nsePrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-gray-200 px-1 relative">
            <div className="flex flex-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  disabled={tab.disabled}
                  onClick={() => !tab.disabled && setActiveTab(tab.key)}
                  className={[
                    "px-3 py-2.5 text-[13px] font-medium relative whitespace-nowrap",
                    tab.disabled
                      ? "text-gray-300 cursor-not-allowed"
                      : activeTab === tab.key
                        ? ""
                        : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                  style={
                    activeTab === tab.key && !tab.disabled
                      ? { color: accent }
                      : undefined
                  }
                >
                  {tab.label}
                  {activeTab === tab.key && !tab.disabled && (
                    <span
                      className="absolute left-0 right-0 -bottom-px h-[2px] transition-colors duration-300"
                      style={{ backgroundColor: accent }}
                    />
                  )}
                </button>
              ))}
            </div>
            <Pencil size={13} className="text-gray-400 mr-2 shrink-0" />
          </div>

          {/* Body */}
          <div className="px-4 pt-3.5 pb-3">
            {activeTab === "quick" && (
              <QuickBody
                qty={qty}
                setQty={setQty}
                bump={bump}
                price={price}
                setPrice={setPrice}
                accent={accent}
              />
            )}

            {activeTab === "regular" && (
              <RegularBody
                qty={qty}
                bump={bump}
                price={price}
                setPrice={setPrice}
                intraday={intraday}
                setIntraday={setIntraday}
                orderType={orderType}
                setOrderType={setOrderType}
                accent={accent}
              />
            )}

            {activeTab === "iceberg" && (
              <IcebergBody
                qty={qty}
                bump={bump}
                price={price}
                setPrice={setPrice}
                intraday={intraday}
                setIntraday={setIntraday}
                orderType={orderType}
                setOrderType={setOrderType}
                legs={legs}
                setLegs={setLegs}
                accent={accent}
              />
            )}

            {activeTab === "cover" && (
              <CoverBody
                qty={qty}
                bump={bump}
                price={price}
                setPrice={setPrice}
                orderType={orderType}
                setOrderType={setOrderType}
                triggerPrice={triggerPrice}
                setTriggerPrice={setTriggerPrice}
                accent={accent}
              />
            )}

            {error && (
              <div className="mt-2 text-[12px] text-red-500">{error}</div>
            )}
          </div>

          {/* Footer: required/available */}
          <div className="px-4 pb-3 flex items-center justify-between text-[12px]">
            <span className="text-gray-500">
              {activeTab === "quick" ? "Req." : "Required"}{" "}
              <span style={{ color: accent }} className="font-medium">
                ₹{(qty * price).toFixed(2)} + 0.82
              </span>
            </span>
            <span className="text-gray-500 flex items-center gap-1">
              {activeTab === "quick" ? "Avail." : "Available"}{" "}
              <span style={{ color: accent }} className="font-medium">
                ₹1,975.40
              </span>
              <RotateCcw size={12} className="text-gray-400 ml-0.5" />
            </span>
          </div>

          {/* Buttons */}
          <div className="px-4 pb-4 flex flex-col gap-2">
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full py-2 rounded-sm text-white text-[14px] font-medium transition-colors duration-300 disabled:opacity-60"
              style={{ backgroundColor: accent }}
            >
              {placing ? "Placing..." : isOrange ? "Sell" : "Buy"}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-sm border border-gray-300 text-gray-700 text-[14px] font-medium bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ---------- shared bits (UNCHANGED) ---------- */

function QtyField({
  qty,
  bump,
  accent,
}: {
  qty: number;
  bump: (d: number) => void;
  accent: string;
}) {
  return (
    <div>
      <label className="text-[12px] text-gray-500">Qty.</label>
      <div className="flex items-center mt-1 border border-gray-300 rounded-sm overflow-hidden">
        <input
          value={qty}
          readOnly
          className="flex-1 px-2.5 py-1.5 text-[14px] outline-none"
          style={{ backgroundColor: accent, color: "white" }}
        />
        <div className="flex flex-col border-l border-gray-300">
          <button
            onClick={() => bump(1)}
            className="px-1.5 leading-none text-gray-500 hover:bg-gray-50 text-[10px] py-0.5"
          >
            ▲
          </button>
          <button
            onClick={() => bump(-1)}
            className="px-1.5 leading-none text-gray-500 hover:bg-gray-50 text-[10px] py-0.5 border-t border-gray-200"
          >
            ▼
          </button>
        </div>
        <button className="px-2 border-l border-gray-300 text-gray-400 hover:bg-gray-50">
          <Layers size={14} />
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
          className="flex-1 px-2.5 py-1.5 text-[14px] outline-none w-full"
        />
        {showClear && (
          <button
            onClick={() => setPrice(0)}
            className="px-2 text-gray-400 hover:text-gray-600"
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
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[13px] text-gray-700"
    >
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

/* ---------- tab bodies (UNCHANGED) ---------- */

function QuickBody({
  qty,
  bump,
  price,
  setPrice,
  accent,
}: {
  qty: number;
  setQty: (n: number) => void;
  bump: (d: number) => void;
  price: number;
  setPrice: (n: number) => void;
  accent: string;
}) {
  const [intraday, setIntraday] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <QtyField qty={qty} bump={bump} accent={accent} />
      <PriceField price={price} setPrice={setPrice} />
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
    </div>
  );
}

function RegularBody({
  qty,
  bump,
  price,
  setPrice,
  intraday,
  setIntraday,
  orderType,
  setOrderType,
  accent,
}: {
  qty: number;
  bump: (d: number) => void;
  price: number;
  setPrice: (n: number) => void;
  intraday: boolean;
  setIntraday: (v: boolean) => void;
  orderType: "market" | "limit";
  setOrderType: (v: "market" | "limit") => void;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SegRadio
            checked={intraday}
            onClick={() => setIntraday(true)}
            label="Intraday"
            sub="MIS"
            accent={accent}
          />
          <SegRadio
            checked={!intraday}
            onClick={() => setIntraday(false)}
            label="Longterm"
            sub="CNC"
            accent={accent}
          />
        </div>
        <button
          className="text-[12px] font-medium flex items-center gap-0.5"
          style={{ color: accent }}
        >
          Advanced <ChevronDown size={13} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <QtyField qty={qty} bump={bump} accent={accent} />
        <PriceField price={price} setPrice={setPrice} showClear={false} />
        <div>
          <label className="text-[12px] text-gray-300">Trigger price</label>
          <div className="mt-1 border border-gray-200 rounded-sm bg-gray-50 px-2.5 py-1.5 text-[14px] text-gray-300">
            0
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <SegRadio
          checked={orderType === "market"}
          onClick={() => setOrderType("market")}
          label="Market"
          accent={accent}
        />
        <SegRadio
          checked={orderType === "limit"}
          onClick={() => setOrderType("limit")}
          label="Limit"
          accent={accent}
        />
        <span className="ml-auto flex items-center gap-4">
          <SegRadio checked={false} onClick={() => { }} label="SL" accent={accent} />
          <SegRadio checked={false} onClick={() => { }} label="SL-M" accent={accent} />
        </span>
      </div>
    </div>
  );
}

function IcebergBody({
  qty,
  bump,
  price,
  setPrice,
  intraday,
  setIntraday,
  orderType,
  setOrderType,
  legs,
  setLegs,
  accent,
}: {
  qty: number;
  bump: (d: number) => void;
  price: number;
  setPrice: (n: number) => void;
  intraday: boolean;
  setIntraday: (v: boolean) => void;
  orderType: "market" | "limit";
  setOrderType: (v: "market" | "limit") => void;
  legs: number;
  setLegs: (n: number) => void;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SegRadio
            checked={intraday}
            onClick={() => setIntraday(true)}
            label="Intraday"
            sub="MIS"
            accent={accent}
          />
          <SegRadio
            checked={!intraday}
            onClick={() => setIntraday(false)}
            label="Longterm"
            sub="CNC"
            accent={accent}
          />
        </div>
        <button
          className="text-[12px] font-medium flex items-center gap-0.5"
          style={{ color: accent }}
        >
          Advanced <ChevronDown size={13} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <QtyField qty={qty} bump={bump} accent={accent} />
        <PriceField price={price} setPrice={setPrice} showClear={false} />
        <div>
          <label className="text-[12px] text-gray-300">Trigger price</label>
          <div className="mt-1 border border-gray-200 rounded-sm bg-gray-50 px-2.5 py-1.5 text-[14px] text-gray-300">
            0
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <SegRadio
          checked={orderType === "market"}
          onClick={() => setOrderType("market")}
          label="Market"
          accent={accent}
        />
        <SegRadio
          checked={orderType === "limit"}
          onClick={() => setOrderType("limit")}
          label="Limit"
          accent={accent}
        />
        <span className="ml-auto flex items-center gap-4">
          <SegRadio checked={false} onClick={() => { }} label="SL" accent={accent} />
          <SegRadio checked={false} onClick={() => { }} label="SL-M" accent={accent} />
        </span>
      </div>

      <div className="w-1/2">
        <label className="text-[12px] text-gray-500">Number of legs</label>
        <div className="flex items-center mt-1 border border-gray-300 rounded-sm overflow-hidden">
          <input
            value={legs}
            onChange={(e) => setLegs(parseInt(e.target.value) || 1)}
            className="flex-1 px-2.5 py-1.5 text-[14px] outline-none w-full"
          />
        </div>
      </div>
      <span className="text-[12px] text-gray-400">
        {Math.max(1, Math.round(qty / legs))} qty. per leg
      </span>
    </div>
  );
}

function CoverBody({
  qty,
  bump,
  price,
  setPrice,
  orderType,
  setOrderType,
  triggerPrice,
  setTriggerPrice,
  accent,
}: {
  qty: number;
  bump: (d: number) => void;
  price: number;
  setPrice: (n: number) => void;
  orderType: "market" | "limit";
  setOrderType: (v: "market" | "limit") => void;
  triggerPrice: number;
  setTriggerPrice: (n: number) => void;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SegRadio
          checked={true}
          onClick={() => { }}
          label="Intraday"
          sub="MIS"
          accent={accent}
        />
        <button
          className="text-[12px] font-medium flex items-center gap-0.5"
          style={{ color: accent }}
        >
          Advanced <ChevronDown size={13} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <QtyField qty={qty} bump={bump} accent={accent} />
        <PriceField price={price} setPrice={setPrice} showClear={false} />
        <PriceField
          price={triggerPrice}
          setPrice={setTriggerPrice}
          label="Stoploss trigger P..."
          showClear={false}
        />
      </div>

      <div className="flex items-center gap-5">
        <SegRadio
          checked={orderType === "market"}
          onClick={() => setOrderType("market")}
          label="Market"
          accent={accent}
        />
        <SegRadio
          checked={orderType === "limit"}
          onClick={() => setOrderType("limit")}
          label="Limit"
          accent={accent}
        />
        <span className="ml-auto flex items-center gap-4">
          <SegRadio checked={false} onClick={() => { }} label="SL" accent={accent} />
          <SegRadio checked={false} onClick={() => { }} label="SL-M" accent={accent} />
        </span>
      </div>
    </div>
  );
}