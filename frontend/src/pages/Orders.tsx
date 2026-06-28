// import { useState, useEffect } from "react";
// import { HiOutlineDownload, HiSearch } from "react-icons/hi";
// import { RiArrowUpSLine, RiArrowDownSLine } from "react-icons/ri";
// import { useDemoTradeStore } from "../store/useDemoTradeStore";

// const TABS = ["Orders", "GTT", "Baskets", "SIP", "Alerts"];

// function GTTComingSoon() {
//   return (
//     <div className="flex flex-col items-center justify-center py-12 text-[var(--text-on-dark-45)]">
//       <div className="text-center max-w-md">
//         <img src="/images/gtt.png" alt="GTT" className="w-56 md:w-64 mx-auto mb-6" />
//         <p className="text-sm text-gray-500 leading-6 mb-6">
//           You have not created any triggers.{" "}
//           <span className="text-blue-500 cursor-pointer hover:underline">Learn more</span>{" "}
//           about setting automatic stoploss and target orders for your holdings.
//         </p>
//         <button disabled className="bg-[#4184F3] text-white px-8 py-2.5 rounded font-medium opacity-80 cursor-not-allowed">
//           Create new GTT
//         </button>
//       </div>
//     </div>
//   );
// }

// function BasketsComingSoon() {
//   return (
//     <div className="flex flex-col items-center justify-center h-full py-6">
//       <div className="text-center">
//         <img src="/images/basket.svg" alt="Baskets" className="w-40 mx-auto mb-3" />
//         <p className="text-sm text-gray-500 mb-4">You haven't created any baskets.</p>
//         <button disabled className="bg-[#4184F3] text-white px-5 py-2 rounded text-sm font-medium opacity-80 cursor-not-allowed">
//           Create new basket
//         </button>
//       </div>
//     </div>
//   );
// }

// function SIPComingSoon() {
//   return (
//     <div className="flex flex-col items-center justify-center h-full py-6">
//       <div className="text-center">
//         <img src="/images/sip.svg" alt="sip" className="w-40 mx-auto mb-3" />
//         <p className="text-sm text-gray-500 mb-4">You haven't created any SIPs.</p>
//         <button disabled className="bg-[#4184F3] text-white px-5 py-2 rounded text-sm font-medium opacity-80 cursor-not-allowed">
//           Create new SIP
//         </button>
//       </div>
//     </div>
//   );
// }

// function AlertsComingSoon() {
//   return (
//     <div className="flex flex-col items-center justify-center h-full py-6">
//       <div className="text-center">
//         <img src="/images/alert.svg" alt="alerts" className="w-40 mx-auto mb-3" />
//         <p className="text-sm text-gray-500 mb-4">You haven't created any alerts.</p>
//         <button disabled className="bg-[#4184F3] text-white px-5 py-2 rounded text-sm font-medium opacity-80 cursor-not-allowed">
//           Create new alert
//         </button>
//       </div>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: "COMPLETE" | "OPEN" }) {
//   const map = {
//     COMPLETE: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
//     OPEN: { bg: "rgba(234,179,8,0.12)", color: "#eab308" },
//   };
//   const s = map[status];
//   return (
//     <span
//       className="px-2.5 py-[3px] rounded-sm text-[11px] font-bold tracking-wide border"
//       style={{ backgroundColor: s.bg, color: s.color, borderColor: `${s.color}33` }}
//     >
//       {status}
//     </span>
//   );
// }

// function TypeBadge({ type }: { type: "BUY" | "SELL" }) {
//   const isBuy = type === "BUY";
//   return (
//     <span
//       className="px-2.5 py-[2px] rounded-sm text-[11px] font-bold border"
//       style={{
//         backgroundColor: isBuy ? "rgba(59,130,246,0.12)" : "rgba(239,68,68,0.12)",
//         color: isBuy ? "#60a5fa" : "#f87171",
//         borderColor: isBuy ? "#3b82f633" : "#ef444433",
//       }}
//     >
//       {type}
//     </span>
//   );
// }

// function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
//   return (
//     <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border-overlay-15)] bg-[var(--bg-overlay-08)]">
//       <HiSearch className="text-[var(--text-on-dark-45)] text-sm shrink-0" />
//       <input
//         type="text"
//         placeholder="Search"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="bg-transparent border-none outline-none text-xs text-[var(--text-on-dark)] w-[120px]"
//       />
//     </div>
//   );
// }

// function SectionHeader({
//   title, count, collapsed, onToggle, searchVal, onSearch, extraActions
// }: {
//   title: string; count: number; collapsed: boolean; onToggle: () => void;
//   searchVal: string; onSearch: (v: string) => void; extraActions?: React.ReactNode;
// }) {
//   return (
//     <div className="flex items-center justify-between py-3.5 pb-2.5">
//       <button onClick={onToggle} className="flex items-center gap-2 bg-none border-none cursor-pointer text-[var(--text-on-dark)]">
//         <span className="text-base font-semibold">{title} ({count})</span>
//         {collapsed
//           ? <RiArrowDownSLine className="text-lg text-[var(--text-on-dark-55)]" />
//           : <RiArrowUpSLine className="text-lg text-[var(--text-on-dark-55)]" />
//         }
//       </button>
//       <div className="flex items-center gap-3">
//         <SearchBox value={searchVal} onChange={onSearch} />
//         {extraActions}
//         <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-[var(--color-accent)] text-xs font-medium">
//           <HiOutlineDownload size={14} /> Download
//         </button>
//       </div>
//     </div>
//   );
// }

// export default function Orders() {
//   const [activeTab, setActiveTab] = useState("Orders");
//   const [executedCollapsed, setExecutedCollapsed] = useState(false);
//   const [tradesCollapsed, setTradesCollapsed] = useState(false);
//   const [executedSearch, setExecutedSearch] = useState("");
//   const [tradesSearch, setTradesSearch] = useState("");

//   const { trades, loading, fetchTrades } = useDemoTradeStore();

//   useEffect(() => {
//     fetchTrades();
//     const interval = setInterval(() => fetchTrades(), 5000);
//     return () => clearInterval(interval);
//   }, []);

//   // ── CLOSED status → "Executed" section ───────────────────────────────────
//   const executedTrades = trades
//     .filter((t) => t.status === "CLOSED")
//     .filter((t) => t.symbol.toLowerCase().includes(executedSearch.toLowerCase()));

//   // ── OPEN status → "Trades" section ────────────────────────────────────────
//   const openTrades = trades
//     .filter((t) => t.status === "OPEN")
//     .filter((t) => t.symbol.toLowerCase().includes(tradesSearch.toLowerCase()));

//   if (loading && trades.length === 0) {
//     return (
//       <div className="bg-[var(--color-primary)] min-h-full rounded-2xl px-6 pb-6 text-[var(--text-on-dark)] flex items-center justify-center h-[400px]">
//         <div className="text-[var(--text-on-dark-55)]">Loading...</div>
//       </div>
//     );
//   }

//   const renderTradeRow = (trade: any) => (
//     <tr key={trade.id} className="transition-colors duration-100 hover:bg-[var(--bg-overlay-08)]">
//       <td className="px-3 py-3 text-[var(--text-on-dark-55)] text-xs border-b border-[var(--border-overlay-12)] whitespace-nowrap">
//         {new Date(trade.opened_at).toLocaleTimeString("en-IN")}
//       </td>
//       <td className="px-3 py-3 text-[13px] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
//         <TypeBadge type={trade.transaction_type} />
//       </td>
//       <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
//         <span>{trade.name}</span>
//         <span className="ml-1.5 text-[10px] font-semibold text-[var(--text-on-dark-45)] bg-[var(--bg-overlay-10)] px-1.5 py-0.5 rounded">
//           {trade.exchange}
//         </span>
//       </td>
//       <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
//         {trade.quantity}
//       </td>
//       <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
//         {trade.entry_price.toFixed(2)}
//       </td>
//       <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
//         {trade.exit_price ? trade.exit_price.toFixed(2) : "—"}
//       </td>
//       <td
//         className={`px-3 py-3 text-[13px] font-medium border-b border-[var(--border-overlay-12)] whitespace-nowrap ${
//           trade.pnl >= 0 ? "text-green-500" : "text-red-500"
//         }`}
//       >
//         {trade.status === "CLOSED" ? `${trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}` : "—"}
//       </td>
//       <td className="px-3 py-3 text-[13px] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
//         <StatusBadge status={trade.status === "OPEN" ? "OPEN" : "COMPLETE"} />
//       </td>
//     </tr>
//   );

//   const tableHeaders = ["Time", "Type", "Instrument", "Qty.", "Entry Price", "Exit Price", "P&L", "Status"];

//   const renderTable = (rows: any[]) => (
//     <div className="overflow-x-auto">
//       <table className="w-full border-collapse">
//         <thead>
//           <tr>
//             {tableHeaders.map((h) => (
//               <th key={h} className="px-3 py-2 text-[11px] font-semibold text-[var(--text-on-dark-45)] text-left border-b border-[var(--border-overlay-12)] whitespace-nowrap">
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.length === 0 ? (
//             <tr>
//               <td colSpan={tableHeaders.length} className="px-3 py-8 text-center text-[var(--text-on-dark-45)] text-[13px] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
//                 No data found
//               </td>
//             </tr>
//           ) : (
//             rows.map(renderTradeRow)
//           )}
//         </tbody>
//       </table>
//     </div>
//   );

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "Orders":
//         return (
//           <>
//             {/* ═══ Executed Section (CLOSED trades) ═══ */}
//             <SectionHeader
//               title="Executed"
//               count={executedTrades.length}
//               collapsed={executedCollapsed}
//               onToggle={() => setExecutedCollapsed((p) => !p)}
//               searchVal={executedSearch}
//               onSearch={setExecutedSearch}
//               extraActions={
//                 <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-[var(--color-accent)] text-xs font-medium">
//                   Contract note
//                 </button>
//               }
//             />

//             {!executedCollapsed && renderTable(executedTrades)}

//             {/* ═══ Trades Section (OPEN trades) ═══ */}
//             <div className="mt-6">
//               <SectionHeader
//                 title="Trades"
//                 count={openTrades.length}
//                 collapsed={tradesCollapsed}
//                 onToggle={() => setTradesCollapsed((p) => !p)}
//                 searchVal={tradesSearch}
//                 onSearch={setTradesSearch}
//               />

//               {!tradesCollapsed && renderTable(openTrades)}
//             </div>
//           </>
//         );
//       case "GTT":
//         return <GTTComingSoon />;
//       case "Baskets":
//         return <BasketsComingSoon />;
//       case "SIP":
//         return <SIPComingSoon />;
//       case "Alerts":
//         return <AlertsComingSoon />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="bg-[var(--color-primary)] min-h-full px-6 pb-6 text-[var(--text-on-dark)]">
//       <div className="flex items-center gap-0 border-b border-[var(--border-overlay-12)] mb-1">
//         {TABS.map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className="px-[18px] py-3.5 text-[13px] bg-none border-none cursor-pointer transition-all duration-150 -mb-px"
//             style={{
//               fontWeight: activeTab === tab ? 600 : 400,
//               color: activeTab === tab ? "var(--color-accent)" : "var(--text-on-dark-55)",
//               borderBottom: activeTab === tab ? "2px solid var(--color-accent)" : "2px solid transparent",
//             }}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {renderTabContent()}
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { HiOutlineDownload, HiSearch } from "react-icons/hi";
import { RiArrowUpSLine, RiArrowDownSLine } from "react-icons/ri";
import { useDemoTradeStore } from "../store/useDemoTradeStore";
import type { DemoOrder } from "../store/useDemoTradeStore";

const TABS = ["Orders", "GTT", "Baskets", "SIP", "Alerts"];

// ─── Coming Soon placeholders ──────────────────────────────────────────────────

function GTTComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-[var(--text-on-dark-45)]">
      <div className="text-center max-w-md">
        <img src="/images/gtt.png" alt="GTT" className="w-56 md:w-64 mx-auto mb-6" />
        <p className="text-sm text-gray-500 leading-6 mb-6">
          You have not created any triggers.{" "}
          <span className="text-blue-500 cursor-pointer hover:underline">Learn more</span>{" "}
          about setting automatic stoploss and target orders for your holdings.
        </p>
        <button disabled className="bg-[#4184F3] text-white px-8 py-2.5 rounded font-medium opacity-80 cursor-not-allowed">
          Create new GTT
        </button>
      </div>
    </div>
  );
}

function BasketsComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-6">
      <div className="text-center">
        <img src="/images/basket.svg" alt="Baskets" className="w-40 mx-auto mb-3" />
        <p className="text-sm text-gray-500 mb-4">You haven't created any baskets.</p>
        <button disabled className="bg-[#4184F3] text-white px-5 py-2 rounded text-sm font-medium opacity-80 cursor-not-allowed">
          Create new basket
        </button>
      </div>
    </div>
  );
}

function SIPComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-6">
      <div className="text-center">
        <img src="/images/sip.svg" alt="sip" className="w-40 mx-auto mb-3" />
        <p className="text-sm text-gray-500 mb-4">You haven't created any SIPs.</p>
        <button disabled className="bg-[#4184F3] text-white px-5 py-2 rounded text-sm font-medium opacity-80 cursor-not-allowed">
          Create new SIP
        </button>
      </div>
    </div>
  );
}

function AlertsComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-6">
      <div className="text-center">
        <img src="/images/alert.svg" alt="alerts" className="w-40 mx-auto mb-3" />
        <p className="text-sm text-gray-500 mb-4">You haven't created any alerts.</p>
        <button disabled className="bg-[#4184F3] text-white px-5 py-2 rounded text-sm font-medium opacity-80 cursor-not-allowed">
          Create new alert
        </button>
      </div>
    </div>
  );
}

// ─── Badges ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DemoOrder["status"] }) {
  const map: Record<DemoOrder["status"], { bg: string; color: string }> = {
    COMPLETE: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
    REJECTED: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
    CANCELLED: { bg: "rgba(156,163,175,0.12)", color: "#9ca3af" },
  };
  const s = map[status];
  return (
    <span
      className="px-2.5 py-[3px] rounded-sm text-[11px] font-bold tracking-wide border"
      style={{ backgroundColor: s.bg, color: s.color, borderColor: `${s.color}33` }}
    >
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: "BUY" | "SELL" }) {
  const isBuy = type === "BUY";
  return (
    <span
      className="px-2.5 py-[2px] rounded-sm text-[11px] font-bold border"
      style={{
        backgroundColor: isBuy ? "rgba(59,130,246,0.12)" : "rgba(239,68,68,0.12)",
        color: isBuy ? "#60a5fa" : "#f87171",
        borderColor: isBuy ? "#3b82f633" : "#ef444433",
      }}
    >
      {type}
    </span>
  );
}

function ProductBadge({ product }: { product: "MIS" | "NRML" }) {
  return (
    <span className="ml-1.5 text-[10px] font-semibold text-[var(--text-on-dark-45)] bg-[var(--bg-overlay-10)] px-1.5 py-0.5 rounded">
      {product}
    </span>
  );
}

// ─── Search + Section header ───────────────────────────────────────────────────

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border-overlay-15)] bg-[var(--bg-overlay-08)]">
      <HiSearch className="text-[var(--text-on-dark-45)] text-sm shrink-0" />
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-xs text-[var(--text-on-dark)] w-[120px]"
      />
    </div>
  );
}

function SectionHeader({
  title, count, collapsed, onToggle, searchVal, onSearch, extraActions,
}: {
  title: string; count: number; collapsed: boolean; onToggle: () => void;
  searchVal: string; onSearch: (v: string) => void; extraActions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 pb-2.5">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-none border-none cursor-pointer text-[var(--text-on-dark)]"
      >
        <span className="text-base font-semibold">{title} ({count})</span>
        {collapsed
          ? <RiArrowDownSLine className="text-lg text-[var(--text-on-dark-55)]" />
          : <RiArrowUpSLine className="text-lg text-[var(--text-on-dark-55)]" />}
      </button>
      <div className="flex items-center gap-3">
        <SearchBox value={searchVal} onChange={onSearch} />
        {extraActions}
        <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-[var(--color-accent)] text-xs font-medium">
          <HiOutlineDownload size={14} /> Download
        </button>
      </div>
    </div>
  );
}

// ─── Table ─────────────────────────────────────────────────────────────────────

// DemoOrder fields: id, symbol, name, exchange, token,
// transaction_type, quantity, product, order_type, validity,
// price, trigger_price, executed_price, status, created_at

const TABLE_HEADERS = ["Time", "Type", "Instrument", "Qty.", "Product", "Order Type", "Exec. Price", "Status"];

function OrderRow({ order }: { order: DemoOrder }) {
  return (
    <tr className="transition-colors duration-100 hover:bg-[var(--bg-overlay-08)]">
      {/* Time */}
      <td className="px-3 py-3 text-[var(--text-on-dark-55)] text-xs border-b border-[var(--border-overlay-12)] whitespace-nowrap">
        {new Date(order.createdAt).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </td>

      {/* BUY / SELL */}
      <td className="px-3 py-3 text-[13px] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
        <TypeBadge type={order.transaction_type} />
      </td>

      {/* Instrument name + exchange */}
      <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
        <span>{order.name}</span>
        <span className="ml-1.5 text-[10px] font-semibold text-[var(--text-on-dark-45)] bg-[var(--bg-overlay-10)] px-1.5 py-0.5 rounded">
          {order.exchange}
        </span>
      </td>

      {/* Quantity */}
      <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
        {order.quantity}
      </td>

      {/* Product — MIS / NRML */}
      <td className="px-3 py-3 text-[13px] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
        <ProductBadge product={order.product} />
      </td>

      {/* Order type — MARKET / LIMIT / SL / SL-M */}
      <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-55)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
        {order.order_type}
      </td>

      {/* Executed price — actual LTP at execution */}
      <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
        ₹{order.executed_price.toFixed(2)}
      </td>

      {/* Status */}
      <td className="px-3 py-3 text-[13px] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
        <StatusBadge status={order.status} />
      </td>
    </tr>
  );
}

function OrdersTable({ rows }: { rows: DemoOrder[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {TABLE_HEADERS.map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-[11px] font-semibold text-[var(--text-on-dark-45)] text-left border-b border-[var(--border-overlay-12)] whitespace-nowrap"
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
                colSpan={TABLE_HEADERS.length}
                className="px-3 py-8 text-center text-[var(--text-on-dark-45)] text-[13px] border-b border-[var(--border-overlay-12)]"
              >
                No orders found
              </td>
            </tr>
          ) : (
            rows.map((order) => <OrderRow key={order.id} order={order} />)
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Orders() {
  const [activeTab, setActiveTab] = useState("Orders");
  const [executedCollapsed, setExecutedCollapsed] = useState(false);
  const [rejectedCollapsed, setRejectedCollapsed] = useState(true);
  const [executedSearch, setExecutedSearch] = useState("");
  const [rejectedSearch, setRejectedSearch] = useState("");

  // ── CHANGE: fetchTrades → fetchOrders, trades → orders ───────────────────
  const { orders, loading, fetchOrders } = useDemoTradeStore();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 5000);
    return () => clearInterval(interval);
  }, []);

  // ── CHANGE: status filter — DemoOrder uses "COMPLETE" not "CLOSED" ────────
  const executedOrders = orders
    .filter((o) => o.status === "COMPLETE")
    .filter((o) => o.name.toLowerCase().includes(executedSearch.toLowerCase()));

  const rejectedOrders = orders
    .filter((o) => o.status === "REJECTED" || o.status === "CANCELLED")
    .filter((o) => o.name.toLowerCase().includes(rejectedSearch.toLowerCase()));

  if (loading && orders.length === 0) {
    return (
      <div className="bg-[var(--color-primary)] min-h-full rounded-2xl px-6 pb-6 text-[var(--text-on-dark)] flex items-center justify-center h-[400px]">
        <div className="text-[var(--text-on-dark-55)]">Loading...</div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Orders":
        return (
          <>
            {/* ── Executed orders (COMPLETE) ── */}
            <SectionHeader
              title="Executed"
              count={executedOrders.length}
              collapsed={executedCollapsed}
              onToggle={() => setExecutedCollapsed((p) => !p)}
              searchVal={executedSearch}
              onSearch={setExecutedSearch}
              extraActions={
                <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-[var(--color-accent)] text-xs font-medium">
                  Contract note
                </button>
              }
            />
            {!executedCollapsed && <OrdersTable rows={executedOrders} />}

            {/* ── Rejected / Cancelled orders ── */}
            {rejectedOrders.length > 0 && (
              <div className="mt-6">
                <SectionHeader
                  title="Rejected"
                  count={rejectedOrders.length}
                  collapsed={rejectedCollapsed}
                  onToggle={() => setRejectedCollapsed((p) => !p)}
                  searchVal={rejectedSearch}
                  onSearch={setRejectedSearch}
                />
                {!rejectedCollapsed && <OrdersTable rows={rejectedOrders} />}
              </div>
            )}
          </>
        );
      case "GTT": return <GTTComingSoon />;
      case "Baskets": return <BasketsComingSoon />;
      case "SIP": return <SIPComingSoon />;
      case "Alerts": return <AlertsComingSoon />;
      default: return null;
    }
  };

  return (
    <div className="bg-[var(--color-primary)] min-h-full px-6 pb-6 text-[var(--text-on-dark)]">
      {/* ── Tab bar ── */}
      <div className="flex items-center gap-0 border-b border-[var(--border-overlay-12)] mb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-[18px] py-3.5 text-[13px] bg-none border-none cursor-pointer transition-all duration-150 -mb-px"
            style={{
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "var(--color-accent)" : "var(--text-on-dark-55)",
              borderBottom: activeTab === tab ? "2px solid var(--color-accent)" : "2px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}