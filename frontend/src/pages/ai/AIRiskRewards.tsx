import { useState, useMemo, type JSX } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine} from "recharts";
import {
  FiTrendingUp, FiSettings, FiAlertCircle, FiRefreshCw,
  FiSearch, FiDownload, FiChevronLeft, FiChevronRight,
  FiDollarSign, FiPercent, FiClock, FiTarget, FiInfo
} from "react-icons/fi";
import {
  BsRobot, BsFacebook, BsTwitter, BsWhatsapp, BsShieldCheck,
  BsExclamationTriangle, BsGraphUp, BsCurrencyRupee
} from "react-icons/bs";
import { MdOutlineCompare } from "react-icons/md";
import { RiRefreshLine } from "react-icons/ri";

// ─── types ────────────────────────────────────────────────────────────────────
interface RowData {
  month: number;
  startCap: number;
  profit: number;
  withdrawal: number;
  endCap: number;
  growth: number;
  multiple: number;
}

interface ChartData {
  month: number;
  noWd: number;
  wd: number;
}

interface YearlyData {
  year: string;
  profit: number;
}

interface ComputeDataParams {
  capital: number;
  riskPct: number;
  rrStr: string;
  winRate: number;
  tradesPerMonth: number;
  durationYears: number;
  withdrawalPct: number;
  expenses: boolean;
}

interface ComputeDataReturn {
  expectancy: number;
  noWdRows: RowData[];
  wdRows: RowData[];
  noWdFinal: number;
  wdFinal: number;
  noWdCAGR: number;
  wdCAGR: number;
  noWdProfit: number;
  wdProfit: number;
  totalWithdrawn: number;
  timeToDouble: number | null;
  milestones: {
    x2: string | null;
    x3: string | null;
    x10: string | null;
  };
  chartData: ChartData[];
  yearlyData: YearlyData[];
}

interface Quote {
  text: string;
  author: string;
  tag: string;
}

interface Insight {
  icon: JSX.Element;
  label: string;
  badge: {
    text: string;
    color: string;
  };
  desc: string;
}

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number): string => {
  if (n === 0) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${n < 0 ? "-" : ""}₹${(abs / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `${n < 0 ? "-" : ""}₹${(abs / 1e5).toFixed(1)}L`;
  if (abs >= 1e3) return `${n < 0 ? "-" : ""}₹${(abs / 1e3).toFixed(1)}K`;
  return `${n < 0 ? "-₹" : "₹"}${abs.toLocaleString("en-IN")}`;
};

const fmtINR = (n: number): string =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.abs(n));

const parseRR = (str: string): number => {
  const parts = str.split(":");
  if (parts.length !== 2) return 1;
  const r = parseFloat(parts[1]);
  return isNaN(r) || r <= 0 ? 1 : r;
};

const quotes: Quote[] = [
  { text: "Cut your losses short and let your profits run.", author: "Trading Wisdom", tag: "Risk Management" },
  { text: "The market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett", tag: "Psychology" },
  { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett", tag: "Education" },
  { text: "In trading, the more you learn, the more you earn.", author: "Trading Wisdom", tag: "Growth" },
  { text: "Never risk more than you can afford to lose.", author: "Trading Wisdom", tag: "Risk Management" },
];

// Custom tooltip formatter functions
const lineChartFormatter = (value: any): any => {
  if (value === undefined) return "₹0";
  return fmt(value);
};

const barChartFormatter = (value: any): any => {
  if (value === undefined) return "₹0";
  return fmt(value);
};

// ─── computation ────────────────────────────────────────────────────────────
function computeData({ capital, riskPct, rrStr, winRate, tradesPerMonth, durationYears, withdrawalPct, expenses }: ComputeDataParams): ComputeDataReturn {
  const rr = parseRR(rrStr);
  const lossRate = 1 - winRate / 100;
  const winR = winRate / 100;
  const riskPerTrade = riskPct / 100;
  const expenseFactor = expenses ? 0.003 : 0; // 0.3% per trade for brokerage+GST+slippage

  // Mathematical Expectancy in R
  const expectancy = winR * rr - lossRate * 1;

  const months = durationYears * 12;

  // Full compounding (no withdrawal)
  const noWdRows: RowData[] = [];
  let cap = capital;
  for (let m = 1; m <= months; m++) {
    const startCap = cap;
    // Use expectancy-based deterministic model for consistency
    const profit = startCap * riskPerTrade * expectancy * tradesPerMonth - startCap * expenseFactor * tradesPerMonth;
    const endCap = Math.max(0, startCap + profit);
    noWdRows.push({ 
      month: m, 
      startCap, 
      profit, 
      withdrawal: 0, 
      endCap, 
      growth: ((endCap - startCap) / startCap) * 100, 
      multiple: endCap / capital 
    });
    cap = endCap;
  }

  // With withdrawals
  const wdRows: RowData[] = [];
  cap = capital;
  let totalWithdrawn = 0;
  const withdrawalFixed = capital * (withdrawalPct / 100);
  for (let m = 1; m <= months; m++) {
    const startCap = cap;
    const profit = startCap * riskPerTrade * expectancy * tradesPerMonth - startCap * expenseFactor * tradesPerMonth;
    const withdrawal = Math.min(withdrawalFixed, Math.max(0, startCap + profit));
    const endCap = Math.max(0, startCap + profit - withdrawal);
    totalWithdrawn += withdrawal;
    wdRows.push({ 
      month: m, 
      startCap, 
      profit, 
      withdrawal, 
      endCap, 
      growth: ((endCap - startCap) / startCap) * 100, 
      multiple: endCap / capital 
    });
    cap = endCap;
  }

  const noWdFinal = noWdRows[noWdRows.length - 1]?.endCap ?? capital;
  const wdFinal = wdRows[wdRows.length - 1]?.endCap ?? capital;

  const noWdCAGR = (Math.pow(noWdFinal / capital, 1 / durationYears) - 1) * 100;
  const wdCAGR = wdFinal > 0 ? (Math.pow(wdFinal / capital, 1 / durationYears) - 1) * 100 : -100;

  // Time to double (no withdrawal)
  let timeToDouble: number | null = null;
  for (let i = 0; i < noWdRows.length; i++) {
    if (noWdRows[i].endCap >= capital * 2) { 
      timeToDouble = i + 1; 
      break; 
    }
  }

  // Milestones
  const milestone = (mult: number): string | null => {
    for (let i = 0; i < noWdRows.length; i++) {
      if (noWdRows[i].endCap >= capital * mult) return `Month ${i + 1}`;
    }
    return null;
  };

  // Chart: monthly capital
  const chartData: ChartData[] = noWdRows.map((r, index) => ({ 
    month: r.month, 
    noWd: r.endCap, 
    wd: wdRows[index]?.endCap ?? r.endCap 
  }));

  // Yearly bar chart
  const yearlyData: YearlyData[] = Array.from({ length: durationYears }, (_, i) => {
    const startM = i * 12;
    const endM = startM + 11;
    const startCap = i === 0 ? capital : noWdRows[startM - 1]?.endCap ?? capital;
    const endCap = noWdRows[endM]?.endCap ?? noWdRows[noWdRows.length - 1]?.endCap ?? capital;
    return { year: `Year ${i + 1}`, profit: endCap - startCap };
  });

  return {
    expectancy,
    noWdRows, wdRows,
    noWdFinal, wdFinal,
    noWdCAGR, wdCAGR,
    noWdProfit: noWdFinal - capital,
    wdProfit: wdFinal - capital,
    totalWithdrawn,
    timeToDouble,
    milestones: { x2: milestone(2), x3: milestone(3), x10: milestone(10) },
    chartData,
    yearlyData,
  };
}

// ─── Slider component ────────────────────────────────────────────────────────
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  display?: string | number;
}

function Slider({ label, value, min, max, step, onChange, display }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-cyan-400 font-semibold">{display ?? value}</span>
      </div>
      <div className="relative h-1.5 bg-[#1e2a3a] rounded-full">
        <div className="absolute h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400" style={{ width: `${pct}%` }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 border-2 border-[#0d1b2a] shadow pointer-events-none"
          style={{ left: `calc(${pct}% - 6px)` }} />
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
  icon?: React.ReactNode;
}

function StatCard({ label, value, sub, valueColor = "text-cyan-400", icon }: StatCardProps) {
  return (
    <div className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between text-gray-400 text-xs">
        <span>{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className={`text-xl font-bold ${valueColor}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-500">{sub}</div>}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function AIRiskRewards() {
  // Parameters
  const [capital, setCapital] = useState<number>(100000);
  const [capitalInput, setCapitalInput] = useState<string>("100000");
  const [riskPct, setRiskPct] = useState<number>(1);
  const [rrStr, setRrStr] = useState<string>("1:1.0");
  const [winRate, setWinRate] = useState<number>(50);
  const [tradesPerMonth, setTradesPerMonth] = useState<number>(20);
  const [durationYears, setDurationYears] = useState<number>(5);
  const [withdrawalPct, setWithdrawalPct] = useState<number>(2);
  const [expenses, setExpenses] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"nowd" | "wd" | "compare">("nowd");
  const [quoteIdx, setQuoteIdx] = useState<number>(0);
  const [searchMonth, setSearchMonth] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const rowsPerPage = 12;

  const handleCapitalChange = (v: string): void => {
    setCapitalInput(v);
    const n = parseFloat(v.replace(/,/g, ""));
    if (!isNaN(n) && n > 0) setCapital(n);
  };

  const data: ComputeDataReturn = useMemo(() =>
    computeData({ capital, riskPct, rrStr, winRate, tradesPerMonth, durationYears, withdrawalPct, expenses }),
    [capital, riskPct, rrStr, winRate, tradesPerMonth, durationYears, withdrawalPct, expenses]
  );

  const reset = (): void => {
    setCapital(100000); setCapitalInput("100000");
    setRiskPct(1); setRrStr("1:1.0"); setWinRate(50);
    setTradesPerMonth(20); setDurationYears(5); setWithdrawalPct(2); setExpenses(false);
  };

  const activeRows: RowData[] = activeTab === "nowd" ? data.noWdRows : data.wdRows;
  const filteredRows: RowData[] = activeRows.filter(r => searchMonth === "" || String(r.month).includes(searchMonth));
  const totalPages: number = Math.ceil(filteredRows.length / rowsPerPage);
  const pageRows: RowData[] = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const expectancyColor: string = data.expectancy > 0 ? "text-green-400" : data.expectancy < 0 ? "text-red-400" : "text-orange-400";

  const q: Quote = quotes[quoteIdx % quotes.length];

  // AI insights
  const insights: Insight[] = [
    {
      icon: <BsShieldCheck className="text-green-400" />,
      label: "Conservative Risk",
      badge: riskPct <= 2 ? { text: "Good", color: "bg-green-500/20 text-green-400" } : { text: "High", color: "bg-red-500/20 text-red-400" },
      desc: riskPct <= 2
        ? `Your ${riskPct}% risk per trade follows professional money management principles.`
        : `${riskPct}% risk per trade is high. Consider reducing to 1-2% for longevity.`,
    },
    {
      icon: <BsExclamationTriangle className="text-yellow-400" />,
      label: "Risk-Reward Ratio",
      badge: parseRR(rrStr) >= 1.5 ? { text: "Good", color: "bg-green-500/20 text-green-400" } : { text: "Attention", color: "bg-yellow-500/20 text-yellow-400" },
      desc: parseRR(rrStr) >= 1.5
        ? `${rrStr} risk-reward gives you a solid edge in the markets.`
        : `Consider improving your risk-reward ratio above 1.5:1 for sustainable trading.`,
    },
  ];

  const exportCSV = (): void => {
    const rows: (string | number)[][] = [["Month", "Starting Capital", "Profit", "Withdrawal", "Ending Capital", "Growth %", "Multiple"]];
    activeRows.forEach(r => rows.push([r.month, r.startCap.toFixed(0), r.profit.toFixed(0), r.withdrawal.toFixed(0), r.endCap.toFixed(0), r.growth.toFixed(2), r.multiple.toFixed(2)]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "trading_data.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#060f1a] text-white font-sans flex flex-col" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#08121e] border-b border-[#1a2535]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <BsCurrencyRupee className="text-white text-sm" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">AI Risk Rewards Calculation</div>
            <div className="text-[10px] text-gray-400">AI-Powered Trading Coach & Capital Growth Projector</div>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition">
          <BsRobot /> AI Assistant
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 min-w-[240px] bg-[#08121e] border-r border-[#1a2535] overflow-y-auto p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-300">Parameters</span>
            <button className="flex items-center gap-1 text-[10px] bg-[#1a2535] px-2 py-1 rounded text-gray-400 hover:text-white transition">
              <FiSettings size={10} /> Custom
            </button>
          </div>

          <div className="bg-[#0d1b2a] rounded-xl p-3 mb-4 border border-[#1a2535]">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-3">
              <FiTrendingUp size={12} /> Trading Parameters
            </div>

            {/* Initial Capital */}
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-1">Initial Capital</div>
              <div className="text-cyan-400 text-xs mb-1">₹{Number(capital).toLocaleString("en-IN")}</div>
              <input type="text" value={capitalInput} onChange={e => handleCapitalChange(e.target.value)}
                className="w-full bg-[#060f1a] border border-[#1e2d3d] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" />
            </div>

            <Slider label={`Risk per Trade: ${riskPct}%`} value={riskPct} min={0.1} max={10} step={0.1}
              onChange={setRiskPct} display={`${riskPct}%`} />
            <div className="text-[10px] text-gray-500 -mt-2 mb-3">Amount at risk: ₹{(capital * riskPct / 100).toLocaleString("en-IN")}</div>

            <div className="mb-3">
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                Risk:Reward <FiInfo size={10} />
              </div>
              <input type="text" value={rrStr} onChange={e => setRrStr(e.target.value)}
                className="w-full bg-[#060f1a] border border-[#1e2d3d] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" />
            </div>

            <Slider label={`Win Rate: ${winRate}%`} value={winRate} min={1} max={99} step={1}
              onChange={setWinRate} display={`${winRate}%`} />
            <Slider label={`Trades/Month: ${tradesPerMonth}`} value={tradesPerMonth} min={1} max={100} step={1}
              onChange={setTradesPerMonth} display={tradesPerMonth} />
            <Slider label={`Duration: ${durationYears} year${durationYears > 1 ? "s" : ""}`} value={durationYears} min={1} max={30} step={1}
              onChange={setDurationYears} display={`${durationYears}yr`} />
            <Slider label={`Withdrawal: ${withdrawalPct}% (₹${(capital * withdrawalPct / 100).toLocaleString("en-IN")}/mo)`}
              value={withdrawalPct} min={0} max={20} step={0.5} onChange={setWithdrawalPct} display={`${withdrawalPct}%`} />

            {/* Expenses toggle */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">Expenses</span>
              <button onClick={() => setExpenses(!expenses)}
                className={`w-10 h-5 rounded-full transition-colors relative ${expenses ? "bg-cyan-500" : "bg-[#1e2d3d]"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${expenses ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">(Consider: Brokerage + GST + Slippages)</div>
          </div>

          <button onClick={reset}
            className="w-full flex items-center justify-center gap-2 bg-[#1a0a0a] hover:bg-[#2a1010] border border-red-900/50 text-red-400 text-xs py-2 rounded-lg transition">
            <RiRefreshLine /> Reset to Defaults
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Trading Performance Report */}
          <section className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <BsGraphUp className="text-cyan-400 text-lg" />
              <div>
                <div className="font-bold text-base">Trading Performance Report</div>
                <div className="text-xs text-gray-400">Comprehensive analysis of your {durationYears}-year trading strategy</div>
              </div>
            </div>

            {/* 3 info boxes */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { title: "Initial Setup", icon: <FiDollarSign />, rows: [["Capital", fmt(capital)], ["Risk/Trade", `${riskPct}%`]] },
                { title: "Strategy Edge", icon: <FiTarget />, rows: [["Risk:Reward", rrStr], ["Win Rate", `${winRate}%`]] },
                { title: "Execution Plan", icon: <FiClock />, rows: [["Trades/Month", tradesPerMonth], ["Timeframe", `${durationYears} Years`]] },
              ].map((box, idx) => (
                <div key={idx} className="bg-[#060f1a] rounded-xl p-3 border border-[#1a2535]">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">{box.icon} {box.title}</div>
                  {box.rows.map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{k}</span>
                      <span className="text-cyan-400 font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Mathematical Expectancy */}
            <div className={`rounded-xl p-3 border mb-4 ${data.expectancy >= 0 ? "bg-[#0a1a0f] border-green-900/50" : "bg-[#1a0a0a] border-red-900/50"}`}>
              <div className="flex items-center gap-2">
                <FiAlertCircle className={data.expectancy >= 0 ? "text-green-400" : "text-red-400"} />
                <span className="text-sm">Mathematical Expectancy:
                  <span className={`font-bold ml-2 text-lg ${expectancyColor}`}>{data.expectancy.toFixed(3)}R</span>
                </span>
              </div>
              {data.expectancy <= 0 && (
                <div className="text-xs text-gray-400 mt-1 ml-6">
                  {data.expectancy < 0
                    ? "Negative expectancy means this strategy is likely to lose money over time. Consider adjusting your risk-reward ratio or improving accuracy."
                    : "Breakeven strategy. Costs will erode returns. Aim for positive expectancy."}
                </div>
              )}
            </div>

            {/* Two comparison cards */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { title: "Full Compounding (No Withdrawals)", icon: <FiTrendingUp className="text-green-400" />,
                  final: data.noWdFinal, mult: (data.noWdFinal / capital).toFixed(1),
                  cagr: data.noWdCAGR, ttd: data.timeToDouble, profit: data.noWdProfit,
                  extraLabel: "Total Profit", extraValue: fmt(data.noWdProfit) },
                { title: "With Monthly Withdrawals", icon: <FiPercent className="text-orange-400" />,
                  final: data.wdFinal, mult: (data.wdFinal / capital).toFixed(1),
                  cagr: data.wdCAGR, ttd: null, profit: data.wdProfit,
                  extraLabel: "Total Withdrawn", extraValue: fmt(data.totalWithdrawn),
                  extra2: "Remaining Profit", extra2Val: fmt(data.wdProfit) },
              ].map((c, i) => (
                <div key={i} className="bg-[#060f1a] rounded-xl p-4 border border-[#1a2535]">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                    {c.icon} {c.title}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Final Capital</span>
                      <span className={`font-semibold ${c.final >= capital ? "text-green-400" : "text-red-400"}`}>{fmt(c.final)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Capital Multiple</span>
                      <span className="font-semibold text-cyan-400">{c.mult}x</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">CAGR</span>
                      <span className={`font-semibold ${c.cagr >= 0 ? "text-cyan-400" : "text-red-400"}`}>{c.cagr.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Time to Double</span>
                      <span className={`font-semibold ${c.ttd ? "text-cyan-400" : "text-purple-400"}`}>{c.ttd ? `${c.ttd} months` : "Not reached"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{c.extraLabel}</span>
                      <span className={`font-semibold ${c.profit >= 0 ? "text-green-400" : "text-red-400"}`}>{c.extraValue}</span>
                    </div>
                    {'extra2' in c && c.extra2 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{c.extra2}</span>
                        <span className={`font-semibold ${c.profit >= 0 ? "text-green-400" : "text-red-400"}`}>{c.extra2Val}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Capital Growth Milestones */}
            <div className="bg-[#060f1a] rounded-xl p-4 border border-[#1a2535] mb-4">
              <div className="text-sm font-semibold text-gray-300 mb-3">Capital Growth Milestones</div>
              <div className="grid grid-cols-3 gap-3">
                {[["2x Capital", data.milestones.x2], ["3x Capital", data.milestones.x3], ["10x Capital", data.milestones.x10]].map(([lbl, val]) => (
                  <div key={lbl} className="bg-[#0d1b2a] rounded-lg p-3 text-center border border-[#1a2535]">
                    <div className="text-xs text-gray-400 mb-1">{lbl}</div>
                    <div className={`text-sm font-bold ${val ? "text-cyan-400" : "text-purple-400"}`}>{val ?? "Not reached"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Analysis */}
            <div className="bg-[#060f1a] rounded-xl p-4 border border-[#1a2535]">
              <div className="text-sm font-semibold text-gray-300 mb-2">Strategic Analysis</div>
              <p className="text-xs text-gray-400 leading-relaxed">
                With <span className="text-white">₹{fmtINR(capital)}</span> starting capital and a{" "}
                <span className="text-white">{winRate}%</span> win rate at{" "}
                <span className="text-white">{rrStr}</span> risk-reward, your mathematical expectancy is{" "}
                <span className={`font-bold ${expectancyColor}`}>{data.expectancy.toFixed(3)}R per trade</span>.
              </p>
              <p className="text-[10px] text-yellow-600 mt-2">
                <strong>Disclaimer:</strong> These calculations assume consistent performance and don't account for market volatility, slippage (−0.1–0.3% per trade), commissions, taxes, or psychological factors that affect real trading.
              </p>
            </div>
          </section>

          {/* AI Strategy Insights + Quote */}
          <div className="grid grid-cols-2 gap-4">
            {/* Insights */}
            <div className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <BsRobot className="text-cyan-400" /> AI Strategy Insights
              </div>
              {insights.map((ins, i) => (
                <div key={i} className="bg-[#060f1a] rounded-xl p-3 border border-[#1a2535] mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    {ins.icon}
                    <span className="text-xs font-semibold text-gray-300">{ins.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto ${ins.badge.color}`}>{ins.badge.text}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">{ins.desc}</p>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">"</div>
                <p className="text-sm font-semibold text-white leading-relaxed">"{q.text}"</p>
              </div>
              <div>
                <div className="text-cyan-400 text-xs mt-2">— {q.author}</div>
                <div className="text-gray-500 text-[10px]">{q.tag}</div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <button onClick={() => setQuoteIdx(i => i + 1)}
                  className="flex items-center gap-1 text-[11px] bg-[#1a2535] px-2 py-1 rounded hover:bg-[#1e2d3d] text-gray-400 transition">
                  <FiRefreshCw size={10} /> New Quote
                </button>
                <div className="flex gap-2 text-gray-500">
                  <span className="text-[10px] text-gray-400">Share:</span>
                  <BsFacebook className="cursor-pointer hover:text-blue-400 transition" size={14} />
                  <BsTwitter className="cursor-pointer hover:text-sky-400 transition" size={14} />
                  <BsWhatsapp className="cursor-pointer hover:text-green-400 transition" size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs + Stats */}
          <section className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-2xl p-4">
            <div className="flex gap-2 mb-4">
              {[
                { key: "nowd" as const, label: "No Withdrawals", icon: <FiTrendingUp size={12} /> },
                { key: "wd" as const, label: "With Withdrawals", icon: <FiPercent size={12} /> },
                { key: "compare" as const, label: "Compare", icon: <MdOutlineCompare size={12} /> },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition font-medium ${activeTab === t.key ? "bg-cyan-500 text-white" : "bg-[#060f1a] text-gray-400 hover:text-white border border-[#1a2535]"}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {activeTab !== "compare" && (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {(() => {
                  const isWd = activeTab === "wd";
                  const finalCap = isWd ? data.wdFinal : data.noWdFinal;
                  const cagr = isWd ? data.wdCAGR : data.noWdCAGR;
                  const profit = isWd ? data.wdProfit : data.noWdProfit;
                  const ttd = data.timeToDouble;
                  const stats = [
                    { label: "Final Capital", value: fmt(finalCap), sub: `₹${fmtINR(finalCap)}`, vc: finalCap >= capital ? "text-green-400" : "text-red-400", icon: <FiDollarSign size={12} /> },
                    { label: "CAGR", value: `${cagr.toFixed(2)}%`, sub: "Compound Annual Growth Rate", vc: cagr >= 0 ? "text-cyan-400" : "text-red-400", icon: <FiTrendingUp size={12} /> },
                    { label: "Time to Double", value: ttd ? `Month ${ttd}` : "Not reached", sub: `Multiple: ${(finalCap / capital).toFixed(1)}x`, vc: ttd ? "text-cyan-400" : "text-purple-400", icon: <FiClock size={12} /> },
                    { label: "Total Profit", value: fmt(profit), sub: `₹${profit >= 0 ? "" : "-"}${fmtINR(profit)}`, vc: profit >= 0 ? "text-green-400" : "text-red-400", icon: <BsCurrencyRupee size={12} /> },
                  ];
                  return stats.map(c => <StatCard key={c.label} {...c} valueColor={c.vc} />);
                })()}
              </div>
            )}

            {activeTab === "compare" && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { label: "No Withdrawals", final: data.noWdFinal, cagr: data.noWdCAGR, profit: data.noWdProfit },
                  { label: "With Withdrawals", final: data.wdFinal, cagr: data.wdCAGR, profit: data.wdProfit },
                ].map((c) => (
                  <div key={c.label} className="bg-[#060f1a] rounded-xl p-3 border border-[#1a2535]">
                    <div className="text-xs font-semibold text-gray-300 mb-2">{c.label}</div>
                    {[
                      ["Final Capital", fmt(c.final)],
                      ["CAGR", `${c.cagr.toFixed(2)}%`],
                      ["Total Profit", fmt(c.profit)]
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{k}</span>
                        <span className="text-cyan-400 font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Capital Growth Over Time Chart */}
            <div className="bg-[#060f1a] rounded-xl p-4 border border-[#1a2535] mb-4">
              <div className="text-sm font-semibold text-gray-300 mb-3">Capital Growth Over Time</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2535" />
                  <XAxis dataKey="month" stroke="#4a5568" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis stroke="#4a5568" tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt(v)} width={60} />
                  <Tooltip 
                    contentStyle={{ background: "#0d1b2a", border: "1px solid #1e2d3d", borderRadius: 8, fontSize: 11 }}
                    formatter={lineChartFormatter}
                  />
                  <Line type="monotone" dataKey="noWd" stroke="#22d3ee" strokeWidth={2} dot={false} />
                  {activeTab !== "nowd" && <Line type="monotone" dataKey="wd" stroke="#f97316" strokeWidth={2} dot={false} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Yearly Profit + Monthly Table */}
          <section className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-2xl p-4">
            <div className="text-sm font-semibold text-gray-300 mb-3">Yearly Profit</div>
            <div className="bg-[#060f1a] rounded-xl p-3 border border-[#1a2535] mb-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.yearlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2535" />
                  <XAxis dataKey="year" stroke="#4a5568" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#4a5568" tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt(v)} width={60} />
                  <Tooltip 
                    contentStyle={{ background: "#0d1b2a", border: "1px solid #1e2d3d", borderRadius: 8, fontSize: 11 }}
                    formatter={barChartFormatter}
                  />
                  <ReferenceLine y={0} stroke="#4a5568" />
                  <Bar dataKey="profit" fill="#22d3ee" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Trading Data */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-300">Monthly Trading Data</div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#060f1a] border border-[#1a2535] rounded-lg px-2 py-1">
                  <FiSearch size={11} className="text-gray-500" />
                  <input type="text" placeholder="Search months..." value={searchMonth}
                    onChange={e => { setSearchMonth(e.target.value); setPage(1); }}
                    className="bg-transparent text-xs text-gray-300 focus:outline-none w-24 placeholder-gray-600" />
                </div>
                <button onClick={exportCSV}
                  className="flex items-center gap-1.5 bg-[#060f1a] border border-[#1a2535] rounded-lg px-2 py-1 text-xs text-gray-400 hover:text-white transition">
                  <FiDownload size={11} /> Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#1a2535]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#060f1a] text-gray-400 border-b border-[#1a2535]">
                    {["Month", "Starting Capital", "Profit", "Withdrawal", "Ending Capital", "Growth %", "Multiple"].map(h => (
                      <th key={h} className="text-left px-3 py-2 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r, i) => (
                    <tr key={r.month} className={`border-b border-[#1a2535] ${i % 2 === 0 ? "bg-[#060f1a]" : "bg-[#08121e]"} hover:bg-[#0d1b2a] transition`}>
                      <td className="px-3 py-2 text-gray-300">{r.month}</td>
                      <td className="px-3 py-2 text-gray-300">₹{fmtINR(r.startCap)}</td>
                      <td className={`px-3 py-2 font-semibold ${r.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {r.profit === 0 ? "₹0" : `${r.profit >= 0 ? "" : "-"}₹${fmtINR(r.profit)}`}
                      </td>
                      <td className="px-3 py-2 text-gray-400">{r.withdrawal > 0 ? `₹${fmtINR(r.withdrawal)}` : "-"}</td>
                      <td className="px-3 py-2 text-gray-300">₹{fmtINR(r.endCap)}</td>
                      <td className={`px-3 py-2 font-semibold ${r.growth >= 0 ? "text-cyan-400" : "text-red-400"}`}>{r.growth.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-cyan-400">{r.multiple.toFixed(2)}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
              <span>Showing {Math.min((page - 1) * rowsPerPage + 1, filteredRows.length)} to {Math.min(page * rowsPerPage, filteredRows.length)} of {filteredRows.length} months</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-[#060f1a] border border-[#1a2535] disabled:opacity-40 hover:text-white transition">
                  <FiChevronLeft size={12} /> Previous
                </button>
                <span className="px-2">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-[#060f1a] border border-[#1a2535] disabled:opacity-40 hover:text-white transition">
                  Next <FiChevronRight size={12} />
                </button>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}