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
}

interface Trade {
  tradeId: string;
  fillTime: string;
  type: "BUY" | "SELL";
  instrument: string;
  exchange: string;
  product: string;
  qty: number;
  avgPrice: number;
  orderStatus: string;
}

const TABS = ["Orders", "GTT", "Baskets", "SIP", "Alerts"];

// Returns today's date as YYYY-MM-DD
function getTodayDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ── Coming Soon Components ──
function GTTComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-[var(--text-on-dark-45)]">
      <div className="text-center max-w-md">
        <img
          src="/images/gtt.png"
          alt="GTT"
          className="w-56 md:w-64 mx-auto mb-6"
        />

        <p className="text-sm text-gray-500 leading-6 mb-6">
          You have not created any triggers.{" "}
          <span className="text-blue-500 cursor-pointer hover:underline">
            Learn more
          </span>{" "}
          about setting automatic stoploss and target orders for your
          holdings.
        </p>

        <button
          disabled
          className="bg-[#4184F3] text-white px-8 py-2.5 rounded font-medium opacity-80 cursor-not-allowed"
        >
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
        <img
          src="/images/basket.svg"
          alt="Baskets"
          className="w-40 mx-auto mb-3"
        />

        <p className="text-sm text-gray-500 mb-4">
          You haven't created any baskets.
        </p>

        <button
          disabled
          className="bg-[#4184F3] text-white px-5 py-2 rounded text-sm font-medium opacity-80 cursor-not-allowed"
        >
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
        <img
          src="/images/sip.svg"
          alt="sip"
          className="w-40 mx-auto mb-3"
        />

        <p className="text-sm text-gray-500 mb-4">
          You haven't created any SIPs.
        </p>

        <button
          disabled
          className="bg-[#4184F3] text-white px-5 py-2 rounded text-sm font-medium opacity-80 cursor-not-allowed"
        >
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
        <img
          src="/images/alert.svg"
          alt="alerts"
          className="w-40 mx-auto mb-3"
        />

        <p className="text-sm text-gray-500 mb-4">
          You haven't created any alerts.
        </p>

        <button
          disabled
          className="bg-[#4184F3] text-white px-5 py-2 rounded text-sm font-medium opacity-80 cursor-not-allowed"
        >
          Create new alert
        </button>
      </div>
    </div>
  );
}

// ── Status Badge ──
function StatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], { bg: string; color: string }> = {
    COMPLETE:  { bg: "rgba(34,197,94,0.12)",  color: "#22c55e" },
    PENDING:   { bg: "rgba(234,179,8,0.12)",  color: "#eab308" },
    REJECTED:  { bg: "rgba(239,68,68,0.12)",  color: "#ef4444" },
    CANCELLED: { bg: "rgba(156,163,175,0.12)", color: "#9ca3af" },
  };
  const s = map[status];
  return (
    <span
      className="px-2.5 py-[3px] rounded-sm text-[11px] font-bold tracking-wide border"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        borderColor: `${s.color}33`,
      }}
    >
      {status}
    </span>
  );
}

// ── Type Badge ──
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

// ── Search Input ──
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
        className="flex items-center gap-2 bg-none border-none cursor-pointer text-[var(--text-on-dark)]"
      >
        <span className="text-base font-semibold">
          {title} ({count})
        </span>
        {collapsed
          ? <RiArrowDownSLine className="text-lg text-[var(--text-on-dark-55)]" />
          : <RiArrowUpSLine className="text-lg text-[var(--text-on-dark-55)]" />
        }
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

// ── Main Component ──
export default function Orders() {
  const [activeTab, setActiveTab] = useState("Orders");
  const [ordersCollapsed, setOrdersCollapsed] = useState(false);
  const [tradesCollapsed, setTradesCollapsed] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [tradeSearch, setTradeSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from JSON
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        
        setOrders(data.orders || []);
        setTrades(data.trades || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const today = getTodayDate();

  // Aaj ke orders ki unique instrument+product+exchange keys nikalo
  // (yeh wahi combinations hain jo Positions page par dikhte hain)
  const todayKeys = new Set(
    orders
      .filter(o => o.date === today)
      .map(o => `${o.instrument}__${o.product}__${o.exchange}`)
  );

  // Executed section: Aaj ke COMPLETE orders (positions wale instruments ke
  // buy aur sell dono orders, status COMPLETE ke saath)
  const executedOrders = orders.filter(o =>
    o.status === "COMPLETE" &&
    o.date === today &&
    o.instrument.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // Trades section: Aaj jitni bhi buy/sell trades hui hain (positions wale instruments ki)
  const todayTrades = trades.filter(t =>
    todayKeys.has(`${t.instrument}__${t.product}__${t.exchange}`) &&
    (t.instrument.toLowerCase().includes(tradeSearch.toLowerCase()) ||
     t.tradeId.includes(tradeSearch))
  );

  if (loading) {
    return (
      <div className="bg-[var(--color-primary)] min-h-full rounded-2xl px-6 pb-6 text-[var(--text-on-dark)] flex items-center justify-center h-[400px]">
        <div className="text-[var(--text-on-dark-55)]">Loading...</div>
      </div>
    );
  }

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case "Orders":
        return (
          <>
            {/* ═══ Executed Section (Aaj ke COMPLETE orders) ═══ */}
            <SectionHeader
              title="Executed"
              count={executedOrders.length}
              collapsed={ordersCollapsed}
              onToggle={() => setOrdersCollapsed(p => !p)}
              searchVal={orderSearch}
              onSearch={setOrderSearch}
              extraActions={
                <button className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-[var(--color-accent)] text-xs font-medium">
                  Contract note
                </button>
              }
            />

            {!ordersCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {["Time", "Type", "Instrument", "Product", "Qty.", "Avg. price", "Status"].map(h => (
                        <th key={h} className="px-3 py-2 text-[11px] font-semibold text-[var(--text-on-dark-45)] text-left border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {executedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-[var(--text-on-dark-45)] text-[13px] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                          No executed orders found
                        </td>
                      </tr>
                    ) : executedOrders.map((order, i) => (
                      <tr
                        key={i}
                        className="transition-colors duration-100 hover:bg-[var(--bg-overlay-08)]"
                      >
                        <td className="px-3 py-3 text-[var(--text-on-dark-55)] text-xs border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                          {order.time}
                        </td>
                        <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                          <TypeBadge type={order.type} />
                        </td>
                        <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                          <span>{order.instrument}</span>
                          <span className="ml-1.5 text-[10px] font-semibold text-[var(--text-on-dark-45)] bg-[var(--bg-overlay-10)] px-1.5 py-0.5 rounded">
                            {order.exchange}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-55)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                          {order.product}
                        </td>
                        <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                          {order.qty}
                        </td>
                        <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                          {order.avgPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ═══ Trades Section (Aaj ki saari buy/sell trades) ═══ */}
            <div className="mt-6">
              <SectionHeader
                title="Trades"
                count={todayTrades.length}
                collapsed={tradesCollapsed}
                onToggle={() => setTradesCollapsed(p => !p)}
                searchVal={tradeSearch}
                onSearch={setTradeSearch}
              />

              {!tradesCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {["Trade ID", "Fill time", "Type", "Instrument", "Product", "Qty.", "Avg. Price"].map(h => (
                          <th key={h} className="px-3 py-2 text-[11px] font-semibold text-[var(--text-on-dark-45)] text-left border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {todayTrades.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 py-8 text-center text-[var(--text-on-dark-45)] text-[13px] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                            No trades found for today
                          </td>
                        </tr>
                      ) : todayTrades.map((trade, i) => (
                        <tr
                          key={i}
                          className="transition-colors duration-100 hover:bg-[var(--bg-overlay-08)]"
                        >
                          <td className="px-3 py-3 text-[var(--text-on-dark-55)] text-xs border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                            {trade.tradeId}
                          </td>
                          <td className="px-3 py-3 text-[var(--text-on-dark-55)] text-xs border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                            {trade.fillTime}
                          </td>
                          <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                            <TypeBadge type={trade.type} />
                          </td>
                          <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                            <span>{trade.instrument}</span>
                            <span className="ml-1.5 text-[10px] font-semibold text-[var(--text-on-dark-45)] bg-[var(--bg-overlay-10)] px-1.5 py-0.5 rounded">
                              {trade.exchange}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-55)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                            {trade.product}
                          </td>
                          <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                            {trade.qty}
                          </td>
                          <td className="px-3 py-3 text-[13px] text-[var(--text-on-dark-80)] border-b border-[var(--border-overlay-12)] whitespace-nowrap">
                            {trade.avgPrice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        );
      case "GTT":
        return <GTTComingSoon />;
      case "Baskets":
        return <BasketsComingSoon />;
      case "SIP":
        return <SIPComingSoon />;
      case "Alerts":
        return <AlertsComingSoon />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[var(--color-primary)] min-h-full  px-6 pb-6 text-[var(--text-on-dark)]">
      {/* ── Tabs ── */}
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

      {/* ── Tab Content ── */}
      {renderTabContent()}
    </div>
  );
}