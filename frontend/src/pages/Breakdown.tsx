import type { DemoPosition } from "../store/useDemoTradeStore";
import type { DisplayRow } from "../pages/Positions"; 

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatNumber(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Single Breakdown Row ────────────────────────────────────────────────────

function BreakdownRow({ pos }: { pos: DisplayRow }) {
  // Buy/sell bar ratio based on buy_qty vs sell_qty from raw position
  const raw: DemoPosition = pos._position;
  const totalVolume = raw.buy_quantity + raw.sell_quantity;
  const buyPct = totalVolume > 0 ? (raw.buy_quantity / totalVolume) * 100 : 0;
  const sellPct = totalVolume > 0 ? (raw.sell_quantity / totalVolume) * 100 : 0;

  return (
    <div>
      <div className="grid grid-cols-[1fr_200px_1fr] items-center">
        {/* Left — Orange (Sell) bar */}
        <div className="flex justify-end pr-1">
          {sellPct > 0 && (
            <div
              className="h-2 bg-orange-400"
              style={{ width: `${sellPct * 0.9}%` }}
            />
          )}
        </div>

        {/* Center — name + P&L */}
        <div className="text-center px-2">
          <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap">
            {pos.instrument}
          </span>
          <span className="text-[10px] text-gray-400 ml-1">
            ({pos.product})
          </span>
          {/* <div
            className={`text-[11px] font-medium mt-0.5 ${pos.realisedPnl >= 0 ? "text-green-600" : "text-red-500"
              }`}
          >
            {pos.realisedPnl >= 0 ? "+" : ""}₹
            {formatNumber(pos.realisedPnl)}
          </div> */}
        </div>

        {/* Right — Blue (Buy) bar */}
        <div className="flex justify-start pl-1">
          {buyPct > 0 && (
            <div
              className="h-2 bg-blue-500"
              style={{ width: `${buyPct * 0.9}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Breakdown Component ──────────────────────────────────────────────────────

interface BreakdownProps {
  rows: DisplayRow[];
  totalPnl?: number; // pass karo agar future me "Realised P&L" total dikhana ho
}

export default function Breakdown({ rows }: BreakdownProps) {
  return (
    <div className="mt-8">
      <h2 className="text-base text-gray-800 pb-2 border-b border-gray-100 font-medium">
        Breakdown
      </h2>

      {rows.length === 0 ? (
        <p className="text-[13px] text-gray-400 mt-4 text-center py-6">
          Close a position to see breakdown
        </p>
      ) : (
        <div className="space-y-3 mt-3">
          {rows.map((pos) => (
            <BreakdownRow key={pos.id} pos={pos} />
          ))}

          {/* Total Realised P&L — uncomment if needed
          <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
            <span className="text-[13px] text-gray-500 font-medium">
              Realised P&L
            </span>
            <span
              className={`text-[13px] font-semibold ${
                totalPnl !== undefined && totalPnl >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {totalPnl !== undefined ? `${totalPnl >= 0 ? "+" : ""}₹${formatNumber(totalPnl)}` : ""}
            </span>
          </div>
          */}
        </div>
      )}
    </div>
  );
}