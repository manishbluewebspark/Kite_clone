// import { useState, useEffect } from "react";
// import { HiOutlineDownload, HiSearch } from "react-icons/hi";
// import { RiArrowUpSLine, RiArrowDownSLine } from "react-icons/ri";

// // ── Types ──
// interface Order {
//   time: string;
//   date: string;
//   type: "BUY" | "SELL";
//   instrument: string;
//   exchange: string;
//   product: string;
//   qty: string;
//   avgPrice: number;
//   status: "COMPLETE" | "PENDING" | "REJECTED" | "CANCELLED";
//   ltp?: number;
// }

// interface PositionRow {
//   product: string;
//   instrument: string;
//   exchange: string;
//   netQty: number;
//   avg: number;
//   ltp: number;
//   pnl: number;
//   chg: number;
// }

// // ── Helpers ──
// function formatNumber(n: number) {
//   return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// }

// // Splits "SENSEX 18th JUN 74600 CE" into base text + ordinal superscript + rest
// function renderInstrumentName(instrument: string) {
//   const match = instrument.match(/^(.*?\b\d+)(st|nd|rd|th)\b(.*)$/);
//   if (!match) return <span>{instrument}</span>;
//   const [, before, ordinal, after] = match;
//   return (
//     <span>
//       {before}
//       <sup className="text-[10px]">{ordinal}</sup>
//       <span className="text-blue-400  bg-blue-100 rounded-full">w</span>
//       {after.trim()}
//     </span>
//   );
// }

// // Returns today's date as YYYY-MM-DD
// function getTodayDate(): string {
//   const d = new Date();
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// }

// // Derive today's positions from COMPLETE orders, grouped by instrument
// function derivePositions(orders: Order[]): PositionRow[] {
//   const groups = new Map<string, Order[]>();

//   const today = getTodayDate();

//   orders
//     .filter((o) => o.status === "COMPLETE" && o.date === today)
//     .forEach((o) => {
//       const key = `${o.instrument}__${o.product}__${o.exchange}`;
//       if (!groups.has(key)) groups.set(key, []);
//       groups.get(key)!.push(o);
//     });

//   const rows: PositionRow[] = [];

//   groups.forEach((orderList, key) => {
//     const [instrument, product, exchange] = key.split("__");
//     const ltp = orderList[0].ltp ?? orderList[0].avgPrice;

//     let buyQty = 0;
//     let buyValue = 0;
//     let sellQty = 0;
//     let sellValue = 0;

//     orderList.forEach((o) => {
//       const executedQty = parseInt(o.qty.split("/")[1]?.trim() || "0", 10);
//       if (o.type === "BUY") {
//         buyQty += executedQty;
//         buyValue += executedQty * o.avgPrice;
//       } else {
//         sellQty += executedQty;
//         sellValue += executedQty * o.avgPrice;
//       }
//     });

//     const netQty = buyQty - sellQty;
//     const avgPrice =
//       buyQty + sellQty > 0 ? (buyValue + sellValue) / (buyQty + sellQty) : 0;

//     // Realized + unrealized P&L: (sell value - buy value) + net position marked to LTP
//     const pnl = sellValue - buyValue + netQty * ltp;
//     const chg = avgPrice > 0 ? ((ltp - avgPrice) / avgPrice) * 100 : 0;

//     rows.push({
//       product,
//       instrument,
//       exchange,
//       netQty,
//       avg: avgPrice,
//       ltp,
//       pnl,
//       chg,
//     });
//   });

//   return rows;
// }

// // ── Search Input ──
// function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
//   return (
//     <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-200 bg-white">
//       <HiSearch className="text-gray-400 text-sm shrink-0" />
//       <input
//         type="text"
//         placeholder="Search"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="bg-transparent border-none outline-none text-xs text-gray-700 w-[120px]"
//       />
//     </div>
//   );
// }

// // ── Section Header ──
// function SectionHeader({
//   title, count, collapsed, onToggle, searchVal, onSearch, extraActions
// }: {
//   title: string; count: number; collapsed: boolean; onToggle: () => void;
//   searchVal: string; onSearch: (v: string) => void; extraActions?: React.ReactNode;
// }) {
//   return (
//     <div className="flex items-center justify-between py-3.5 pb-2.5">
//       <button
//         onClick={onToggle}
//         className="flex items-center gap-2 bg-none border-none cursor-pointer text-gray-800"
//       >
//         <span className="text-base font-semibold">
//           {title} ({count})
//         </span>
//         {collapsed
//           ? <RiArrowDownSLine className="text-lg text-gray-400" />
//           : <RiArrowUpSLine className="text-lg text-gray-400" />
//         }
//       </button>

//       <div className="flex items-center gap-3">
//         <SearchBox value={searchVal} onChange={onSearch} />
//         {extraActions}
//         <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
//           <HiOutlineDownload size={14} /> Download
//         </button>
//       </div>
//     </div>
//   );
// }

// // ── Positions Table (shared shape for both sections) ──
// function PositionsTable({
//   rows,
//   totalPnl,
//   showCheckbox,
//   selected,
//   onToggleRow,
//   onToggleAll,
// }: {
//   rows: PositionRow[];
//   totalPnl: number;
//   showCheckbox: boolean;
//   selected?: Set<number>;
//   onToggleRow?: (i: number) => void;
//   onToggleAll?: () => void;
// }) {
//   const cols = ["Product", "Instrument", "Qty.", "Avg.", "LTP", "P&L", "Chg."];

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full border-collapse">
//         <thead>
//           <tr>
//             {showCheckbox && (
//               <th className="px-3 py-2 border-b border-gray-100 w-8">
//                 <input
//                   type="checkbox"
//                   checked={rows.length > 0 && selected?.size === rows.length}
//                   onChange={onToggleAll}
//                   className="cursor-pointer"
//                 />
//               </th>
//             )}
//             {cols.map((h) => (
//               <th
//                 key={h}
//                 className={`px-3 py-2 text-[11px] font-semibold text-gray-400 text-left border-b border-gray-100 whitespace-nowrap ${
//                   ["Qty.", "Avg.", "LTP", "P&L", "Chg."].includes(h) ? "text-right" : ""
//                 } ${h === "P&L" ? "bg-gray-50" : ""}`}
//               >
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.length === 0 ? (
//             <tr>
//               <td
//                 colSpan={cols.length + (showCheckbox ? 1 : 0)}
//                 className="px-3 py-8 text-center text-gray-400 text-[13px] border-b border-gray-100"
//               >
//                 No data found
//               </td>
//             </tr>
//           ) : (
//             rows.map((pos, i) => (
//               <tr key={i} className="transition-colors duration-100 hover:bg-gray-50">
//                 {showCheckbox && (
//                   <td className="px-3 py-3 border-b border-gray-100">
//                     <input
//                       type="checkbox"
//                       checked={selected?.has(i) ?? false}
//                       onChange={() => onToggleRow?.(i)}
//                       className="cursor-pointer"
//                     />
//                   </td>
//                 )}
//                 <td className="px-3 py-3 border-b border-gray-100 whitespace-nowrap">
//                   <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
//                     {pos.product}
//                   </span>
//                 </td>
//                 <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-gray-100 whitespace-nowrap">
//                   {renderInstrumentName(pos.instrument)}{" "}
//                   <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
//                     {pos.exchange}
//                   </span>
//                 </td>
//                 <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
//                   {pos.netQty}
//                 </td>
//                 <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
//                   {pos.avg.toFixed(2)}
//                 </td>
//                 <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-gray-100 whitespace-nowrap text-right">
//                   {formatNumber(pos.ltp)}
//                 </td>
//                 <td
//                   className={`px-3 py-3 text-[13px] font-medium border-b border-gray-100 whitespace-nowrap text-right bg-gray-50 ${
//                     pos.pnl >= 0 ? "text-green-600" : "text-red-500"
//                   }`}
//                 >
//                   {pos.pnl >= 0 ? "+" : ""}
//                   {formatNumber(pos.pnl)}
//                 </td>
//                 <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
//                   {pos.chg.toFixed(2)}%
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//         {rows.length > 0 && (
//           <tfoot>
//             <tr>
//               <td colSpan={showCheckbox ? 5 : 4}></td>
//               <td className="px-3 py-3 text-[13px] text-gray-600 text-right whitespace-nowrap">
//                 Total P&L
//               </td>
//               <td
//                 className={`px-3 py-3 text-[13px] font-semibold text-right whitespace-nowrap bg-gray-50 ${
//                   totalPnl >= 0 ? "text-green-600" : "text-red-500"
//                 }`}
//               >
//                 {totalPnl >= 0 ? "+" : ""}
//                 {formatNumber(totalPnl)}
//               </td>
//               <td></td>
//             </tr>
//           </tfoot>
//         )}
//       </table>
//     </div>
//   );
// }

// // ── Main Component ──
// export default function Positions() {
//   const [positions, setPositions] = useState<PositionRow[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [positionsCollapsed, setPositionsCollapsed] = useState(false);
//   const [historyCollapsed, setHistoryCollapsed] = useState(false);
//   const [positionSearch, setPositionSearch] = useState("");
//   const [historySearch, setHistorySearch] = useState("");
//   const [selected, setSelected] = useState<Set<number>>(new Set());

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const response = await fetch("/data.json");
//         const data = await response.json();
//         setPositions(derivePositions(data.orders || []));
//       } catch (error) {
//         console.error("Error loading data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const filteredPositions = positions.filter((p) =>
//     p.instrument.toLowerCase().includes(positionSearch.toLowerCase())
//   );
//   const filteredHistory = positions.filter((p) =>
//     p.instrument.toLowerCase().includes(historySearch.toLowerCase())
//   );

//   const positionsTotalPnl = filteredPositions.reduce((sum, p) => sum + p.pnl, 0);
//   const historyTotalPnl = filteredHistory.reduce((sum, p) => sum + p.pnl, 0);

//   const toggleRow = (i: number) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       if (next.has(i)) next.delete(i);
//       else next.add(i);
//       return next;
//     });
//   };

//   const toggleAll = () => {
//     if (selected.size === filteredPositions.length) {
//       setSelected(new Set());
//     } else {
//       setSelected(new Set(filteredPositions.map((_, i) => i)));
//     }
//   };

//   // Breakdown: sorted by absolute P&L desc, orange for negative, blue for positive
//   const breakdown = [...positions].sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
//   const maxAbsPnl = Math.max(...breakdown.map((p) => Math.abs(p.pnl)), 1);

//   if (loading) {
//     return (
//       <div className="min-h-full px-6 pb-6 text-gray-800 flex items-center justify-center h-[400px]">
//         <div className="text-gray-400">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-full px-6 pb-6 text-gray-800 text-[13px]">
//       {/* ═══ Positions Section ═══ */}
//       <SectionHeader
//         title="Positions"
//         count={filteredPositions.length}
//         collapsed={positionsCollapsed}
//         onToggle={() => setPositionsCollapsed((p) => !p)}
//         searchVal={positionSearch}
//         onSearch={setPositionSearch}
//         extraActions={
//           <>
//             <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
//               Analytics
//             </button>
//             <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
//               Settings
//             </button>
//           </>
//         }
//       />

//       {!positionsCollapsed && (
//         <PositionsTable
//           rows={filteredPositions}
//           totalPnl={positionsTotalPnl}
//           showCheckbox
//           selected={selected}
//           onToggleRow={toggleRow}
//           onToggleAll={toggleAll}
//         />
//       )}

//       {/* ═══ Day's History Section (same data, no checkbox) ═══ */}
//       <div className="mt-6">
//         <SectionHeader
//           title="Day's history"
//           count={filteredHistory.length}
//           collapsed={historyCollapsed}
//           onToggle={() => setHistoryCollapsed((p) => !p)}
//           searchVal={historySearch}
//           onSearch={setHistorySearch}
//         />

//         {!historyCollapsed && (
//           <PositionsTable rows={filteredHistory} totalPnl={historyTotalPnl} showCheckbox={false} />
//         )}
//       </div>

//       {/* ═══ Breakdown Section ═══ */}
//       <div className="mt-8">
//         <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-100">
//           Breakdown
//         </h2>

//         <div className="mt-4 space-y-2">
//           {breakdown.map((pos, i) => {
//             const widthPct = (Math.abs(pos.pnl) / maxAbsPnl) * 100;
//             const isNegative = pos.pnl < 0;
//             const label = `${pos.instrument} (${pos.product})`;

//             return (
//               <div key={i} className="flex items-center gap-2">
//                 <div className="flex-1 flex items-center">
//                   <div
//                     className={`h-5 rounded-sm ${isNegative ? "bg-orange-400" : "bg-blue-500"}`}
//                     style={{ width: `${widthPct}%`, minWidth: "2px" }}
//                   />
//                   <span className="ml-2 text-[12px] text-gray-500 whitespace-nowrap">
//                     {label}
//                   </span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { HiOutlineDownload, HiSearch } from "react-icons/hi";
import { RiArrowUpSLine, RiArrowDownSLine } from "react-icons/ri";

// ── Types ──
interface Order {
  time: string;
  date: string;
  type: "BUY" | "SELL";
  instrument: string;
  exchange: string;
  product: string;
  qty: string;
  avgPrice: number;
  status: "COMPLETE" | "PENDING" | "REJECTED" | "CANCELLED";
  ltp?: number;
}

interface PositionRow {
  product: string;
  instrument: string;
  exchange: string;
  netQty: number;
  avg: number;
  ltp: number;
  pnl: number;
  chg: number;
  status: "OPEN" | "CLOSED";
}

// ── Helpers ──
function formatNumber(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Splits "SENSEX 18th JUN 74600 CE" into base text + ordinal superscript + rest
function renderInstrumentName(instrument: string) {
  const match = instrument.match(/^(.*?\b\d+)(st|nd|rd|th)\b(.*)$/);
  if (!match) return <span>{instrument}</span>;
  const [, before, ordinal, after] = match;
  return (
    <span>
      {before}
      <sup className="text-[10px]">{ordinal}</sup>
      <span className="text-blue-400  bg-blue-100 rounded-full">w</span>
      {after.trim()}
    </span>
  );
}

// Returns today's date as YYYY-MM-DD
function getTodayDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Derive today's positions from COMPLETE orders, grouped by instrument
// Agar same instrument/product/exchange ka net qty 0 ho jaye (square off ho gya)
// lekin trade aaj ki hi hai, to bhi position row dikhayenge with status "CLOSED"
function derivePositions(orders: Order[]): PositionRow[] {
  const groups = new Map<string, Order[]>();

  const today = getTodayDate();

  orders
    .filter((o) => o.status === "COMPLETE" && o.date === today)
    .forEach((o) => {
      const key = `${o.instrument}__${o.product}__${o.exchange}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(o);
    });

  const rows: PositionRow[] = [];

  groups.forEach((orderList, key) => {
    const [instrument, product, exchange] = key.split("__");
    const ltp = orderList[0].ltp ?? orderList[0].avgPrice;

    let buyQty = 0;
    let buyValue = 0;
    let sellQty = 0;
    let sellValue = 0;

    orderList.forEach((o) => {
      const executedQty = parseInt(o.qty.split("/")[1]?.trim() || "0", 10);
      if (o.type === "BUY") {
        buyQty += executedQty;
        buyValue += executedQty * o.avgPrice;
      } else {
        sellQty += executedQty;
        sellValue += executedQty * o.avgPrice;
      }
    });

    const netQty = buyQty - sellQty;
    const avgPrice =
      buyQty + sellQty > 0 ? (buyValue + sellValue) / (buyQty + sellQty) : 0;

    // Realized + unrealized P&L: (sell value - buy value) + net position marked to LTP
    const pnl = sellValue - buyValue + netQty * ltp;
    const chg = avgPrice > 0 ? ((ltp - avgPrice) / avgPrice) * 100 : 0;

    // Net qty 0 ka matlab position square off ho gyi hai (CLOSED), warna OPEN hai
    const status: "OPEN" | "CLOSED" = netQty === 0 ? "CLOSED" : "OPEN";

    rows.push({
      product,
      instrument,
      exchange,
      netQty,
      avg: avgPrice,
      ltp,
      pnl,
      chg,
      status,
    });
  });

  return rows;
}

// ── Search Input ──
function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-200 bg-white">
      <HiSearch className="text-gray-400 text-sm shrink-0" />
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-xs text-gray-700 w-[120px]"
      />
    </div>
  );
}

// ── Section Header ──
function SectionHeader({
  title, count, collapsed, onToggle, searchVal, onSearch, extraActions
}: {
  title: string; count: number; collapsed: boolean; onToggle: () => void;
  searchVal: string; onSearch: (v: string) => void; extraActions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 pb-2.5">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-none border-none cursor-pointer text-gray-800"
      >
        <span className="text-base font-semibold">
          {title} ({count})
        </span>
        {collapsed
          ? <RiArrowDownSLine className="text-lg text-gray-400" />
          : <RiArrowUpSLine className="text-lg text-gray-400" />
        }
      </button>

      <div className="flex items-center gap-3">
        <SearchBox value={searchVal} onChange={onSearch} />
        {extraActions}
        <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
          <HiOutlineDownload size={14} /> Download
        </button>
      </div>
    </div>
  );
}

// ── Positions Table (shared shape for both sections) ──
function PositionsTable({
  rows,
  totalPnl,
  showCheckbox,
  selected,
  onToggleRow,
  onToggleAll,
}: {
  rows: PositionRow[];
  totalPnl: number;
  showCheckbox: boolean;
  selected?: Set<number>;
  onToggleRow?: (i: number) => void;
  onToggleAll?: () => void;
}) {
  const cols = ["Product", "Instrument", "Qty.", "Avg.", "LTP", "P&L", "Chg."];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {showCheckbox && (
              <th className="px-3 py-2 border-b border-gray-100 w-8">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selected?.size === rows.length}
                  onChange={onToggleAll}
                  className="cursor-pointer"
                />
              </th>
            )}
            {cols.map((h) => (
              <th
                key={h}
                className={`px-3 py-2 text-[11px] font-semibold text-gray-400 text-left border-b border-gray-100 whitespace-nowrap ${
                  ["Qty.", "Avg.", "LTP", "P&L", "Chg."].includes(h) ? "text-right" : ""
                } ${h === "P&L" ? "bg-gray-50" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={cols.length + (showCheckbox ? 1 : 0)}
                className="px-3 py-8 text-center text-gray-400 text-[13px] border-b border-gray-100"
              >
                No data found
              </td>
            </tr>
          ) : (
            rows.map((pos, i) => (
              <tr key={i} className="transition-colors duration-100 hover:bg-gray-50">
                {showCheckbox && (
                  <td className="px-3 py-3 border-b border-gray-100">
                    <input
                      type="checkbox"
                      checked={selected?.has(i) ?? false}
                      onChange={() => onToggleRow?.(i)}
                      className="cursor-pointer"
                    />
                  </td>
                )}
                <td className="px-3 py-3 border-b border-gray-100 whitespace-nowrap">
                  <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {pos.product}
                  </span>
                  {/* {pos.status === "CLOSED" && (
                    <span className="ml-1.5 text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                      CLOSED
                    </span>
                  )} */}
                </td>
                <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-gray-100 whitespace-nowrap">
                  {renderInstrumentName(pos.instrument)}{" "}
                  <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {pos.exchange}
                  </span>
                </td>
                <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
                  {pos.netQty}
                </td>
                <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
                  {pos.avg.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-gray-100 whitespace-nowrap text-right">
                  {formatNumber(pos.ltp)}
                </td>
                <td
                  className={`px-3 py-3 text-[13px] font-medium border-b border-gray-100 whitespace-nowrap text-right bg-gray-50 ${
                    pos.pnl >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {pos.pnl >= 0 ? "+" : ""}
                  {formatNumber(pos.pnl)}
                </td>
                <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
                  {pos.chg.toFixed(2)}%
                </td>
              </tr>
            ))
          )}
        </tbody>
        {rows.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan={showCheckbox ? 5 : 4}></td>
              <td className="px-3 py-3 text-[13px] text-gray-600 text-right whitespace-nowrap">
                Total P&L
              </td>
              <td
                className={`px-3 py-3 text-[13px] font-semibold text-right whitespace-nowrap bg-gray-50 ${
                  totalPnl >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {totalPnl >= 0 ? "+" : ""}
                {formatNumber(totalPnl)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

// ── Main Component ──
export default function Positions() {
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [positionsCollapsed, setPositionsCollapsed] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [positionSearch, setPositionSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/data.json");
        const data = await response.json();
        setPositions(derivePositions(data.orders || []));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredPositions = positions.filter((p) =>
    p.instrument.toLowerCase().includes(positionSearch.toLowerCase())
  );
  const filteredHistory = positions.filter((p) =>
    p.instrument.toLowerCase().includes(historySearch.toLowerCase())
  );

  const positionsTotalPnl = filteredPositions.reduce((sum, p) => sum + p.pnl, 0);
  const historyTotalPnl = filteredHistory.reduce((sum, p) => sum + p.pnl, 0);

  const toggleRow = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filteredPositions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredPositions.map((_, i) => i)));
    }
  };

  // Breakdown: sorted by absolute P&L desc, orange for negative, blue for positive
  const breakdown = [...positions].sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
  const maxAbsPnl = Math.max(...breakdown.map((p) => Math.abs(p.pnl)), 1);

  if (loading) {
    return (
      <div className="min-h-full px-6 pb-6 text-gray-800 flex items-center justify-center h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-6 pb-6 text-gray-800 text-[13px] bg-white">
      {/* ═══ Positions Section ═══ */}
      <SectionHeader
        title="Positions"
        count={filteredPositions.length}
        collapsed={positionsCollapsed}
        onToggle={() => setPositionsCollapsed((p) => !p)}
        searchVal={positionSearch}
        onSearch={setPositionSearch}
        extraActions={
          <>
            <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
              Analytics
            </button>
            <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
              Settings
            </button>
          </>
        }
      />

      {!positionsCollapsed && (
        <PositionsTable
          rows={filteredPositions}
          totalPnl={positionsTotalPnl}
          showCheckbox
          selected={selected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
        />
      )}

      {/* ═══ Day's History Section (same data, no checkbox) ═══ */}
      <div className="mt-6">
        <SectionHeader
          title="Day's history"
          count={filteredHistory.length}
          collapsed={historyCollapsed}
          onToggle={() => setHistoryCollapsed((p) => !p)}
          searchVal={historySearch}
          onSearch={setHistorySearch}
        />

        {!historyCollapsed && (
          <PositionsTable rows={filteredHistory} totalPnl={historyTotalPnl} showCheckbox={false} />
        )}
      </div>

      {/* ═══ Breakdown Section ═══ */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-100">
          Breakdown
        </h2>

        <div className="mt-4 space-y-2">
          {breakdown.map((pos, i) => {
            const widthPct = (Math.abs(pos.pnl) / maxAbsPnl) * 100;
            const isNegative = pos.pnl < 0;
            const label = `${pos.instrument} (${pos.product})`;

            return (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 flex items-center">
                  <div
                    className={`h-5 rounded-sm ${isNegative ? "bg-orange-400" : "bg-blue-500"}`}
                    style={{ width: `${widthPct}%`, minWidth: "2px" }}
                  />
                  <span className="ml-2 text-[12px] text-gray-500 whitespace-nowrap">
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}