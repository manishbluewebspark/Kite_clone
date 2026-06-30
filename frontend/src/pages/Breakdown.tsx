import type { DemoPosition } from "../store/useDemoTradeStore";
import type { DisplayRow } from "../pages/Positions";

// ─── Single Breakdown Row ────────────────────────────────────────────────────

function BreakdownRow({
  pos,
  maxVolume,
}: {
  pos: DisplayRow;
  maxVolume: number;
}) {
  const raw: DemoPosition = pos._position;
  const totalVolume = raw.buy_quantity + raw.sell_quantity;

  // Buy/Sell split WITHIN this row (orange vs blue ratio for this instrument)
  const buyShare = totalVolume > 0 ? raw.buy_quantity / totalVolume : 0.5;
  const sellShare = totalVolume > 0 ? raw.sell_quantity / totalVolume : 0.5;

  // Overall bar length relative to the instrument with the highest volume today
  // (this is what makes BANKNIFTY's bar shorter than BRCRUDEOIL's, e.g.)
  const rowScale = maxVolume > 0 ? totalVolume / maxVolume : 0;

  // Each side (orange/sell, blue/buy) gets a max width of 45% of the row.
  // At a perfect 50/50 buy-sell split, each side fills its full allotted width
  // (scaled by rowScale). If one side dominates (e.g. more buys than sells),
  // that side's width grows proportionally past the 50/50 baseline.
  const MAX_SIDE_PCT = 45; // leaves room in the center for the label
  const sellWidth = rowScale * MAX_SIDE_PCT * Math.min(sellShare / 0.5, 1);
  const buyWidth = rowScale * MAX_SIDE_PCT * Math.min(buyShare / 0.5, 1);

  return (
    <div className="grid grid-cols-[1fr_200px_1fr] items-center">
      {/* Left — Orange (Sell) bar, grows leftward from center */}
      <div className="flex justify-end pr-1">
        {sellWidth > 0 && (
          <div
            className="h-2 bg-orange-400 rounded-l"
            style={{ width: `${sellWidth}%` }}
          />
        )}
      </div>

      {/* Center — name */}
      <div className="text-center px-2">
        <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap">
          {pos.instrument}
        </span>
        <span className="text-[10px] text-gray-400 ml-1">
          ({pos.product})
        </span>
      </div>

      {/* Right — Blue (Buy) bar, grows rightward from center */}
      <div className="flex justify-start pl-1">
        {buyWidth > 0 && (
          <div
            className="h-2 bg-blue-500 rounded-r"
            style={{ width: `${buyWidth}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Breakdown Component ──────────────────────────────────────────────────────

interface BreakdownProps {
  rows: DisplayRow[]; // closed (or open) positions to show in the breakdown
}

export default function Breakdown({ rows }: BreakdownProps) {
  // Find the instrument with the highest combined buy+sell volume today —
  // every other row's bar length is scaled relative to this one
  const maxVolume = rows.reduce((max, pos) => {
    const raw = pos._position;
    const vol = raw.buy_quantity + raw.sell_quantity;
    return vol > max ? vol : max;
  }, 0);

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
            <BreakdownRow key={pos.id} pos={pos} maxVolume={maxVolume} />
          ))}
        </div>
      )}
    </div>
  );
}


// import type { DemoPosition } from "../store/useDemoTradeStore";
// import type { DisplayRow } from "../pages/Positions";

// // ─── Single Breakdown Row ────────────────────────────────────────────────────
// //
// // Kite's actual behavior (confirmed from reference screenshots):
// // - Each row is a SINGLE solid color, not a split orange/blue bar.
// // - Net SELL (short) positions → orange bar, growing from center to the LEFT,
// //   with the instrument label sitting to the right of the bar (near center).
// // - Net BUY (long) positions → blue bar, growing from center to the RIGHT,
// //   with the instrument label sitting to the left of the bar (near center).
// // - Bar length is proportional to that position's size (|net qty| or value)
// //   relative to the largest position shown — NOT a buy/sell split within the row.

// function BreakdownRow({
//   pos,
//   maxSize,
//   sizeBy,
// }: {
//   pos: DisplayRow;
//   maxSize: number;
//   sizeBy: "quantity" | "value";
// }) {
//   const raw: DemoPosition = pos._position;

//   // Position "size" — quantity-based (lots/shares) or value-based (notional ₹).
//   const size =
//     sizeBy === "value"
//       ? Math.abs(raw.quantity) * raw.average_price
//       : Math.abs(raw.quantity);
//   const scale = maxSize > 0 ? size / maxSize : 0;

//   const isShort = raw.quantity < 0; // net SELL → orange, grows left
//   const isLong = raw.quantity > 0; // net BUY → blue, grows right

//   const MAX_SIDE_PCT = 90; // max width a single bar can take on its side

//   const widthPct = scale * MAX_SIDE_PCT;

//   return (
//     <div className="grid grid-cols-[1fr_1fr] items-center h-7">
//       {/* Left half — orange bar for short positions, grows from center leftward.
//           Label sits just right of the bar (i.e. near center), like the screenshot. */}
//       <div className="flex justify-end items-center gap-1.5 pr-1">
//         {isShort && (
//           <>
//             <div
//               className="h-2 bg-orange-400 rounded-l shrink-0"
//               style={{ width: `${widthPct}%` }}
//             />
//           </>
//         )}
//         {isShort && (
//           <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap">
//             {pos.instrument}{" "}
//             <span className="text-[10px] text-gray-400">({pos.product})</span>
//           </span>
//         )}
//       </div>

//       {/* Right half — blue bar for long positions, grows from center rightward.
//           Label sits just left of the bar (i.e. near center). */}
//       <div className="flex justify-start items-center gap-1.5 pl-1">
//         {isLong && (
//           <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap">
//             {pos.instrument}{" "}
//             <span className="text-[10px] text-gray-400">({pos.product})</span>
//           </span>
//         )}
//         {isLong && (
//           <div
//             className="h-2 bg-blue-500 rounded-r shrink-0"
//             style={{ width: `${widthPct}%` }}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Breakdown Component ──────────────────────────────────────────────────────

// interface BreakdownProps {
//   rows: DisplayRow[]; // closed (or open) positions to show in the breakdown
//   sizeBy?: "quantity" | "value"; // "quantity" = lots/shares, "value" = notional ₹ (qty × avg price)
// }

// export default function Breakdown({ rows, sizeBy = "quantity" }: BreakdownProps) {
//   // Largest position sets the scale — every other row's bar length is
//   // relative to this one, same as Kite's reference behavior.
//   const maxSize = rows.reduce((max, pos) => {
//     const raw = pos._position;
//     const size =
//       sizeBy === "value"
//         ? Math.abs(raw.quantity) * raw.average_price
//         : Math.abs(raw.quantity);
//     return size > max ? size : max;
//   }, 0);

//   return (
//     <div className="mt-8">
//       <h2 className="text-base text-gray-800 pb-2 border-b border-gray-100 font-medium">
//         Breakdown
//       </h2>

//       {rows.length === 0 ? (
//         <p className="text-[13px] text-gray-400 mt-4 text-center py-6">
//           Close a position to see breakdown
//         </p>
//       ) : (
//         <div className="space-y-3 mt-3">
//           {rows.map((pos) => (
//             <BreakdownRow key={pos.id} pos={pos} maxSize={maxSize} sizeBy={sizeBy} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }