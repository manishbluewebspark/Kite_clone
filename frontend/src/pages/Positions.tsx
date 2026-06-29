
// import { useState, useEffect } from "react";
// import { HiOutlineDownload, HiSearch } from "react-icons/hi";
// import { RiArrowUpSLine, RiArrowDownSLine, RiSoundModuleFill } from "react-icons/ri";
// import { useDemoTradeStore } from "../store/useDemoTradeInterface";
// import ExitConfirmModal from "../components/modal/ExitConfirmModal";
// import { RowContextMenu } from "../components/modal/RowContextMenu";

// function formatNumber(n: number) {
//   return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// }

// /** Returns true only if the trade belongs to today (compares local date) */
// function isTodayTrade(t: any): boolean {
//   const dateStr: string | undefined = t.createdAt ?? t.opened_at ?? t.created_at;
//   if (!dateStr) return true;
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
//   validity: string;
//   type: string;
//   price: string;
//   transaction_type: string;
//   isClosed?: boolean; // flag to distinguish closed rows in positions table
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

//   // For checkbox table: only open rows (isClosed === false/undefined) are selectable
//   const openRows = rows.filter((r) => !r.isClosed);

//   const allOpenSelected =
//     openRows.length > 0 && selected !== undefined && openRows.every((_, i) => {
//       const globalIdx = rows.findIndex((r) => r === openRows[i]);
//       return selected.has(globalIdx);
//     });

//   return (
//     <div className="relative overflow-x-auto">
//       <table className="w-full border-collapse">
//         <thead>
//           <tr>
//             {showCheckbox && (
//               <th className="px-3 py-2 border-b border-gray-100 w-8">
//                 <input
//                   type="checkbox"
//                   checked={allOpenSelected}
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
//             rows.map((pos, i) => {
//               const isClosed = pos.isClosed === true;

//               return (
//                 <tr
//                   key={pos.id}
//                   className={`group transition-colors duration-100 hover:bg-gray-50 ${isClosed ? "opacity-80" : ""}`}
//                 >
//                   {showCheckbox && (
//                     <td className="px-3 py-3 border-b border-gray-100">
//                       <input
//                         type="checkbox"
//                         checked={isClosed ? false : (selected?.has(i) ?? false)}
//                         onChange={() => !isClosed && onToggleRow?.(i)}
//                         disabled={isClosed}
//                         className={isClosed ? "cursor-not-allowed opacity-80" : "cursor-pointer"}
//                       />
//                     </td>
//                   )}

//                   {/* Product */}
//                   <td className="px-3 py-3 border-b border-gray-100 whitespace-nowrap">
//                     <div className="flex items-center gap-1.5">
//                       <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
//                         {pos.product}
//                       </span>
//                     </div>
//                   </td>

//                   {/* Instrument */}
//                   <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap">
//                     {pos.instrument}{" "}
//                     <span className="text-[10px] text-gray-400 px-1.5 py-0.5 rounded">
//                       {pos.exchange}
//                     </span>
//                   </td>

//                   {/* Qty */}
//                   <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
//                     {pos.netQty}
//                   </td>

//                   {/* Avg */}
//                   <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
//                     {pos.avg.toFixed(2)}
//                   </td>

//                   {/* LTP */}
//                   <td className="px-3 py-3 text-[13px] text-gray-400 border-b border-gray-100 whitespace-nowrap text-right">
//                     {formatNumber(pos.ltp)}
//                   </td>

//                   {/* P&L — neutral gray for closed rows */}
//                   <td
//                     className={`px-3 py-3 text-[13px] font-medium border-b bg-gray-50 border-gray-100 whitespace-nowrap text-right
//                       ${isClosed
//                         ? "text-gray-400"
//                         : pos.pnl > 0
//                           ? "text-green-600"
//                           : pos.pnl < 0
//                             ? "text-red-600"
//                             : "text-gray-400"
//                       }`}
//                   >
//                     {pos.pnl >= 0 ? "+" : ""}{formatNumber(pos.pnl)}
//                   </td>

//                   {/* Chg — neutral gray for closed rows */}
//                   <td
//                     className={`px-3 py-3 text-[13px] border-b border-gray-100 whitespace-nowrap text-right
//                       ${isClosed
//                         ? "text-gray-400"
//                         : pos.pnl > 0
//                           ? "text-green-600"
//                           : pos.pnl < 0
//                             ? "text-red-600"
//                             : "text-gray-400"
//                       }`}
//                   >
//                     {pos.chg.toFixed(2)}%
//                   </td>

//                   {/* Context menu — only for open rows */}
//                   {showCheckbox && (
//                     <td className="border-b border-gray-100 whitespace-nowrap p-0">
//                       {!isClosed && (
//                         <div className="flex items-stretch h-full">
//                           <RowContextMenu />
//                         </div>
//                       )}
//                     </td>
//                   )}
//                 </tr>
//               );
//             })
//           )}
//         </tbody>
//         {rows.length > 0 && (
//           <tfoot>
//             <tr>
//               {showCheckbox && <td className="px-3 py-3 w-8" />}
//               <td colSpan={4} className="px-3 py-3">
//                 {showCheckbox && selected && selected.size > 0 && onBulkExit && (
//                   <div className="absolute left-3 bottom-3">
//                     <button
//                       onClick={onBulkExit}
//                       className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium rounded-xs transition-colors whitespace-nowrap shadow-md"
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

//   // const toDisplayRow = (t: any, isClosed = false): DisplayRow => {
//   //   const liveLtp = liveQuotes[t.token]?.ltp ?? t.entry_price;
//   //   const pnl =
//   //     t.status === "CLOSED"
//   //       ? t.pnl
//   //       : t.transaction_type === "BUY"
//   //         ? (liveLtp - t.entry_price) * t.quantity
//   //         : (t.entry_price - liveLtp) * t.quantity;
//   //   const chg = t.entry_price > 0 ? ((liveLtp - t.entry_price) / t.entry_price) * 100 : 0;
//   //   return {
//   //     id: t.id,
//   //     product: t.product,
//   //     instrument: t.name,
//   //     exchange: t.exchange,
//   //     netQty: t.transaction_type === "BUY" ? t.quantity : -t.quantity,
//   //     avg: t.entry_price,
//   //     // ltp: t.status === "CLOSED" ? t.exit_price ?? liveLtp : liveLtp,
//   //     ltp: liveLtp,
//   //     pnl,
//   //     chg,
//   //     validity: t.validity,
//   //     type: t.order_type,
//   //     price: t.price,
//   //     transaction_type: t.transaction_type,
//   //     isClosed,
//   //   };
//   // };


//   const toDisplayRow = (t: any, isClosed = false): DisplayRow => {
//     const liveLtp = liveQuotes[t.token]?.ltp ?? t.entry_price;

//     // Qty 0 = squared off (Kite jaisa — grey dikhe)
//     const isSquaredOff = t.quantity === 0;

//     const pnl =
//       isSquaredOff || t.status === "CLOSED"
//         ? t.pnl  // final P&L
//         : t.transaction_type === "BUY"
//           ? (liveLtp - t.entry_price) * t.quantity
//           : (t.entry_price - liveLtp) * t.quantity;

//     const chg = t.entry_price > 0
//       ? ((liveLtp - t.entry_price) / t.entry_price) * 100
//       : 0;

//     return {
//       id: t.id,
//       product: t.product ?? t.transaction_type,
//       instrument: t.name,
//       exchange: t.exchange,
//       netQty: isSquaredOff
//         ? 0  // ⬅️ Qty 0 dikhao
//         : t.transaction_type === "BUY" ? t.quantity : -t.quantity,
//       avg: isSquaredOff ? 0 : t.entry_price, // ⬅️ Avg 0 jab squared off
//       ltp: liveLtp,
//       pnl,
//       chg,
//       validity: t.validity ?? "DAY",
//       type: t.order_type ?? "MARKET",
//       price: t.price ?? "0",
//       transaction_type: t.transaction_type,
//       isClosed: isSquaredOff || isClosed, // ⬅️ Grey row dikhao
//     };
//   };


//   const toBreakdownRow = (t: any): DisplayRow => {
//     return {
//       id: t.id,
//       product: t.product ?? t.transaction_type,
//       instrument: t.name,
//       exchange: t.exchange,
//       netQty: t.transaction_type === "BUY" ? t.quantity : -t.quantity,
//       avg: t.entry_price,
//       ltp: t.exit_price ?? t.entry_price, // final exit price
//       pnl: t.pnl,                          // DB stored final P&L — no live calculation
//       chg: t.entry_price > 0
//         ? (((t.exit_price ?? t.entry_price) - t.entry_price) / t.entry_price) * 100
//         : 0,
//       validity: t.validity ?? "DAY",
//       type: t.order_type ?? "MARKET",
//       price: t.price ?? "0",
//       transaction_type: t.transaction_type,
//       isClosed: true,
//     };
//   };



//   // Positions table = open rows first, then closed rows (neutral, no checkbox)
//   const filteredOpenPositions = openTrades
//     .map((t) => toDisplayRow(t, false))
//     .filter((p) => p.instrument.toLowerCase().includes(positionSearch.toLowerCase()));

//   const filteredClosedInPositions = closedTrades
//     .map((t) => toDisplayRow(t, true))
//     .filter((p) => p.instrument.toLowerCase().includes(positionSearch.toLowerCase()));

//   // Combined rows for the Positions table: open first, closed appended below
//   const allPositionRows = [...filteredOpenPositions, ...filteredClosedInPositions];

//   // Day's History table = closed trades only (same as before)
//   const filteredHistory = closedTrades
//     .map((t) => toDisplayRow(t, false))
//     .filter((p) => p.instrument.toLowerCase().includes(historySearch.toLowerCase()));

//   // P&L totals — only count open trades in positions total
//   const positionsTotalPnl = filteredOpenPositions.reduce((sum, p) => sum + p.pnl, 0);
//   const historyTotalPnl = filteredHistory.reduce((sum, p) => sum + p.pnl, 0);

//   // Breakdown = today open + closed, sorted by abs pnl
//   const breakdown = closedTrades
//     .map(toBreakdownRow)
//     .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));

//   const maxAbsPnl = breakdown.length > 0
//     ? Math.max(...breakdown.map((p) => Math.abs(p.pnl)), 1)
//     : 1;

//   // Checkbox logic: only open rows (indices 0..filteredOpenPositions.length-1) are selectable
//   const toggleRow = (i: number) => {
//     // Only allow toggling open rows
//     if (i >= filteredOpenPositions.length) return;
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(i) ? next.delete(i) : next.add(i);
//       return next;
//     });
//   };

//   const toggleAll = () => {
//     const openIndices = filteredOpenPositions.map((_, i) => i);
//     const allSelected = openIndices.every((i) => selected.has(i));
//     if (allSelected) {
//       setSelected(new Set());
//     } else {
//       setSelected(new Set(openIndices));
//     }
//   };

//   const handleBulkExit = () => {
//     setModalPositions(filteredOpenPositions.filter((_, i) => selected.has(i)));
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
//       <div className="min-h-full px-6 pb-6 text-gray-800 flex items-center justify-center h-100">
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

//       {/* Positions — open rows + closed rows (neutral) */}
//       <PositionsHeader
//         title="Positions"
//         count={allPositionRows.length}
//         collapsed={positionsCollapsed}
//         onToggle={() => setPositionsCollapsed((p) => !p)}
//         searchVal={positionSearch}
//         onSearch={setPositionSearch}
//       />
//       {!positionsCollapsed && (
//         <PositionsTable
//           rows={allPositionRows}
//           totalPnl={positionsTotalPnl}
//           showCheckbox
//           selected={selected}
//           onToggleRow={toggleRow}
//           onToggleAll={toggleAll}
//           onSingleExit={handleSingleExit}
//           onBulkExit={handleBulkExit}
//         />
//       )}

//       {/* Day's History — closed trades */}
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


//       {/* Breakdown — Kite style: buy/sell volume ratio bars */}
//       <div className="mt-8">
//         <h2 className="text-base text-gray-800 pb-2 border-b border-gray-100 font-medium">
//           Breakdown
//         </h2>

//         {breakdown.length === 0 ? (
//           <p className="text-[13px] text-gray-400 mt-4 text-center py-6">
//             Close a position to see breakdown
//           </p>
//         ) : (
//           <div className="mt-3">
//             {/* Table header */}
//             {/* <div className="grid grid-cols-[1fr_200px_1fr] text-[11px] text-gray-400 pb-2 border-b border-gray-100 mb-1">
//               <div className="text-right pr-3">Sell</div>
//               <div className="text-center">Instrument</div>
//               <div className="text-left pl-3">Buy</div>
//             </div> */}

//             <div className="space-y-3 mt-3">
//               {breakdown.map((pos) => {
//                 // Buy/Sell qty ratio calculate karo
//                 // Transaction type se determine karo
//                 const isBuy = pos.transaction_type === "BUY";
//                 const qty = Math.abs(pos.netQty);

//                 // Total volume = qty (since demo trades me ek hi side hoti hai abhi)
//                 // Blue = BUY side, Orange = SELL side
//                 // Jab BUY trade close hota hai → entry BUY tha, exit SELL tha
//                 // So closed BUY trade = 50% blue (entry) + 50% orange (exit)
//                 // Abhi ke liye: OPEN trades me sirf ek side, CLOSED me dono

//                 const buyPct = isBuy ? 50 : 0;   // BUY trade = 50% blue (entry side)
//                 const sellPct = isBuy ? 50 : 100; // SELL trade ya closed = orange side

//                 return (
//                   <div key={pos.id}>
//                     <div className="grid grid-cols-[1fr_200px_1fr] items-center">
//                       {/* Left — Orange (Sell) bar */}
//                       <div className="flex justify-end pr-1">
//                         {sellPct > 0 && (
//                           <div
//                             className="h-3 bg-orange-400 rounded-l-sm"
//                             style={{ width: `${sellPct * 0.9}%` }}
//                           />
//                         )}
//                       </div>

//                       {/* Center — Instrument name */}
//                       <div className="text-center px-2">
//                         <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap">
//                           {pos.instrument}
//                         </span>
//                         <span className="text-[10px] text-gray-400 ml-1">
//                           ({pos.product})
//                         </span>
//                       </div>

//                       {/* Right — Blue (Buy) bar */}
//                       <div className="flex justify-start pl-1">
//                         {buyPct > 0 && (
//                           <div
//                             className="h-3 bg-blue-500 rounded-r-sm"
//                             style={{ width: `${buyPct * 0.9}%` }}
//                           />
//                         )}
//                       </div>
//                     </div>

//                     {/* P&L below bar */}
//                     {/* <div className="grid grid-cols-[1fr_200px_1fr] mt-0.5">
//                       <div />
//                       <div className="text-center">
//                         <span className={`text-[11px] font-medium ${pos.pnl >= 0 ? "text-green-600" : "text-red-500"}`}>
//                           {pos.pnl >= 0 ? "+" : ""}₹{formatNumber(pos.pnl)}
//                         </span>
//                       </div>
//                       <div />
//                     </div> */}
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Total Realised P&L */}
//             {/* <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
//               <span className="text-[13px] text-gray-500 font-medium">Realised P&L</span>
//               <span className={`text-[13px] font-semibold ${historyTotalPnl >= 0 ? "text-green-600" : "text-red-500"}`}>
//                 {historyTotalPnl >= 0 ? "+" : ""}₹{formatNumber(historyTotalPnl)}
//               </span>
//             </div> */}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { HiOutlineDownload, HiSearch } from "react-icons/hi";
import { RiArrowUpSLine, RiArrowDownSLine, RiSoundModuleFill } from "react-icons/ri";
import { useDemoTradeStore } from "../store/useDemoTradeStore";
import type { DemoPosition } from "../store/useDemoTradeStore";
import ExitConfirmModal from "../components/modal/ExitConfirmModal";
import { RowContextMenu } from "../components/modal/RowContextMenu";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatNumber(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Returns true only if the position was created today */
function isTodayPosition(p: DemoPosition): boolean {
  const dateStr = p.created_at;
  if (!dateStr) return true;
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

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
        <line
          x1="2" y1="9" x2="62" y2="9"
          stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 3"
        />
      </svg>
      <p className="text-[15px] text-gray-400 mb-5">You don't have any position yet</p>
      <button className="px-4 py-2 bg-blue-500 text-white rounded-sm text-sm">
        Get started
      </button>
    </div>
  );
}

// ─── Search Box ────────────────────────────────────────────────────────────────

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
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
  title,
  count,
  searchVal,
  onSearch,
}: {
  title: string;
  count: number;
  searchVal: string;
  onSearch: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 pb-2.5">
      <span className="text-base font-medium text-gray-800">
        {title} ({count})
      </span>
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
  title,
  count,
  collapsed,
  onToggle,
  searchVal,
  onSearch,
  hideAll = false,
}: {
  title: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  searchVal: string;
  onSearch: (v: string) => void;
  hideAll?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 pb-2.5">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-none border-none cursor-pointer text-gray-800"
      >
        <span className="text-base font-medium">
          {title} {!hideAll && `(${count})`}
        </span>
        {collapsed ? (
          <RiArrowDownSLine className="text-lg text-gray-400" />
        ) : (
          <RiArrowUpSLine className="text-lg text-gray-400" />
        )}
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

// ─── Display Row Interface ─────────────────────────────────────────────────────

export interface DisplayRow {
  id: number;
  product: string;
  instrument: string;
  exchange: string;
  netQty: number;
  avg: number;
  ltp: number;
  realisedPnl: number;
  unrealisedPnl: number;
  totalPnl: number;
  chg: number;
  transaction_type: string;
  token: string;
  isClosed: boolean;
  _position: DemoPosition;
  price: number;
  type: string;
  validity: string;
}

// ─── Positions Table ───────────────────────────────────────────────────────────

function PositionsTable({
  rows,
  totalPnl,
  showCheckbox,
  selected,
  onToggleRow,
  onToggleAll,
  onSingleExit,
  onBulkExit,
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
  const cols = ["Product", "Instrument", "Qty.", "Avg.", "LTP", "P&L", "Chg."];
  const openRows = rows.filter((r) => !r.isClosed);

  const allOpenSelected =
    openRows.length > 0 &&
    selected !== undefined &&
    openRows.every((r) => {
      const idx = rows.indexOf(r);
      return selected.has(idx);
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
            {showCheckbox && <th className="border-b border-gray-100 w-8" />}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={cols.length + (showCheckbox ? 2 : 0)}
                className="px-3 py-8 text-center text-gray-400 text-[13px] border-b border-gray-100"
              >
                No data found
              </td>
            </tr>
          ) : (
            rows.map((pos, i) => {
              const isClosed = pos.isClosed;
              const isChecked = !isClosed && (selected?.has(i) ?? false);

              return (
                <tr
                  key={pos.id}
                  className={`group transition-colors duration-100 hover:bg-gray-50 ${isClosed ? "opacity-70" : ""
                    }`}
                >
                  {/* Checkbox */}
                  {showCheckbox && (
                    <td className="px-3 py-3 border-b border-gray-100">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => !isClosed && onToggleRow?.(i)}
                        disabled={isClosed}
                        className={isClosed ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                      />
                    </td>
                  )}

                  {/* Product */}
                  <td className="px-3 py-3 border-b border-gray-100 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {pos.product}
                    </span>
                  </td>

                  {/* Instrument */}
                  <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-gray-100 whitespace-nowrap">
                    {pos.instrument}{" "}
                    <span className="text-[10px] text-gray-400 px-1 py-0.5 rounded">
                      {pos.exchange}
                    </span>
                  </td>

                  {/* Qty — show direction with color */}
                  <td
                    className={`px-3 py-3 text-[13px] border-b border-gray-100 whitespace-nowrap text-right font-medium
    ${isClosed
                        ? "text-gray-400"
                        : pos.netQty > 0
                          ? "text-blue-600"
                          : pos.netQty < 0
                            ? "text-orange-500"
                            : "text-gray-400"
                      }`}
                  >
                    {Math.abs(pos.netQty)}
                  </td>

                  {/* Avg */}
                  <td className="px-3 py-3 text-[13px] text-gray-500 border-b border-gray-100 whitespace-nowrap text-right">
                    {pos.avg > 0 ? pos.avg.toFixed(2) : "0.00"}
                  </td>

                  {/* LTP */}
                  <td className="px-3 py-3 text-[13px] text-gray-500 border-b border-gray-100 whitespace-nowrap text-right">
                    {formatNumber(pos.ltp)}
                  </td>

                  {/* P&L */}
                  <td
                    className={`px-3 py-3 text-[13px] font-medium border-b bg-gray-50 border-gray-100 whitespace-nowrap text-right
                      ${isClosed
                        ? "text-gray-400"
                        : pos.totalPnl > 0
                          ? "text-green-600"
                          : pos.totalPnl < 0
                            ? "text-red-500"
                            : "text-gray-400"
                      }`}
                  >
                    <div className="flex flex-col items-end">
                      <span>
                        {pos.totalPnl >= 0 ? "+" : ""}
                        {formatNumber(pos.totalPnl)}
                      </span>
                      {/* Realised P&L — sirf tab dikhao jab kuch realised bhi ho aur position abhi open ho */}
                      {/* {!isClosed && pos.realisedPnl !== 0 && (
                        <span className="text-[10px] text-gray-400 font-normal">
                          R: {pos.realisedPnl >= 0 ? "+" : ""}
                          {formatNumber(pos.realisedPnl)}
                        </span>
                      )} */}
                    </div>
                  </td>

                  {/* Chg % */}
                  <td
                    className={`px-3 py-3 text-[13px] border-b border-gray-100 whitespace-nowrap text-right
                      ${isClosed
                        ? "text-gray-400"
                        : pos.totalPnl > 0
                          ? "text-green-600"
                          : pos.totalPnl < 0
                            ? "text-red-500"
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
                          <RowContextMenu
                            onExit={() => onSingleExit?.(pos)}
                          />
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
              <td colSpan={4} className="px-3 py-3 relative">
                {showCheckbox && selected && selected.size > 0 && onBulkExit && (
                  <button
                    onClick={onBulkExit}
                    className="absolute -left-6 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium rounded transition-colors whitespace-nowrap shadow"
                  >
                    Exit {selected.size} Position{selected.size > 1 ? "s" : ""}
                  </button>
                )}
              </td>
              <td className="px-3 py-3 text-[13px] text-gray-600 text-right whitespace-nowrap font-medium">
                Total P&L
              </td>
              <td
                className={`px-3 py-3 text-[13px] text-right whitespace-nowrap font-medium ${totalPnl >= 0 ? "text-green-600" : "text-red-500"
                  }`}
              >
                {totalPnl >= 0 ? "+" : ""}
                {formatNumber(totalPnl)}
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
  const {
    positions,
    liveQuotes,
    loading,
    fetchAll,
    fetchPositions,
    initLiveQuoteListener,
    placeOrder,
  } = useDemoTradeStore();

  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  const [positionSearch, setPositionSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [modalPositions, setModalPositions] = useState<DisplayRow[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    fetchAll();
    initLiveQuoteListener();
    // Poll positions every 10s for P&L refresh
    const interval = setInterval(() => fetchPositions(), 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Filter: only today's positions ────────────────────────────────────────

  const todayPositions = positions.filter(isTodayPosition);
  const openPositions = todayPositions.filter((p) => p.status === "OPEN");
  const closedPositions = todayPositions.filter((p) => p.status === "CLOSED");

  // ── Convert DemoPosition → DisplayRow ────────────────────────────────────

  const toDisplayRow = (p: DemoPosition, forceClose = false): DisplayRow => {
    const liveLtp = liveQuotes[p.token]?.ltp ?? p.last_price ?? p.average_price;
    const isFlat = p.quantity === 0 || p.status === "CLOSED" || forceClose;

    // Unrealised P&L — live calculate from LTP
    let unrealisedPnl = 0;
    if (!isFlat && p.average_price > 0) {
      unrealisedPnl =
        p.quantity > 0
          ? (liveLtp - p.average_price) * p.quantity
          : (p.average_price - liveLtp) * Math.abs(p.quantity);
    }

    const realisedPnl = p.realised_pnl ?? 0;
    const totalPnl = isFlat ? realisedPnl : realisedPnl + unrealisedPnl;

    const chg = isFlat
      ? 0
      : liveQuotes[p.token]?.changePct       // socket se live % change
      ?? (p.average_price > 0
        ? ((liveLtp - p.average_price) / p.average_price) * 100
        : 0);

    return {
      id: p.id,
      product: p.product,
      instrument: p.name,
      exchange: p.exchange,
      token: p.token,
      netQty: isFlat ? 0 : p.quantity,       // already net (pos/neg/0)
      avg: isFlat ? 0 : p.average_price,
      ltp: liveLtp,
      realisedPnl,
      unrealisedPnl,
      totalPnl,
      chg,
      transaction_type: p.transaction_type ?? "BUY",
      isClosed: isFlat,
      _position: p,
      price: liveLtp,
      type: "MARKET",
      validity: "DAY",
    };
  };

  // ── Positions table rows: open first, then closed (greyed out) ───────────

  const filteredOpenRows = openPositions
    .map((p) => toDisplayRow(p, false))
    .filter((r) => r.instrument.toLowerCase().includes(positionSearch.toLowerCase()));

  const filteredClosedInPositions = closedPositions
    .map((p) => toDisplayRow(p, true))
    .filter((r) => r.instrument.toLowerCase().includes(positionSearch.toLowerCase()));

  const allPositionRows = [...filteredOpenRows, ...filteredClosedInPositions];

  // ── Day's history: closed positions ──────────────────────────────────────

  const filteredHistory = closedPositions
    .map((p) => toDisplayRow(p, true))
    .filter((r) => r.instrument.toLowerCase().includes(historySearch.toLowerCase()));

  // ── P&L totals ────────────────────────────────────────────────────────────

  // Positions total = sum of ALL rows (open + closed) for today
  const positionsTotalPnl = allPositionRows.reduce((sum, r) => sum + r.totalPnl, 0);
  // History total = sum of final realised P&L of closed positions
  const historyTotalPnl = filteredHistory.reduce((sum, r) => sum + r.realisedPnl, 0);

  // ── Breakdown rows ────────────────────────────────────────────────────────

  const breakdown = closedPositions
    .map((p) => toDisplayRow(p, true))
    .sort((a, b) => Math.abs(b.realisedPnl) - Math.abs(a.realisedPnl));

  // ── Checkbox logic: only open rows are selectable ─────────────────────────

  const toggleRow = (i: number) => {
    if (i >= filteredOpenRows.length) return; // closed rows not selectable
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleAll = () => {
    const openIndices = filteredOpenRows.map((_, i) => i);
    const allSelected = openIndices.every((i) => selected.has(i));
    setSelected(allSelected ? new Set() : new Set(openIndices));
  };

  // ── Exit handlers ─────────────────────────────────────────────────────────

  const handleBulkExit = () => {
    const toExit = filteredOpenRows.filter((_, i) => selected.has(i));
    setModalPositions(toExit);
    setShowModal(true);
  };

  const handleSingleExit = (row: DisplayRow) => {
    setModalPositions([row]);
    setShowModal(true);
  };

  // Exit = place opposite side order for remaining qty
  const handleModalConfirm = async () => {
    setExiting(true);
    try {
      for (const row of modalPositions) {
        const pos = row._position;
        if (pos.quantity === 0) continue;

        await placeOrder({
          symbol: pos.symbol,
          name: pos.name,
          exchange: pos.exchange,
          token: pos.token,
          // Opposite direction = exit
          transaction_type: pos.transaction_type === "BUY" ? "SELL" : "BUY",
          quantity: Math.abs(pos.quantity),
          product: pos.product,
          order_type: "MARKET",
        });
      }
      await fetchPositions();
    } finally {
      setExiting(false);
      setShowModal(false);
      setModalPositions([]);
      setSelected(new Set());
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setModalPositions([]);
  };

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading && positions.length === 0) {
    return (
      <div className="min-h-full flex items-center justify-center h-100 bg-white">
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  // ── No trades today ───────────────────────────────────────────────────────

  if (todayPositions.length === 0) {
    return <NoPositionsPage />;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full px-6 pb-6 text-gray-800 text-[13px] bg-white">
      {showModal && (
        <ExitConfirmModal
          positions={modalPositions}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
          loading={exiting}
        />
      )}

      {/* ── Positions Table ───────────────────────────────────────────────── */}
      <PositionsHeader
        title="Positions"
        count={allPositionRows.length}
        searchVal={positionSearch}
        onSearch={setPositionSearch}
      />
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

      {/* ── Day's History ─────────────────────────────────────────────────── */}
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

      {/* ── Breakdown ─────────────────────────────────────────────────────── */}
      <div className="mt-8">
        <h2 className="text-base text-gray-800 pb-2 border-b border-gray-100 font-medium">
          Breakdown
        </h2>

        {breakdown.length === 0 ? (
          <p className="text-[13px] text-gray-400 mt-4 text-center py-6">
            Close a position to see breakdown
          </p>
        ) : (
          <div className="space-y-3 mt-3">
            {breakdown.map((pos) => {
              // Buy/sell bar ratio based on buy_qty vs sell_qty from raw position
              const raw = pos._position;
              const totalVolume = raw.buy_quantity + raw.sell_quantity;
              const buyPct =
                totalVolume > 0 ? (raw.buy_quantity / totalVolume) * 100 : 0;
              const sellPct =
                totalVolume > 0 ? (raw.sell_quantity / totalVolume) * 100 : 0;

              return (
                <div key={pos.id}>
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
            })}

            {/* Total Realised P&L */}
            {/* <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
              <span className="text-[13px] text-gray-500 font-medium">
                Realised P&L
              </span>
              <span
                className={`text-[13px] font-semibold ${historyTotalPnl >= 0 ? "text-green-600" : "text-red-500"
                  }`}
              >
                {historyTotalPnl >= 0 ? "+" : ""}₹{formatNumber(historyTotalPnl)}
              </span>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}