import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, TrendingUp, TrendingDown, Plus } from "lucide-react";
import axiosInstance from "../../lib/axios";

interface InstrumentResult {
  token: string;
  symbol: string;
  name: string;
  expiry: string;
  strike: string;
  lotsize: string;
  instrumenttype: string;
  exch_seg: string;
  tick_size: string;
}

interface LivePrice {
  token: string;
  exchange: string;
  symbol: string;
  ltp: number | null;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
}

interface AddWatchlistProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (data: any) => void;
}

function formatInstrumentLabel(inst: InstrumentResult) {
  if (inst.instrumenttype === "OPTIDX" || inst.instrumenttype === "OPTSTK") {
    const strikePrice = (Number(inst.strike) / 100).toFixed(0);
    const optionType = inst.symbol.includes("CE") ? "CE" : "PE";
    const expiryDate = inst.expiry.replace(/(\d{2})([A-Z]{3})(\d{2})/, "$1 $2 $3");
    return `${inst.name} ${expiryDate} ${strikePrice} ${optionType}`;
  }
  if (inst.instrumenttype === "FUTIDX" || inst.instrumenttype === "FUTSTK") {
    const expiryDate = inst.expiry.replace(/(\d{2})([A-Z]{3})(\d{2})/, "$1 $2 $3");
    return `${inst.name} ${expiryDate} FUT`;
  }
  return inst.name;
}

export default function AddWatchlist({ isOpen, onClose, onAdd }: AddWatchlistProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InstrumentResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [livePrices, setLivePrices] = useState<Map<string, LivePrice>>(new Map());
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentResult | null>(null);
  const [quantity, setQuantity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      // Reset state when modal closes
      setTimeout(() => {
        setQuery("");
        setResults([]);
        setSelectedInstrument(null);
        setQuantity("");
        setAvgPrice("");
        setError("");
      }, 300);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setLivePrices(new Map());
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await axiosInstance.get("/api/instruments/search", {
          params: { q: query, limit: 30 },
        });

        if (data.success && data.data.length > 0) {
          setResults(data.data);
          await fetchLivePrices(data.data);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen]);

  // Fetch live prices for all instruments
  const fetchLivePrices = async (instruments: InstrumentResult[]) => {
    setLoadingPrices(true);
    try {
      const payload = instruments.map(inst => ({
        token: inst.token,
        exchange: inst.exch_seg,
        symbol: inst.symbol,
      }));

      const { data } = await axiosInstance.post("/api/instruments/bulk-ltp", {
        instruments: payload,
      });

      if (data.success) {
        const priceMap = new Map<string, LivePrice>();
        data.data.forEach((price: LivePrice) => {
          priceMap.set(price.token, price);
        });
        setLivePrices(priceMap);
      }
    } catch (err) {
      console.error("Bulk LTP fetch error:", err);
    } finally {
      setLoadingPrices(false);
    }
  };

  // Handle instrument selection
  const handleSelectInstrument = (inst: InstrumentResult) => {
    const livePrice = livePrices.get(inst.token);
    setSelectedInstrument(inst);
    setAvgPrice(livePrice?.ltp?.toString() || "");
    setError("");
  };

  // Handle add to holdings/watchlist
  const handleAdd = async () => {
    if (!selectedInstrument) {
      setError("Please select an instrument first");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError("Please enter valid quantity");
      return;
    }

    if (!avgPrice || Number(avgPrice) <= 0) {
      setError("Please enter valid average price");
      return;
    }

    // ⬅️ NAYA CHECK: LTP aana chahiye, warna add mat karo
    const livePrice = livePrices.get(selectedInstrument.token);
    if (!livePrice || livePrice.ltp === null || livePrice.ltp === undefined) {
      setError("Waiting for live price to load. Please try again in a moment.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { data } = await axiosInstance.post("/api/holdings", {
        name: selectedInstrument.symbol,
        full_name: formatInstrumentLabel(selectedInstrument),
        token: selectedInstrument.token,
        exch_seg: selectedInstrument.exch_seg,
        lotsize: Number(selectedInstrument.lotsize),
        qty: Number(quantity),
        avg_cost: Number(avgPrice),
        ltp: livePrice.ltp, // ⬅️ ab confirm LTP hi jaayega
        category: "kite",
      });

      if (data.success) {
        onAdd?.(data.data);
        onClose();
      } else {
        setError(data.message || "Failed to add");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setSelectedInstrument(null);
    setQuantity("");
    setAvgPrice("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`relative w-full max-w-3xl mx-4 rounded-2xl shadow-2xl
          bg-white dark:bg-[#0d1b2e]
          border border-gray-200 dark:border-white/[0.06] 
          transition-all duration-300
          ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h2 className="text-base font-semibold text-gray-800 dark:text-[#e8f0fe]">
            {selectedInstrument ? "Add to Holdings" : "Search Instruments"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full
              bg-gray-100 dark:bg-white/[0.04] text-gray-400 dark:text-[#7a8eaa] 
              hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!selectedInstrument ? (
            <>
              {/* Search Input */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stocks, options, futures... (e.g., SENSEX, NIFTY, RELIANCE, INFY)"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 dark:border-white/[0.08] 
                    rounded-xl outline-none focus:border-[#387ED1] dark:focus:border-[#3b7ef8]
                    bg-white dark:bg-white/[0.04] text-gray-800 dark:text-[#e8f0fe]"
                />
                {searching && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {/* Results Table */}
              {results.length > 0 && (
                <div className="border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-white/[0.03]">
                      <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/[0.06]">
                        <th className="text-left px-4 py-3 font-medium">Instrument</th>
                        <th className="text-right px-4 py-3 font-medium">LTP</th>
                        <th className="text-right px-4 py-3 font-medium">Change</th>
                        <th className="text-right px-4 py-3 font-medium">Lot Size</th>
                        <th className="text-center px-4 py-3 font-medium w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((inst) => {
                        const livePrice = livePrices.get(inst.token);
                        const changePositive = livePrice && livePrice.change >= 0;
                        const isLoadingPrice = loadingPrices && !livePrice;

                        return (
                          <tr
                            key={`${inst.exch_seg}-${inst.token}`}
                            className="border-b border-gray-100 dark:border-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                            onClick={() => handleSelectInstrument(inst)}
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-800 dark:text-[#e8f0fe]">
                                {formatInstrumentLabel(inst)}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">{inst.symbol}</div>
                            </td>
                            <td className="text-right px-4 py-3 font-mono">
                              {isLoadingPrice ? (
                                <Loader2 size={12} className="animate-spin inline" />
                              ) : livePrice?.ltp ? (
                                <span className="font-medium text-gray-800 dark:text-[#e8f0fe]">
                                  ₹{livePrice.ltp.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="text-right px-4 py-3">
                              {livePrice?.ltp && (
                                <div className={`flex items-center justify-end gap-1 text-xs font-medium ${changePositive ? "text-green-600" : "text-red-500"}`}>
                                  {changePositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                  <span>{changePositive ? "+" : ""}{livePrice.changePercent?.toFixed(2)}%</span>
                                </div>
                              )}
                            </td>
                            <td className="text-right px-4 py-3 text-gray-600 dark:text-gray-400">
                              {inst.lotsize}
                            </td>
                            <td className="text-center px-4 py-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectInstrument(inst);
                                }}
                                className="p-1.5 rounded-lg bg-[#387ED1] text-white hover:bg-[#2d66b0] transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {query.length >= 2 && !searching && results.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-8">
                  No instruments found. Try "SENSEX", "NIFTY", "RELIANCE", "INFY", "TCS"
                </div>
              )}

              {query.length < 2 && (
                <div className="text-center text-sm text-gray-400 py-8">
                  Type at least 2 characters to search...
                </div>
              )}
            </>
          ) : (
            <>
              {/* Back button */}
              <button
                onClick={handleBack}
                className="mb-4 text-sm text-[#387ED1] hover:underline flex items-center gap-1"
              >
                ← Back to search
              </button>

              {/* Selected Instrument Info */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
                <div className="text-base font-semibold text-gray-800 dark:text-[#e8f0fe]">
                  {formatInstrumentLabel(selectedInstrument)}
                </div>
                <div className="text-xs text-gray-500 mt-1 space-x-2">
                  <span>{selectedInstrument.exch_seg}</span>
                  <span>•</span>
                  <span>Lot size: {selectedInstrument.lotsize}</span>
                </div>
                {livePrices.get(selectedInstrument.token)?.ltp && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Current LTP:</span>
                    <span className="text-lg font-semibold text-gray-800 dark:text-[#e8f0fe]">
                      ₹{livePrices.get(selectedInstrument.token)?.ltp?.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`Min: ${selectedInstrument.lotsize}`}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.08] 
                    rounded-xl outline-none focus:border-[#387ED1] dark:focus:border-[#3b7ef8]
                    bg-white dark:bg-white/[0.04] text-gray-800 dark:text-[#e8f0fe]"
                />
              </div>

              {/* Avg Price Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Average Buy Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  placeholder="Enter average buy price"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.08] 
                    rounded-xl outline-none focus:border-[#387ED1] dark:focus:border-[#3b7ef8]
                    bg-white dark:bg-white/[0.04] text-gray-800 dark:text-[#e8f0fe]"
                />
              </div>

              {error && (
                <div className="mb-4 text-sm text-red-500">{error}</div>
              )}
            </>
          )}
        </div>

        {/* Footer Buttons */}
        {selectedInstrument && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06]">
            <button
              onClick={handleBack}
              className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 
                rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={
                saving ||
                !quantity ||
                !avgPrice ||
                !livePrices.get(selectedInstrument.token)?.ltp // ⬅️ ye condition add karo
              }
              className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all
    ${(saving || !quantity || !avgPrice || !livePrices.get(selectedInstrument.token)?.ltp)
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-[#387ED1] hover:bg-[#2d66b0] text-white shadow-lg"
                }`}
            >
              {saving
                ? "Adding..."
                : !livePrices.get(selectedInstrument.token)?.ltp
                  ? "Waiting for price..."
                  : "Add to Holdings"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}