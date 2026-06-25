// import { useState, useEffect } from "react";
// import { HiOutlineDownload, HiSearch } from "react-icons/hi";
// import { RiArrowUpSLine, RiArrowDownSLine, RiSoundModuleFill } from "react-icons/ri";
// import { useDemoTradeStore } from "../store/useDemoTradeStore";
// import ExitConfirmModal from "../components/modal/ExitConfirmModal";
// import { RowContextMenu } from "../components/modal/RowContextMenu";

// function formatNumber(n: number) {
//   return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// }

// /** Returns true only if the trade belongs to today (compares local date) */
// function isTodayTrade(t: any): boolean {
//   const dateStr: string | undefined = t.createdAt ?? t.opened_at ?? t.created_at;
//   if (!dateStr) return true; // no date field → include (safe fallback)
//   const tradeDate = new Date(dateStr);
//   const today = new Date();
//   return (
//     tradeDate.getFullYear() === today.getFullYear() &&
//     tradeDate.getMonth() === today.getMonth() &&
//     tradeDate.getDate() === today.getDate()
//   );
// }

// // ─── Full-page Empty State ─────────────────────────────────────────────────────
// function NoPositionsPage() {
//   return (
//     <div className="min-h-full flex flex-col items-center justify-start px-6 pt-16 bg-white text-center">
//       <svg
//         width="64"
//         height="64"
//         viewBox="0 0 64 64"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//         className="mb-5 text-gray-200"
//       >
//         <rect x="4" y="36" width="12" height="22" rx="3" fill="currentColor" />
//         <rect x="20" y="24" width="12" height="34" rx="3" fill="currentColor" />
//         <rect x="36" y="12" width="12" height="46" rx="3" fill="currentColor" />
//         <rect x="52" y="28" width="8" height="30" rx="3" fill="currentColor" />
//         <line x1="2" y1="9" x2="62" y2="9" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 3" />
//       </svg>
//       <p className="text-[15px] text-gray-400 mb-5">You don't have any position yet</p>
//       <div>
//         <button className="px-4 py-2 bg-blue-500 text-white rounded-sm">Get started</button>
//       </div>
//     </div>
//   );
// }

// function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
//   return (
//     <div className="flex items-center gap-1.5 px-2 py-1 border border-gray-200 bg-white rounded">
//       <HiSearch className="text-gray-400 text-sm shrink-0" />
//       <input
//         type="text"
//         placeholder="Search"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="bg-transparent border-none outline-none text-xs text-gray-700 w-12"
//       />
//     </div>
//   );
// }

// // ─── Positions Header ──────────────────────────────────────────────────────────
// function PositionsHeader({
//   title, count, collapsed, onToggle, searchVal, onSearch,
// }: {
//   title: string; count: number; collapsed: boolean; onToggle: () => void;
//   searchVal: string; onSearch: (v: string) => void;
// }) {
//   return (
//     <div className="flex items-center justify-between py-3.5 pb-2.5">
//       <button onClick={onToggle} className="flex items-center gap-2 bg-none border-none cursor-pointer text-gray-800">
//         <span className="text-base font-medium">{title} ({count})</span>
//       </button>
//       <div className="flex items-center gap-3">
//         <SearchBox value={searchVal} onChange={onSearch} />
//         <button className="flex items-center gap-0.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
//           <img src="./analytics.png" alt="Analytics" className="w-4 h-4 object-contain" />
//           Analytics
//         </button>
//         <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
//           <RiSoundModuleFill size={14} /> Settings
//         </button>
//         <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
//           <HiOutlineDownload size={14} /> Download
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── History Header ────────────────────────────────────────────────────────────
// function HistoryHeader({
//   title, count, collapsed, onToggle, searchVal, onSearch, hideAll = false,
// }: {
//   title: string; count: number; collapsed: boolean; onToggle: () => void;
//   searchVal: string; onSearch: (v: string) => void; hideAll?: boolean;
// }) {
//   return (
//     <div className="flex items-center justify-between py-3.5 pb-2.5">
//       <button onClick={onToggle} className="flex items-center gap-2 bg-none border-none cursor-pointer text-gray-800">
//         <span className="text-base font-medium">{title} {!hideAll && `(${count})`}</span>
//         {collapsed
//           ? <RiArrowDownSLine className="text-lg text-gray-400" />
//           : <RiArrowUpSLine className="text-lg text-gray-400" />}
//       </button>
//       {!hideAll && (
//         <div className="flex items-center gap-3">
//           <SearchBox value={searchVal} onChange={onSearch} />
//           <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
//             <HiOutlineDownload size={14} /> Download
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// interface DisplayRow {
//   id: number;
//   product: string;
//   instrument: string;
//   exchange: string;
//   netQty: number;
//   avg: number;
//   ltp: number;
//   pnl: number;
//   chg: number;
// }

// // ─── Positions Table ───────────────────────────────────────────────────────────
// function PositionsTable({
//   rows, totalPnl, showCheckbox, selected,
//   onToggleRow, onToggleAll, onSingleExit, onBulkExit,
// }: {
//   rows: DisplayRow[];
//   totalPnl: number;
//   showCheckbox: boolean;
//   selected?: Set<number>;
//   onToggleRow?: (i: number) => void;
//   onToggleAll?: () => void;
//   onSingleExit?: (row: DisplayRow) => void;
//   onBulkExit?: () => void;
// }) {
//   const cols = showCheckbox
//     ? ["Product", "Instrument", "Qty.", "Avg.", "LTP", "P&L", "Chg.", ""]
//     : ["Product", "Instrument", "Qty.", "Avg.", "LTP", "P&L", "Chg."];

//   return (
//     <div className="relative overflow-x-auto"> {/* Added relative here */}
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
//             {cols.map((h, idx) => (
//               <th
//                 key={idx}
//                 className={`px-3 py-2 text-[11px] text-gray-400 text-left border-b border-gray-100 whitespace-nowrap font-medium
//                   ${["Qty.", "Avg.", "LTP", "P&L", "Chg."].includes(h) ? "text-right" : ""}
//                   ${h === "P&L" ? "bg-gray-50" : ""}
//                 `}
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
//               <tr key={pos.id} className="group transition-colors duration-100 hover:bg-gray-50">
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
//                 <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap">
//                   {pos.instrument}{" "}
//                   <span className="text-[10px] text-gray-400 px-1.5 py-0.5 rounded">
//                     {pos.exchange}
//                   </span>
//                 </td>
//                 <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
//                   {pos.netQty}
//                 </td>
//                 <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
//                   {pos.avg.toFixed(2)}
//                 </td>
//                 <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
//                   {formatNumber(pos.ltp)}
//                 </td>
//                 <td className={`px-3 py-3 text-[13px] font-medium border-b bg-gray-50 border-gray-100 whitespace-nowrap text-right ${pos.pnl > 0 ? "text-green-600" : pos.pnl < 0 ? "text-red-600" : "text-gray-400"
//                   }`}>
//                   {pos.pnl >= 0 ? "+" : ""}{formatNumber(pos.pnl)}
//                 </td>
//                 <td
//                   className={`px-3 py-3 text-[13px] border-b border-gray-100 whitespace-nowrap text-right ${pos.pnl > 0
//                       ? "text-green-600"
//                       : pos.pnl < 0
//                         ? "text-red-600"
//                         : "text-gray-400"
//                     }`}
//                 >
//                   {pos.chg.toFixed(2)}%
//                 </td>
//                 {showCheckbox && (
//                   <td className="border-b border-gray-100 whitespace-nowrap p-0">
//                     <div className="flex items-stretch h-full">
//                       <RowContextMenu />
//                     </div>
//                   </td>
//                 )}
//               </tr>
//             ))
//           )}
//         </tbody>
//         {rows.length > 0 && (
//           <tfoot>
//             <tr className="">
//               {showCheckbox && <td className="px-3 py-3 w-8" />}
//               <td colSpan={4} className="px-3 py-3">
//                 {showCheckbox && selected && selected.size > 0 && onBulkExit && (
//                   <div className="absolute left-3 bottom-3"> {/* Absolute positioning */}
//                     <button
//                       onClick={onBulkExit}
//                       className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium rounded transition-colors whitespace-nowrap shadow-md"
//                     >
//                       Exit {selected.size} Positions
//                     </button>
//                   </div>
//                 )}
//               </td>
//               <td className="px-3 py-3 text-[13px] text-gray-600 text-right whitespace-nowrap font-medium">
//                 Total P&L
//               </td>
//               <td className={`px-3 py-3 text-[13px] text-right whitespace-nowrap font-medium ${totalPnl >= 0 ? "text-green-600" : "text-red-500"}`}>
//                 {totalPnl >= 0 ? "+" : ""}{formatNumber(totalPnl)}
//               </td>
//               {showCheckbox && <td className="w-8" />}
//             </tr>
//           </tfoot>
//         )}
//       </table>
//     </div>
//   );
// }

// // ─── Main Component ────────────────────────────────────────────────────────────
// export default function Positions() {
//   const { trades, loading, fetchTrades, initLiveQuoteListener, liveQuotes, closeTrade } =
//     useDemoTradeStore();

//   const [positionsCollapsed, setPositionsCollapsed] = useState(false);
//   const [historyCollapsed, setHistoryCollapsed] = useState(true);
//   const [positionSearch, setPositionSearch] = useState("");
//   const [historySearch, setHistorySearch] = useState("");
//   const [selected, setSelected] = useState<Set<number>>(new Set());

//   const [modalPositions, setModalPositions] = useState<DisplayRow[]>([]);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     fetchTrades();
//     initLiveQuoteListener();
//     const interval = setInterval(() => fetchTrades(), 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // ── Filter: only today's trades ──────────────────────────────────────────────
//   const todayTrades = trades.filter(isTodayTrade);
//   const openTrades = todayTrades.filter((t) => t.status === "OPEN");
//   const closedTrades = todayTrades.filter((t) => t.status === "CLOSED");

//   const toDisplayRow = (t: any): DisplayRow => {
//     const liveLtp = liveQuotes[t.token]?.ltp ?? t.entry_price;
//     const pnl =
//       t.status === "CLOSED"
//         ? t.pnl
//         : t.transaction_type === "BUY"
//           ? (liveLtp - t.entry_price) * t.quantity
//           : (t.entry_price - liveLtp) * t.quantity;
//     const chg = t.entry_price > 0 ? ((liveLtp - t.entry_price) / t.entry_price) * 100 : 0;
//     return {
//       id: t.id,
//       product: t.transaction_type,
//       instrument: t.name,
//       exchange: t.exchange,
//       netQty: t.transaction_type === "BUY" ? t.quantity : -t.quantity,
//       avg: t.entry_price,
//       ltp: t.status === "CLOSED" ? t.exit_price ?? liveLtp : liveLtp,
//       pnl, 
//       chg,
//     };
//   };

//   const filteredPositions = openTrades
//     .map(toDisplayRow)
//     .filter((p) => p.instrument.toLowerCase().includes(positionSearch.toLowerCase()));

//   const filteredHistory = closedTrades
//     .map(toDisplayRow)
//     .filter((p) => p.instrument.toLowerCase().includes(historySearch.toLowerCase()));

//   const positionsTotalPnl = filteredPositions.reduce((sum, p) => sum + p.pnl, 0);
//   const historyTotalPnl = filteredHistory.reduce((sum, p) => sum + p.pnl, 0);

//   // Breakdown = today open + closed, sorted by abs pnl
//   const breakdown = [...openTrades, ...closedTrades]
//     .map(toDisplayRow)
//     .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));

//   const maxAbsPnl = Math.max(...breakdown.map((p) => Math.abs(p.pnl)), 1);

//   const toggleRow = (i: number) =>
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(i) ? next.delete(i) : next.add(i);
//       return next;
//     });

//   const toggleAll = () =>
//     selected.size === filteredPositions.length
//       ? setSelected(new Set())
//       : setSelected(new Set(filteredPositions.map((_, i) => i)));

//   const handleBulkExit = () => {
//     setModalPositions(filteredPositions.filter((_, i) => selected.has(i)));
//     setShowModal(true);
//   };

//   const handleSingleExit = (row: DisplayRow) => {
//     setModalPositions([row]);
//     setShowModal(true);
//   };

//   const handleModalConfirm = async () => {
//     for (const pos of modalPositions) await closeTrade(pos.id);
//     setShowModal(false);
//     setModalPositions([]);
//     setSelected(new Set());
//   };

//   const handleModalCancel = () => {
//     setShowModal(false);
//     setModalPositions([]);
//   };

//   // ── Loading state ─────────────────────────────────────────────────────────────
//   if (loading && trades.length === 0) {
//     return (
//       <div className="min-h-full px-6 pb-6 text-gray-800 flex items-center justify-center h-[400px]">
//         <div className="text-gray-400">Loading...</div>
//       </div>
//     );
//   }

//   // ── No trades today → full-page empty state ───────────────────────────────────
//   if (todayTrades.length === 0) {
//     return <NoPositionsPage />;
//   }

//   // ── Normal render ─────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-full px-6 pb-6 text-gray-800 text-[13px] bg-white">
//       {showModal && (
//         <ExitConfirmModal
//           positions={modalPositions}
//           onConfirm={handleModalConfirm}
//           onCancel={handleModalCancel}
//         />
//       )}

//       {/* Positions */}
//       <PositionsHeader
//         title="Positions"
//         count={filteredPositions.length}
//         collapsed={positionsCollapsed}
//         onToggle={() => setPositionsCollapsed((p) => !p)}
//         searchVal={positionSearch}
//         onSearch={setPositionSearch}
//       />
//       {!positionsCollapsed && (
//         <PositionsTable
//           rows={filteredPositions}
//           totalPnl={positionsTotalPnl}
//           showCheckbox
//           selected={selected}
//           onToggleRow={toggleRow}
//           onToggleAll={toggleAll}
//           onSingleExit={handleSingleExit}
//           onBulkExit={handleBulkExit}
//         />
//       )}

//       {/* Day's History */}
//       <div className="mt-6">
//         <HistoryHeader
//           title="Day's history"
//           count={filteredHistory.length}
//           collapsed={historyCollapsed}
//           onToggle={() => setHistoryCollapsed((p) => !p)}
//           searchVal={historySearch}
//           onSearch={setHistorySearch}
//           hideAll={historyCollapsed}
//         />
//         {!historyCollapsed && (
//           <PositionsTable
//             rows={filteredHistory}
//             totalPnl={historyTotalPnl}
//             showCheckbox={false}
//           />
//         )}
//       </div>

//       {/* Breakdown — today only */}
//       <div className="mt-8">
//         <h2 className="text-base text-gray-800 pb-2 border-b border-gray-100 font-medium">
//           Breakdown
//         </h2>
//         <div className="mt-4 space-y-2">
//           {breakdown.map((pos) => {
//             const widthPct = (Math.abs(pos.pnl) / maxAbsPnl) * 45;
//             const isNegative = pos.pnl < 0;
//             return (
//               <div key={pos.id} className="flex items-center">
//                 {/* Left — loss bar */}
//                 <div className="flex-1 flex items-center justify-end">
//                   {isNegative
//                     ? <div className="h-2 bg-orange-400" style={{ width: `${widthPct}%` }} />
//                     : <div style={{ width: `${widthPct}%` }} />}
//                 </div>

//                 {/* Center label */}
//                 <span className="shrink-0 px-2 text-[12px] text-gray-500 whitespace-nowrap">
//                   {pos.instrument} ({pos.product})
//                 </span>

//                 {/* Right — profit bar */}
//                 <div className="flex-1 flex items-center justify-start">
//                   {!isNegative
//                     ? <div className="h-2 bg-blue-500" style={{ width: `${widthPct}%` }} />
//                     : <div style={{ width: `${widthPct}%` }} />}
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
import { RiArrowUpSLine, RiArrowDownSLine, RiSoundModuleFill } from "react-icons/ri";
import { useDemoTradeStore } from "../store/useDemoTradeStore";
import ExitConfirmModal from "../components/modal/ExitConfirmModal";
import { RowContextMenu } from "../components/modal/RowContextMenu";

function formatNumber(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Returns true only if the trade belongs to today (compares local date) */
function isTodayTrade(t: any): boolean {
  const dateStr: string | undefined = t.createdAt ?? t.opened_at ?? t.created_at;
  if (!dateStr) return true;
  const tradeDate = new Date(dateStr);
  const today = new Date();
  return (
    tradeDate.getFullYear() === today.getFullYear() &&
    tradeDate.getMonth() === today.getMonth() &&
    tradeDate.getDate() === today.getDate()
  );
}

// ─── Full-page Empty State ─────────────────────────────────────────────────────
function NoPositionsPage() {
  return (
    <div className="min-h-full flex flex-col items-center justify-start px-6 pt-16 bg-white text-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-5 text-gray-200"
      >
        <rect x="4" y="36" width="12" height="22" rx="3" fill="currentColor" />
        <rect x="20" y="24" width="12" height="34" rx="3" fill="currentColor" />
        <rect x="36" y="12" width="12" height="46" rx="3" fill="currentColor" />
        <rect x="52" y="28" width="8" height="30" rx="3" fill="currentColor" />
        <line x1="2" y1="9" x2="62" y2="9" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>
      <p className="text-[15px] text-gray-400 mb-5">You don't have any position yet</p>
      <div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-sm">Get started</button>
      </div>
    </div>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 border border-gray-200 bg-white rounded">
      <HiSearch className="text-gray-400 text-sm shrink-0" />
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-xs text-gray-700 w-12"
      />
    </div>
  );
}

// ─── Positions Header ──────────────────────────────────────────────────────────
function PositionsHeader({
  title, count, collapsed, onToggle, searchVal, onSearch,
}: {
  title: string; count: number; collapsed: boolean; onToggle: () => void;
  searchVal: string; onSearch: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 pb-2.5">
      <button onClick={onToggle} className="flex items-center gap-2 bg-none border-none cursor-pointer text-gray-800">
        <span className="text-base font-medium">{title} ({count})</span>
      </button>
      <div className="flex items-center gap-3">
        <SearchBox value={searchVal} onChange={onSearch} />
        <button className="flex items-center gap-0.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
          <img src="./analytics.png" alt="Analytics" className="w-4 h-4 object-contain" />
          Analytics
        </button>
        <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
          <RiSoundModuleFill size={14} /> Settings
        </button>
        <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
          <HiOutlineDownload size={14} /> Download
        </button>
      </div>
    </div>
  );
}

// ─── History Header ────────────────────────────────────────────────────────────
function HistoryHeader({
  title, count, collapsed, onToggle, searchVal, onSearch, hideAll = false,
}: {
  title: string; count: number; collapsed: boolean; onToggle: () => void;
  searchVal: string; onSearch: (v: string) => void; hideAll?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 pb-2.5">
      <button onClick={onToggle} className="flex items-center gap-2 bg-none border-none cursor-pointer text-gray-800">
        <span className="text-base font-medium">{title} {!hideAll && `(${count})`}</span>
        {collapsed
          ? <RiArrowDownSLine className="text-lg text-gray-400" />
          : <RiArrowUpSLine className="text-lg text-gray-400" />}
      </button>
      {!hideAll && (
        <div className="flex items-center gap-3">
          <SearchBox value={searchVal} onChange={onSearch} />
          <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-blue-500 text-xs font-medium">
            <HiOutlineDownload size={14} /> Download
          </button>
        </div>
      )}
    </div>
  );
}

interface DisplayRow {
  id: number;
  product: string;
  instrument: string;
  exchange: string;
  netQty: number;
  avg: number;
  ltp: number;
  pnl: number;
  chg: number;
  validity: string;
  type: string;
  price: string;
  transaction_type: string;
  isClosed?: boolean; // flag to distinguish closed rows in positions table
}

// ─── Positions Table ───────────────────────────────────────────────────────────
function PositionsTable({
  rows, totalPnl, showCheckbox, selected,
  onToggleRow, onToggleAll, onSingleExit, onBulkExit,
}: {
  rows: DisplayRow[];
  totalPnl: number;
  showCheckbox: boolean;
  selected?: Set<number>;
  onToggleRow?: (i: number) => void;
  onToggleAll?: () => void;
  onSingleExit?: (row: DisplayRow) => void;
  onBulkExit?: () => void;
}) {
  const cols = showCheckbox
    ? ["Product", "Instrument", "Qty.", "Avg.", "LTP", "P&L", "Chg.", ""]
    : ["Product", "Instrument", "Qty.", "Avg.", "LTP", "P&L", "Chg."];

  // For checkbox table: only open rows (isClosed === false/undefined) are selectable
  const openRows = rows.filter((r) => !r.isClosed);

  const allOpenSelected =
    openRows.length > 0 && selected !== undefined && openRows.every((_, i) => {
      const globalIdx = rows.findIndex((r) => r === openRows[i]);
      return selected.has(globalIdx);
    });

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {showCheckbox && (
              <th className="px-3 py-2 border-b border-gray-100 w-8">
                <input
                  type="checkbox"
                  checked={allOpenSelected}
                  onChange={onToggleAll}
                  className="cursor-pointer"
                />
              </th>
            )}
            {cols.map((h, idx) => (
              <th
                key={idx}
                className={`px-3 py-2 text-[11px] text-gray-400 text-left border-b border-gray-100 whitespace-nowrap font-medium
                  ${["Qty.", "Avg.", "LTP", "P&L", "Chg."].includes(h) ? "text-right" : ""}
                  ${h === "P&L" ? "bg-gray-50" : ""}
                `}
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
            rows.map((pos, i) => {
              const isClosed = pos.isClosed === true;

              return (
                <tr
                  key={pos.id}
                  className={`group transition-colors duration-100 hover:bg-gray-50 ${isClosed ? "opacity-80" : ""}`}
                >
                  {showCheckbox && (
                    <td className="px-3 py-3 border-b border-gray-100">
                          <input
                        type="checkbox"
                        checked={isClosed ? false : (selected?.has(i) ?? false)}
                        onChange={() => !isClosed && onToggleRow?.(i)}
                        disabled={isClosed}
                        className={isClosed ? "cursor-not-allowed opacity-80" : "cursor-pointer"}
                      />
                    </td>
                  )}

                  {/* Product */}
                  <td className="px-3 py-3 border-b border-gray-100 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {pos.product}
                      </span>
                    </div>
                  </td>

                  {/* Instrument */}
                  <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap">
                    {pos.instrument}{" "}
                    <span className="text-[10px] text-gray-400 px-1.5 py-0.5 rounded">
                      {pos.exchange}
                    </span>
                  </td>

                  {/* Qty */}
                  <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
                    {pos.netQty}
                  </td>

                  {/* Avg */}
                  <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
                    {pos.avg.toFixed(2)}
                  </td>

                  {/* LTP */}
                  <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
                    {formatNumber(pos.ltp)}
                  </td>

                  {/* P&L — neutral gray for closed rows */}
                  <td
                    className={`px-3 py-3 text-[13px] font-medium border-b bg-gray-50 border-gray-100 whitespace-nowrap text-right
                      ${isClosed
                        ? "text-gray-400"
                        : pos.pnl > 0
                          ? "text-green-600"
                          : pos.pnl < 0
                            ? "text-red-600"
                            : "text-gray-400"
                      }`}
                  >
                    {pos.pnl >= 0 ? "+" : ""}{formatNumber(pos.pnl)}
                  </td>

                  {/* Chg — neutral gray for closed rows */}
                  <td
                    className={`px-3 py-3 text-[13px] border-b border-gray-100 whitespace-nowrap text-right
                      ${isClosed
                        ? "text-gray-400"
                        : pos.pnl > 0
                          ? "text-green-600"
                          : pos.pnl < 0
                            ? "text-red-600"
                            : "text-gray-400"
                      }`}
                  >
                    {pos.chg.toFixed(2)}%
                  </td>

                  {/* Context menu — only for open rows */}
                  {showCheckbox && (
                    <td className="border-b border-gray-100 whitespace-nowrap p-0">
                      {!isClosed && (
                        <div className="flex items-stretch h-full">
                          <RowContextMenu />
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
        {rows.length > 0 && (
          <tfoot>
            <tr>
              {showCheckbox && <td className="px-3 py-3 w-8" />}
              <td colSpan={4} className="px-3 py-3">
                {showCheckbox && selected && selected.size > 0 && onBulkExit && (
                  <div className="absolute left-3 bottom-3">
                    <button
                      onClick={onBulkExit}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium rounded-xs transition-colors whitespace-nowrap shadow-md"
                    >
                      Exit {selected.size} Positions
                    </button>
                  </div>
                )}
              </td>
              <td className="px-3 py-3 text-[13px] text-gray-600 text-right whitespace-nowrap font-medium">
                Total P&L
              </td>
              <td className={`px-3 py-3 text-[13px] text-right whitespace-nowrap font-medium ${totalPnl >= 0 ? "text-green-600" : "text-red-500"}`}>
                {totalPnl >= 0 ? "+" : ""}{formatNumber(totalPnl)}
              </td>
              {showCheckbox && <td className="w-8" />}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Positions() {
  const { trades, loading, fetchTrades, initLiveQuoteListener, liveQuotes, closeTrade } =
    useDemoTradeStore();

  const [positionsCollapsed, setPositionsCollapsed] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  const [positionSearch, setPositionSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [modalPositions, setModalPositions] = useState<DisplayRow[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTrades();
    initLiveQuoteListener();
    const interval = setInterval(() => fetchTrades(), 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Filter: only today's trades ──────────────────────────────────────────────
  const todayTrades = trades.filter(isTodayTrade);
  const openTrades = todayTrades.filter((t) => t.status === "OPEN");
  const closedTrades = todayTrades.filter((t) => t.status === "CLOSED");

  const toDisplayRow = (t: any, isClosed = false): DisplayRow => {
    const liveLtp = liveQuotes[t.token]?.ltp ?? t.entry_price;
    const pnl =
      t.status === "CLOSED"
        ? t.pnl
        : t.transaction_type === "BUY"
          ? (liveLtp - t.entry_price) * t.quantity
          : (t.entry_price - liveLtp) * t.quantity;
    const chg = t.entry_price > 0 ? ((liveLtp - t.entry_price) / t.entry_price) * 100 : 0;
    return {
      id: t.id,
      product: t.product,
      instrument: t.name,
      exchange: t.exchange,
      netQty: t.transaction_type === "BUY" ? t.quantity : -t.quantity,
      avg: t.entry_price,
      ltp: t.status === "CLOSED" ? t.exit_price ?? liveLtp : liveLtp,
      pnl,
      chg,
      validity: t.validity,
      type: t.order_type,
      price: t.price,
      transaction_type: t.transaction_type,
      isClosed,
    };
  };

  // Positions table = open rows first, then closed rows (neutral, no checkbox)
  const filteredOpenPositions = openTrades
    .map((t) => toDisplayRow(t, false))
    .filter((p) => p.instrument.toLowerCase().includes(positionSearch.toLowerCase()));

  const filteredClosedInPositions = closedTrades
    .map((t) => toDisplayRow(t, true))
    .filter((p) => p.instrument.toLowerCase().includes(positionSearch.toLowerCase()));

  // Combined rows for the Positions table: open first, closed appended below
  const allPositionRows = [...filteredOpenPositions, ...filteredClosedInPositions];

  // Day's History table = closed trades only (same as before)
  const filteredHistory = closedTrades
    .map((t) => toDisplayRow(t, false))
    .filter((p) => p.instrument.toLowerCase().includes(historySearch.toLowerCase()));

  // P&L totals — only count open trades in positions total
  const positionsTotalPnl = filteredOpenPositions.reduce((sum, p) => sum + p.pnl, 0);
  const historyTotalPnl = filteredHistory.reduce((sum, p) => sum + p.pnl, 0);

  // Breakdown = today open + closed, sorted by abs pnl
  const breakdown = [...openTrades, ...closedTrades]
    .map((t) => toDisplayRow(t, false))
    .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));

  const maxAbsPnl = Math.max(...breakdown.map((p) => Math.abs(p.pnl)), 1);

  // Checkbox logic: only open rows (indices 0..filteredOpenPositions.length-1) are selectable
  const toggleRow = (i: number) => {
    // Only allow toggling open rows
    if (i >= filteredOpenPositions.length) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleAll = () => {
    const openIndices = filteredOpenPositions.map((_, i) => i);
    const allSelected = openIndices.every((i) => selected.has(i));
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(openIndices));
    }
  };

  const handleBulkExit = () => {
    setModalPositions(filteredOpenPositions.filter((_, i) => selected.has(i)));
    setShowModal(true);
  };

  const handleSingleExit = (row: DisplayRow) => {
    setModalPositions([row]);
    setShowModal(true);
  };

  const handleModalConfirm = async () => {
    for (const pos of modalPositions) await closeTrade(pos.id);
    setShowModal(false);
    setModalPositions([]);
    setSelected(new Set());
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setModalPositions([]);
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading && trades.length === 0) {
    return (
      <div className="min-h-full px-6 pb-6 text-gray-800 flex items-center justify-center h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // ── No trades today → full-page empty state ───────────────────────────────────
  if (todayTrades.length === 0) {
    return <NoPositionsPage />;
  }

  // ── Normal render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full px-6 pb-6 text-gray-800 text-[13px] bg-white">
      {showModal && (
        <ExitConfirmModal
          positions={modalPositions}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}

      {/* Positions — open rows + closed rows (neutral) */}
      <PositionsHeader
        title="Positions"
        count={allPositionRows.length}
        collapsed={positionsCollapsed}
        onToggle={() => setPositionsCollapsed((p) => !p)}
        searchVal={positionSearch}
        onSearch={setPositionSearch}
      />
      {!positionsCollapsed && (
        <PositionsTable
          rows={allPositionRows}
          totalPnl={positionsTotalPnl}
          showCheckbox
          selected={selected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          onSingleExit={handleSingleExit}
          onBulkExit={handleBulkExit}
        />
      )}

      {/* Day's History — closed trades */}
      <div className="mt-6">
        <HistoryHeader
          title="Day's history"
          count={filteredHistory.length}
          collapsed={historyCollapsed}
          onToggle={() => setHistoryCollapsed((p) => !p)}
          searchVal={historySearch}
          onSearch={setHistorySearch}
          hideAll={historyCollapsed}
        />
        {!historyCollapsed && (
          <PositionsTable
            rows={filteredHistory}
            totalPnl={historyTotalPnl}
            showCheckbox={false}
          />
        )}
      </div>

      {/* Breakdown — today only */}
      <div className="mt-8">
        <h2 className="text-base text-gray-800 pb-2 border-b border-gray-100 font-medium">
          Breakdown
        </h2>
        <div className="mt-4 space-y-2">
          {breakdown.map((pos) => {
            const widthPct = (Math.abs(pos.pnl) / maxAbsPnl) * 45;
            const isNegative = pos.pnl < 0;
            return (
              <div key={pos.id} className="flex items-center">
                {/* Left — loss bar */}
                <div className="flex-1 flex items-center justify-end">
                  {isNegative
                    ? <div className="h-2 bg-orange-400" style={{ width: `${widthPct}%` }} />
                    : <div style={{ width: `${widthPct}%` }} />}
                </div>

                {/* Center label */}
                <span className="shrink-0 px-2 text-[12px] text-gray-500 whitespace-nowrap">
                  {pos.instrument} ({pos.product})
                </span>

                {/* Right — profit bar */}
                <div className="flex-1 flex items-center justify-start">
                  {!isNegative
                    ? <div className="h-2 bg-blue-500" style={{ width: `${widthPct}%` }} />
                    : <div style={{ width: `${widthPct}%` }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}