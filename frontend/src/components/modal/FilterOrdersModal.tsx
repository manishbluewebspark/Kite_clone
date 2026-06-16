import { useState } from "react";

interface FilterState {
  symbol: string;
  type: string;
  source: string;
  marketplace: string;
  broker: string;
  currency: string;
}

interface FilterOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  focused?: boolean;
}

const defaultFilters: FilterState = {
  symbol: "All Symbols",
  type: "All Types",
  source: "All Sources",
  marketplace: "All Marketplaces",
  broker: "All Brokers",
  currency: "All Currencies",
};

function SelectField({ label, value, options, onChange, focused }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-white">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none bg-[#0d1117] text-[#a0aab8] text-sm
            px-3 py-2.5 rounded-md border outline-none cursor-pointer
            transition-colors duration-150
            ${focused
              ? "border-[#2979ff] ring-1 ring-[#2979ff]/40"
              : "border-[#2a3040] hover:border-[#3a4155]"
            }
          `}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#0d1117] text-[#a0aab8]">
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 text-[#a0aab8]" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function FilterOrdersModal({ isOpen, onClose }: FilterOrdersModalProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [focusedField, setFocusedField] = useState<keyof FilterState | null>("symbol");

  if (!isOpen) return null;

  const handleReset = () => setFilters(defaultFilters);

  const handleApply = () => {
    console.log("Applied filters:", filters);
    onClose();
  };

  const set = (key: keyof FilterState) => (val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setFocusedField(key);
  };

  return (
    <>
      {/* Backdrop */}
      <div

        onClick={onClose}
      />

      {/* Modal centered */}
      <div className="fixed inset-0 backdrop-blur-xs bg-opacity-70 z-50 flex items-center justify-center">
        <div className="min-w-xl bg-[#111827] rounded-xl shadow-2xl border border-[#1e2737] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-white text-lg font-bold tracking-wide">Filter Orders</h2>
            <button
              onClick={onClose}
              className="text-[#6b7a99] hover:text-white transition-colors p-0.5 rounded"
              aria-label="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#1e2737]" />

          {/* Body */}
          <div className="px-6 py-5 grid grid-cols-2 gap-x-5 gap-y-4">
            <SelectField
              label="Symbol"
              value={filters.symbol}
              options={["All Symbols", "AAPL", "TSLA", "BTCUSD", "ETHUSD"]}
              onChange={set("symbol")}
              focused={focusedField === "symbol"}
            />
            <SelectField
              label="Type"
              value={filters.type}
              options={["All Types", "Market", "Limit", "Stop", "Stop Limit"]}
              onChange={set("type")}
              focused={focusedField === "type"}
            />
            <SelectField
              label="Source"
              value={filters.source}
              options={["All Sources", "Manual", "Automated", "API"]}
              onChange={set("source")}
              focused={focusedField === "source"}
            />
            <SelectField
              label="Marketplace"
              value={filters.marketplace}
              options={["All Marketplaces", "NYSE", "NASDAQ", "LSE", "Crypto"]}
              onChange={set("marketplace")}
              focused={focusedField === "marketplace"}
            />
            <SelectField
              label="Broker"
              value={filters.broker}
              options={["All Brokers", "Broker A", "Broker B", "Broker C"]}
              onChange={set("broker")}
              focused={focusedField === "broker"}
            />
            <SelectField
              label="Currency"
              value={filters.currency}
              options={["All Currencies", "USD", "EUR", "GBP", "INR", "BTC"]}
              onChange={set("currency")}
              focused={focusedField === "currency"}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#0d1117]/60">
            <button
              onClick={handleReset}
              className="px-5 py-2 text-sm font-semibold text-white border border-[#2a3040] rounded-md hover:bg-[#1e2737] hover:border-[#3a4155] transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 text-sm font-bold text-white bg-[#2979ff] rounded-md hover:bg-[#1c6fef] active:bg-[#1560d4] transition-colors shadow-lg shadow-[#2979ff]/20"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
