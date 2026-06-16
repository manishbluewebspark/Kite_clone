import { useState, useEffect } from "react";
import { RotateCcw, PieChart, Droplets, TrendingUp } from "lucide-react";
import { useHoldingsStore } from "../../store/useHoldingsstore";
import AddHoldingModal from "../../components/modal/AddHoldingModal";

// Polling: Angel One holdings har 30 sec refresh
const HOLDINGS_POLL = 30_000;

// Static mock — baad mein /api/market/funds se replace karna
const equity = { marginAvailable: "1.86L", marginsUsed: 0, openingBalance: "1.86L" };
const commodity = { marginAvailable: 0, marginsUsed: 0, openingBalance: 0 };
const positions = [
  { name: "SENSEX 18th JUN 75200 PE (MIS)", value: 100, color: "#f05a28" },
  { name: "SENSEX 18th JUN 75300 CE (MIS)", value: 52, color: "#387ED1" },
  { name: "SENSEX 18th JUN 75300 PE (MIS)", value: 68, color: "#387ED1" },
  { name: "SENSEX 18th JUN 75200 CE (MIS)", value: 60, color: "#387ED1" },
  { name: "SENSEX 18th JUN 74600 CE (MIS)", value: 80, color: "#387ED1" },
];

const sparklinePoints = [
  [0, 55], [20, 60], [40, 48], [60, 65], [80, 52], [100, 70], [120, 58], [140, 62],
  [160, 50], [180, 68], [200, 45], [220, 72], [240, 55], [260, 65], [280, 50], [300, 75],
  [320, 60], [340, 78], [360, 55], [380, 82], [400, 60], [420, 88], [440, 70], [460, 95],
  [480, 72], [500, 100], [520, 78], [530, 108],
];
function buildPath(pts: number[][]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
}

type BarMode = "currentValue" | "invested" | "pnl";

export default function UserDashboard() {
  const [barMode, setBarMode] = useState<BarMode>("currentValue");
  const [showAddHolding, setShowAddHolding] = useState(false);
  const { holdings, summary, loading, fetchHoldings } = useHoldingsStore();

  useEffect(() => {
    fetchHoldings();
    const timer = setInterval(fetchHoldings, HOLDINGS_POLL);
    return () => clearInterval(timer);
  }, []);

  const pnl = summary?.totalPnl ?? 0;
  const pnlPct = summary?.pnlPercent ?? 0;
  const currentVal = summary?.totalCurVal ?? 0;
  const investment = summary?.totalInvested ?? 0;
  const barPct = summary?.barCurrentPct ?? 0;
  const holdCount = summary?.count ?? 0;
  const pnlPositive = pnl >= 0;

  return (
    <div className="bg-white min-h-full px-6 py-6 text-[13px]" style={{ color: "#333" }}>

      {/* Greeting */}
      <h1 className="text-[20px] font-normal text-gray-800 mb-1">Hi, Manish</h1>
      <hr className="border-gray-200 mb-5" />

      {/* Equity + Commodity */}
      <div className="flex gap-0 mb-6">
        <div className="flex-1 pr-8 border-r border-gray-200">
          <div className="flex items-center gap-1 text-gray-500 text-[12px] mb-3">
            <PieChart size={13} /><span>Equity</span>
          </div>
          <div className="flex gap-10 items-start">
            <div>
              <div className="text-[32px] font-light text-gray-800 leading-none">{equity.marginAvailable}</div>
              <div className="text-gray-400 text-[11px] mt-1">Margin available</div>
            </div>
            <div className="border-l border-gray-200 pl-8">
              <div className="flex gap-6 text-[12px] text-gray-500 mb-2">
                <span>Margins used</span><span className="text-gray-700">{equity.marginsUsed}</span>
              </div>
              <div className="flex gap-6 text-[12px] text-gray-500 mb-3">
                <span>Opening balance</span><span className="text-gray-700">{equity.openingBalance}</span>
              </div>
              <a href="#" className="text-blue-500 text-[12px] flex items-center gap-1 hover:underline">
                <RotateCcw size={11} />View statement
              </a>
            </div>
          </div>
        </div>

        <div className="flex-1 pl-8">
          <div className="flex items-center gap-1 text-gray-500 text-[12px] mb-3">
            <Droplets size={13} /><span>Commodity</span>
          </div>
          <div className="flex gap-10 items-start">
            <div>
              <div className="text-[32px] font-light text-gray-800 leading-none">{commodity.marginAvailable}</div>
              <div className="text-gray-400 text-[11px] mt-1">Margin available</div>
            </div>
            <div className="border-l border-gray-200 pl-8">
              <div className="flex gap-6 text-[12px] text-gray-500 mb-2">
                <span>Margins used</span><span className="text-gray-700">{commodity.marginsUsed}</span>
              </div>
              <div className="flex gap-6 text-[12px] text-gray-500 mb-3">
                <span>Opening balance</span><span className="text-gray-700">{commodity.openingBalance}</span>
              </div>
              <a href="#" className="text-blue-500 text-[12px] flex items-center gap-1 hover:underline">
                <RotateCcw size={11} />View statement
              </a>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-6" />

      {/* Holdings — LIVE from Angel One */}
      <div className="mb-6">
        <div className="flex items-start gap-6 mb-3">

          {/* P&L */}
          <div className="min-w-[200px]">
            <div className="text-[13px] text-gray-500 mb-2 flex items-center justify-between">
              <span>Holdings ({loading && holdCount === 0 ? "…" : holdCount})</span>
              <button
                onClick={() => setShowAddHolding(true)}
                className="text-[11px] text-[#387ED1] hover:underline font-medium"
              >
                + Add Holding
              </button>
            </div>
            {loading && holdings.length === 0 ? (
              <div className="animate-pulse">
                <div className="h-8 w-36 bg-gray-100 rounded mb-2" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-light leading-none"
                    style={{ color: pnlPositive ? "#16a34a" : "#ef4444" }}>
                    {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                  </span>
                  <span className="text-[13px]"
                    style={{ color: pnlPositive ? "#16a34a" : "#ef4444" }}>
                    {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                  </span>
                </div>
                <div className="text-gray-400 text-[11px] mt-1">P&L</div>
              </>
            )}
          </div>

          <div className="w-px bg-gray-200 self-stretch mx-2" />

          {/* Values */}
          <div className="flex flex-col gap-2 pt-6">
            <div className="flex gap-3 text-[12px]">
              <span className="text-gray-400 w-28">Current value</span>
              <span className="text-gray-700">
                ₹{currentVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex gap-3 text-[12px]">
              <span className="text-gray-400 w-28">Investment</span>
              <span className="text-gray-700">
                ₹{investment.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Terminal mode card */}
          <div className="ml-auto border border-dashed border-blue-300 rounded-lg p-4 text-center"
            style={{ minWidth: 160, maxWidth: 180 }}>
            <div className="text-[11px] text-gray-500 mb-1">
              <span className="text-blue-400">*</span> Customise your Kite workspace with
            </div>
            <div className="text-[18px] font-bold text-gray-800 leading-tight">terminal<br />mode</div>
            <span className="text-blue-400 text-[10px]">* +</span>
            <div className="mt-2">
              <button className="px-4 py-1.5 text-[11px] font-semibold text-white rounded"
                style={{ backgroundColor: "#387ED1" }}>
                Try now
              </button>
            </div>
          </div>
        </div>

        {/* Holdings Bar */}
        <div className="mb-2">
          <div className="h-8 rounded overflow-hidden flex" style={{ maxWidth: 880 }}>
            <div className="h-full transition-all duration-700"
              style={{ width: `${barPct}%`, backgroundColor: "#387ED1" }} />
            <div className="h-full transition-all duration-700"
              style={{ width: `${100 - barPct}%`, backgroundColor: "#00b0f0" }} />
          </div>
        </div>

        {/* Bar Legend */}
        <div className="flex items-center justify-between text-[12px]" style={{ maxWidth: 880 }}>
          <span className="text-gray-600">
            ₹{currentVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <div className="flex items-center gap-4 text-gray-500">
            {(["currentValue", "invested", "pnl"] as BarMode[]).map((mode) => (
              <label key={mode} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="barMode" checked={barMode === mode}
                  onChange={() => setBarMode(mode)} className="accent-blue-500" />
                {mode === "currentValue" ? "Current value" : mode === "invested" ? "Invested" : "P&L"}
              </label>
            ))}
          </div>
        </div>

        {/* Holdings Table — Live from Angel One */}
        {holdings.length > 0 && (
          <div className="mt-5 overflow-x-auto" style={{ maxWidth: 880 }}>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-normal">Instrument</th>
                  <th className="text-right pb-2 font-normal">Qty</th>
                  <th className="text-right pb-2 font-normal">Avg cost</th>
                  <th className="text-right pb-2 font-normal">LTP</th>
                  <th className="text-right pb-2 font-normal">Cur. val</th>
                  <th className="text-right pb-2 font-normal">P&L</th>
                  <th className="text-right pb-2 font-normal">Day chg</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2">
                      <div className="font-medium text-gray-800">{h.name}</div>
                      <div className="text-[10px] text-gray-400">{h.full_name}</div>
                    </td>
                    <td className="text-right text-gray-700">{h.qty}</td>
                    <td className="text-right text-gray-700">₹{h.avg_cost.toFixed(2)}</td>
                    <td className="text-right text-gray-700">₹{h.ltp.toFixed(2)}</td>
                    <td className="text-right text-gray-700">₹{h.cur_val.toFixed(2)}</td>
                    <td className="text-right font-medium"
                      style={{ color: h.pnl >= 0 ? "#16a34a" : "#ef4444" }}>
                      {h.pnl >= 0 ? "+" : ""}{h.pnl.toFixed(2)}
                      <div className="text-[10px] font-normal">
                        ({h.pnl_percent >= 0 ? "+" : ""}{h.pnl_percent.toFixed(2)}%)
                      </div>
                    </td>
                    <td className="text-right"
                      style={{ color: h.day_chg_positive ? "#16a34a" : "#ef4444" }}>
                      {h.day_chg_percent ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <hr className="border-gray-200 mb-6" />

      {/* Market overview + Positions */}
      <div className="flex gap-10 flex-wrap">
        <div className="flex-1 min-w-[320px]">
          <div className="flex items-center gap-2 text-gray-700 mb-4">
            <TrendingUp size={14} />
            <span className="text-[14px]">Market overview</span>
          </div>
          <div className="relative" style={{ height: 140 }}>
            <div className="absolute top-0 left-0 flex items-center gap-1">
              <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "#387ED1" }} />
              <span className="text-[10px] text-gray-400">NIFTY 50</span>
            </div>
            <svg viewBox="0 0 530 120" preserveAspectRatio="none" className="w-full"
              style={{ height: 120, marginTop: 16 }}>
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#387ED1" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#387ED1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${buildPath(sparklinePoints)} L530,120 L0,120 Z`} fill="url(#sparkGrad)" />
              <path d={buildPath(sparklinePoints)} stroke="#387ED1" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
            </svg>
            <div className="flex justify-between text-[10px] text-gray-300 mt-1 px-1">
              <span>Jul 25</span><span>Oct 25</span><span>Jan 26</span><span>Apr 26</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[320px]">
          <div className="text-[14px] text-gray-700 mb-4">Positions ({positions.length})</div>
          <div className="flex flex-col gap-2">
            {positions.map((pos, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 rounded-sm shrink-0"
                  style={{ width: `${pos.value}%`, maxWidth: 320, backgroundColor: pos.color, minWidth: 40 }} />
                <span className="text-[11px] text-gray-500 whitespace-nowrap">{pos.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Holding Modal */}
      {showAddHolding && (
        <AddHoldingModal
          onClose={() => setShowAddHolding(false)}
          onSaved={fetchHoldings}
        />
      )}
    </div>
  );
}