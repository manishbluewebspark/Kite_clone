import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { MdCandlestickChart } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Coin {
  label: string;
  symbol: string; // e.g. "BINANCE:BTCUSDT"
}

interface Timeframe {
  label: string;
  interval: string; // TradingView interval param
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const COINS: Coin[] = [
  { label: "BTC/USDT", symbol: "BINANCE:BTCUSDT" },
  { label: "ETH/USDT", symbol: "BINANCE:ETHUSDT" },
  { label: "BNB/USDT", symbol: "BINANCE:BNBUSDT" },
  { label: "SOL/USDT", symbol: "BINANCE:SOLUSDT" },
  { label: "XRP/USDT", symbol: "BINANCE:XRPUSDT" },
  { label: "ADA/USDT", symbol: "BINANCE:ADAUSDT" },
  { label: "DOGE/USDT", symbol: "BINANCE:DOGEUSDT" },
  { label: "MATIC/USDT", symbol: "BINANCE:MATICUSDT" },
  { label: "AVAX/USDT", symbol: "BINANCE:AVAXUSDT" },
  { label: "LINK/USDT", symbol: "BINANCE:LINKUSDT" },
];

const TIMEFRAMES: Timeframe[] = [
  { label: "1m",  interval: "1m"  },
  { label: "5m",  interval: "5m"  },
  { label: "15m", interval: "15m" },
  { label: "30m", interval: "30m" },
  { label: "1h",  interval: "1h"  },
  { label: "4h",  interval: "4h"  },
  { label: "1D",  interval: "1D"  },
  { label: "1W",  interval: "1W"  },
  { label: "1M",  interval: "1M"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWidgetUrl(symbol: string, interval: string): string {
  const config = {
    interval,
    width: "100%",
    height: "100%",
    symbol,
    showIntervalTabs: false,
    displayMode: "single",
    colorTheme: "dark",
    isTransparent: false,
  };
  return (
    "https://www.tradingview-widget.com/embed-widget/technical-analysis/?locale=en#" +
    encodeURIComponent(JSON.stringify(config))
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface WidgetCardProps {
  symbol: string;
  timeframe: Timeframe;
}

function WidgetCard({ symbol, timeframe }: WidgetCardProps) {
  const url = buildWidgetUrl(symbol, timeframe.interval);

  return (
    <div className="flex flex-col gap-1">
      {/* Timeframe label above card */}
      <span className="text-center text-sm font-semibold text-slate-300 tracking-wide">
        {timeframe.label}
      </span>

      {/* Card */}
      <div
        className=" overflow-hidden border border-slate-700/60 "
        style={{ height: 350, background: "#131722" }}
      >
        <iframe
          key={`${symbol}-${timeframe.interval}`}
          src={url}
          title={`Technical Analysis ${symbol} ${timeframe.label}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          allowTransparency={false}
          style={{ display: "block", border: "none" }}
        />
      </div>
    </div>
  );
}

// ─── Coin Dropdown ─────────────────────────────────────────────────────────────

interface CoinDropdownProps {
  coins: Coin[];
  selected: Coin;
  onChange: (coin: Coin) => void;
}

function CoinDropdown({ coins, selected, onChange }: CoinDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white
                   bg-slate-700/70 border border-slate-600 hover:border-blue-500 hover:bg-slate-700
                   transition-all duration-200 min-w-[150px] justify-between"
      >
        <span>{selected.label}</span>
        <FiChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown list */}
      {open && (
        <ul
          className="absolute z-50 mt-1 w-full rounded-lg border border-slate-600 shadow-2xl overflow-hidden"
          style={{ background: "#1a2035" }}
        >
          {coins.map((coin) => (
            <li key={coin.symbol}>
              <button
                onClick={() => {
                  onChange(coin);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-150
                  ${
                    coin.symbol === selected.symbol
                      ? "bg-blue-600/30 text-blue-300"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
              >
                {coin.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function CryptoTrends() {
  const [selectedCoin, setSelectedCoin] = useState<Coin>(COINS[0]);

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "#0d1117", fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Crypto Trends
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dashboard &nbsp;›&nbsp; Crypto Trends
        </p>
      </div>

      {/* ── Controls bar ── */}
      <div className="px-6 py-4 flex items-center gap-4 border-b border-slate-800/60">
        {/* Coin icon */}
        <MdCandlestickChart size={20} className="text-blue-400 shrink-0" />

        <span className="text-sm font-semibold text-slate-300">Select Coin:</span>

        <CoinDropdown
          coins={COINS}
          selected={selectedCoin}
          onChange={setSelectedCoin}
        />
      </div>

      {/* ── Widget Grid ── */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TIMEFRAMES.map((tf) => (
            <WidgetCard
              key={`${selectedCoin.symbol}-${tf.interval}`}
              symbol={selectedCoin.symbol}
              timeframe={tf}
            />
          ))}
        </div>
      </div>
    </div>
  );
}