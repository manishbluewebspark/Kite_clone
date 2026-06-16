// src/pages/Holdings.tsx
import { useState } from "react";
import { Search, Download, Lock, Users, BarChart2, ChevronDown } from "lucide-react";
import holdingsJson from "../../data/holdingsData.json";

interface HoldingItem {
  id: number;
  name: string;
  fullName: string;
  category: "kite" | "mtf" | "smallcase";
  qty: number;
  avgCost: number;
  ltp: number;
  invested: number;
  curVal: number;
  pnl: number;
  pnlPercent: number;
  netChg: number;
  dayChgPercent: string;
  dayChgPositive: boolean;
}

const holdingsData: HoldingItem[] = holdingsJson as HoldingItem[];

// Dropdown options shown only inside the "Equity" tab
const equityFilterOptions = [
  { key: "all", label: "All equity" },
  { key: "mtf", label: "MTF" },
  { key: "kite", label: "Kite only" },
  { key: "smallcase", label: "Smallcase" }
];

export default function UserSideHoldings() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("current"); // current | invested | pnl

  // Equity-tab only: which category filter is selected
  const [equityFilter, setEquityFilter] = useState("all");
  const [equityDropdownOpen, setEquityDropdownOpen] = useState(false);

  // Decide which rows to show based on the active tab
  const tabFilteredHoldings =
    activeTab === "equity"
      ? equityFilter === "all"
        ? holdingsData
        : holdingsData.filter((item) => item.category === equityFilter)
      : holdingsData; // "all" tab shows everything

  const totals = tabFilteredHoldings.reduce(
    (acc, item) => ({
      totalInvested: acc.totalInvested + item.invested,
      totalCurVal: acc.totalCurVal + item.curVal,
      totalPnl: acc.totalPnl + item.pnl,
      dayPnl: acc.dayPnl + (item.invested * parseFloat(item.dayChgPercent) / 100)
    }),
    { totalInvested: 0, totalCurVal: 0, totalPnl: 0, dayPnl: 0 }
  );

  const totalPnlPercent = (totals.totalPnl / totals.totalInvested) * 100;
  const dayPnlPercent = (totals.dayPnl / totals.totalInvested) * 100;

  const filteredHoldings = tabFilteredHoldings.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // bar widths for the bottom comparison bar (current value / invested view)
  const investedPct = (totals.totalInvested / (totals.totalInvested + totals.totalCurVal)) * 100;
  const curValPct = 100 - investedPct;

  // bar widths for the bottom comparison bar (P&L view) - loss vs profit split
  const totalProfit = tabFilteredHoldings.reduce((sum, item) => sum + (item.pnl > 0 ? item.pnl : 0), 0);
  const totalLoss = tabFilteredHoldings.reduce((sum, item) => sum + (item.pnl < 0 ? Math.abs(item.pnl) : 0), 0);
  const lossPct = (totalLoss / (totalProfit + totalLoss)) * 100;
  const profitPct = 100 - lossPct;

  const activeValue =
    viewMode === "current"
      ? totals.totalCurVal
      : viewMode === "invested"
      ? totals.totalInvested
      : totals.totalPnl;

  const selectedEquityLabel =
    equityFilterOptions.find((opt) => opt.key === equityFilter)?.label ?? "All equity";

  return (
    <div className="h-full flex flex-col bg-white text-[13px]">
      {/* Tabs */}
      <div className="border-b border-gray-200 px-5">
        <div className="flex gap-7">
          {[
            { key: "all", label: "All" },
            { key: "equity", label: "Equity" },
            { key: "mutualfunds", label: "Mutual funds" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setEquityDropdownOpen(false);
              }}
              className={`pb-3 pt-4 text-[14px] font-medium relative transition-colors ${
                activeTab === tab.key
                  ? "text-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "mutualfunds" ? (
        /* Mutual funds tab: Coming soon placeholder, no other UI changes */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-[18px] font-medium text-gray-500 mb-1">Coming soon</div>
            <div className="text-[13px]">Mutual funds holdings will appear here</div>
          </div>
        </div>
      ) : (
        <>
          {/* Header row: title + actions */}
          <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-normal text-gray-800">
                Holdings ({filteredHoldings.length})
              </h1>

              {/* Equity-tab only dropdown filter */}
              {activeTab === "equity" && (
                <div className="relative">
                  <button
                    onClick={() => setEquityDropdownOpen((open) => !open)}
                    className="flex items-center gap-1.5 text-[13px] text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:border-gray-300 bg-white"
                  >
                    <span>{selectedEquityLabel}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {equityDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-10 overflow-hidden">
                      {equityFilterOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => {
                            setEquityFilter(opt.key);
                            setEquityDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[13px] ${
                            equityFilter === opt.key
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-5">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-[13px] rounded border border-gray-200 bg-transparent focus:outline-none focus:border-blue-400 w-36 text-gray-700"
                />
              </div>

              <button className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 text-[13px]">
                <Lock size={14} />
                <span>Authorisation</span>
              </button>
              <button className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 text-[13px]">
                <Users size={14} />
                <span>Family</span>
              </button>
              <button className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 text-[13px]">
                <BarChart2 size={14} />
                <span>Analytics</span>
              </button>
              <button className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 text-[13px]">
                <Download size={14} />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="px-5 pb-4 flex items-end gap-16 flex-wrap">
            <div>
              <div className="text-[12px] text-gray-400 mb-1">Total investment</div>
              <div className="text-gray-800">
                <span className="text-[20px] font-medium">{totals.totalInvested.toFixed(0)}</span>
                <span className="text-[14px]">.{(totals.totalInvested % 1).toFixed(2).split(".")[1]}</span>
              </div>
            </div>
            <div>
              <div className="text-[12px] text-gray-400 mb-1">Current value</div>
              <div className="text-gray-800">
                <span className="text-[20px] font-medium">{totals.totalCurVal.toFixed(0)}</span>
                <span className="text-[14px]">.{(totals.totalCurVal % 1).toFixed(2).split(".")[1]}</span>
              </div>
            </div>

            <div className="ml-auto flex items-end gap-16">
              <div className="text-right">
                <div className="text-[12px] text-gray-400 mb-1">Day's P&L</div>
                <div className="flex items-center gap-2 justify-end">
                  <span className={`text-[18px] font-medium ${totals.dayPnl >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {totals.dayPnl.toFixed(0)}
                    <span className="text-[13px]">.{Math.abs(totals.dayPnl % 1).toFixed(2).split(".")[1]}</span>
                  </span>
                  <span
                    className={`text-[12px] px-1.5 py-0.5 rounded font-medium ${
                      totals.dayPnl >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {totals.dayPnl >= 0 ? "+" : ""}{dayPnlPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[12px] text-gray-400 mb-1">Total P&L</div>
                <div className="flex items-center gap-2 justify-end">
                  <span className={`text-[18px] font-medium ${totals.totalPnl >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {totals.totalPnl.toFixed(0)}
                    <span className="text-[13px]">.{Math.abs(totals.totalPnl % 1).toFixed(2).split(".")[1]}</span>
                  </span>
                  <span
                    className={`text-[12px] px-1.5 py-0.5 rounded font-medium ${
                      totals.totalPnl >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {totals.totalPnl >= 0 ? "+" : ""}{totalPnlPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto px-5">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-normal text-gray-400 text-[12px]">Instrument</th>
                  <th className="text-right py-2 font-normal text-gray-400 text-[12px]">Qty.</th>
                  <th className="text-right py-2 font-normal text-gray-400 text-[12px]">Avg. cost</th>
                  <th className="text-right py-2 font-normal text-gray-400 text-[12px]">LTP</th>
                  <th className="text-right py-2 font-normal text-gray-400 text-[12px]">Invested</th>
                  <th className="text-right py-2 font-normal text-gray-400 text-[12px]">Cur. val</th>
                  <th className="text-right py-2 font-normal text-gray-400 text-[12px] bg-gray-50">P&L</th>
                  <th className="text-right py-2 font-normal text-gray-400 text-[12px]">Net chg.</th>
                  <th className="text-right py-2 font-normal text-gray-400 text-[12px]">Day chg.</th>
                </tr>
              </thead>
              <tbody>
                {filteredHoldings.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 text-blue-600 font-medium">{item.name}</td>
                    <td className="text-right py-3 text-gray-700">{item.qty}</td>
                    <td className="text-right py-3 text-gray-700">{item.avgCost.toFixed(2)}</td>
                    <td className="text-right py-3 text-gray-700">{item.ltp.toFixed(2)}</td>
                    <td className="text-right py-3 text-gray-700">{item.invested.toFixed(2)}</td>
                    <td className="text-right py-3 text-gray-700">{item.curVal.toFixed(2)}</td>
                    <td
                      className={`text-right py-3 font-medium bg-gray-50 ${
                        item.pnl >= 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {item.pnl.toFixed(2)}
                    </td>
                    <td className={`text-right py-3 font-medium ${item.netChg >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {item.netChg >= 0 ? "+" : ""}{item.netChg.toFixed(2)}%
                    </td>
                    <td className={`text-right py-3 font-medium ${item.dayChgPositive ? "text-green-600" : "text-red-500"}`}>
                      {item.dayChgPercent}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold text-gray-700">
                  <td className="py-3" colSpan={4}></td>
                  <td className="text-right py-3">{totals.totalInvested.toFixed(2)}</td>
                  <td className="text-right py-3">{totals.totalCurVal.toFixed(2)}</td>
                  <td className={`text-right py-3 bg-gray-50 ${totals.totalPnl >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {totals.totalPnl.toFixed(2)}
                  </td>
                  <td className={`text-right py-3 ${totalPnlPercent >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {totalPnlPercent >= 0 ? "+" : ""}{totalPnlPercent.toFixed(2)}%
                  </td>
                  <td className={`text-right py-3 ${dayPnlPercent >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {dayPnlPercent >= 0 ? "+" : ""}{dayPnlPercent.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Comparison bar */}
            <div className="mt-6">
              <div className="h-20 w-full overflow-hidden flex">
                {viewMode === "pnl" ? (
                  <>
                    <div className="bg-[#ff3b5c]" style={{ width: `${lossPct}%` }} />
                    <div className="bg-[#23c16b]" style={{ width: `${profitPct}%` }} />
                  </>
                ) : (
                  <>
                    <div className="bg-[#5b6cf5]" style={{ width: `${investedPct}%` }} />
                    <div className="bg-[#3ec1ff]" style={{ width: `${curValPct}%` }} />
                  </>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div
                  className={`text-[15px] font-medium ${
                    viewMode === "pnl"
                      ? activeValue >= 0
                        ? "text-green-600"
                        : "text-red-500"
                      : "text-gray-800"
                  }`}
                >
                  ₹{activeValue.toFixed(2)}
                </div>
                <div className="flex items-center gap-5 text-[12px] text-gray-500">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="view"
                      checked={viewMode === "current"}
                      onChange={() => setViewMode("current")}
                      className="accent-blue-500"
                    />
                    Current value
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="view"
                      checked={viewMode === "invested"}
                      onChange={() => setViewMode("invested")}
                      className="accent-blue-500"
                    />
                    Invested
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="view"
                      checked={viewMode === "pnl"}
                      onChange={() => setViewMode("pnl")}
                      className="accent-blue-500"
                    />
                    P&L
                  </label>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}