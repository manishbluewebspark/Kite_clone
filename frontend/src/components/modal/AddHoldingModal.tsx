import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, TrendingUp, TrendingDown } from "lucide-react";
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
  error?: boolean;
}

interface AddHoldingModalProps {
  onClose: () => void;
  onSaved: () => void;
}

function formatInstrumentLabel(inst: InstrumentResult) {
  if (inst.instrumenttype === "OPTIDX" || inst.instrumenttype === "OPTSTK") {
    const strikePrice = Number(inst.strike) / 100;
    const type = inst.symbol.endsWith("CE") ? "CE" : inst.symbol.endsWith("PE") ? "PE" : "";
    const expiryFormatted = inst.expiry.replace(/(\w{3})(\d{2})(\w{3})/, "$1 $2 $3");
    return `${inst.name} ${expiryFormatted} ${strikePrice} ${type}`;
  }
  if (inst.instrumenttype === "FUTIDX" || inst.instrumenttype === "FUTSTK") {
    const expiryFormatted = inst.expiry.replace(/(\w{3})(\d{2})(\w{3})/, "$1 $2 $3");
    return `${inst.name} ${expiryFormatted} FUT`;
  }
  return inst.name;
}

export default function AddHoldingModal({ onClose, onSaved }: AddHoldingModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InstrumentResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [livePrices, setLivePrices] = useState<Map<string, LivePrice>>(new Map());
  const [loadingPrices, setLoadingPrices] = useState(false);
  
  const [selected, setSelected] = useState<InstrumentResult | null>(null);
  const [qty, setQty] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
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
          params: { q: query, limit: 50 },
        });
        
        if (data.success && data.data.length > 0) {
          setResults(data.data);
          // Fetch live prices for all results
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
  }, [query]);

  // Fetch live prices for instruments
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

  // Select instrument and open modal
  const handleSelect = (inst: InstrumentResult) => {
    const livePrice = livePrices.get(inst.token);
    setSelected(inst);
    setAvgCost(livePrice?.ltp?.toString() || "");
    setError("");
  };

  const handleSave = async () => {
    if (!selected || !qty || !avgCost) {
      setError("Quantity aur avg cost required hai");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const livePrice = livePrices.get(selected.token);
      const { data } = await axiosInstance.post("/api/holdings", {
        name: selected.symbol,
        full_name: formatInstrumentLabel(selected),
        token: selected.token,
        exch_seg: selected.exch_seg,
        lotsize: Number(selected.lotsize),
        qty: Number(qty),
        avg_cost: Number(avgCost),
        ltp: livePrice?.ltp,
      });

      if (data.success) {
        onSaved();
        onClose();
      } else {
        setError(data.message || "Save failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-medium text-gray-800">
            {selected ? "Add to Holdings" : "Search & Add Instrument"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="p-5">
              {/* Search input */}
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stocks, options, futures... (e.g., SENSEX, NIFTY, RELIANCE)"
                  className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-gray-200 rounded-md outline-none focus:border-[#387ED1] focus:ring-1 focus:ring-[#387ED1]/20"
                />
                {searching && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {/* Results Table */}
              {results.length > 0 && (
                <div className="border border-gray-100 rounded-md overflow-hidden">
                  <table className="w-full text-[12px]">
                    <thead className="bg-gray-50">
                      <tr className="text-gray-500 border-b border-gray-100">
                        <th className="text-left px-3 py-2 font-medium">Instrument</th>
                        <th className="text-right px-3 py-2 font-medium">LTP</th>
                        <th className="text-right px-3 py-2 font-medium">Change</th>
                        <th className="text-right px-3 py-2 font-medium">Lot Size</th>
                        <th className="text-center px-3 py-2 font-medium w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((inst) => {
                        const livePrice = livePrices.get(inst.token);
                        const changePositive = livePrice && livePrice.change >= 0;
                        const isLoadingPrice = loadingPrices && !livePrice;
                        
                        return (
                          <tr key={`${inst.exch_seg}-${inst.token}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2.5">
                              <div className="font-medium text-gray-800 text-[13px]">
                                {formatInstrumentLabel(inst)}
                              </div>
                              <div className="text-[10px] text-gray-400">{inst.symbol}</div>
                            </td>
                            <td className="text-right px-3 py-2.5 font-mono text-[13px]">
                              {isLoadingPrice ? (
                                <Loader2 size={12} className="animate-spin inline" />
                              ) : livePrice?.ltp ? (
                                `₹${livePrice.ltp.toFixed(2)}`
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="text-right px-3 py-2.5">
                              {livePrice?.ltp && (
                                <div className={`flex items-center justify-end gap-1 text-[12px] font-medium ${changePositive ? "text-green-600" : "text-red-500"}`}>
                                  {changePositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                  <span>{changePositive ? "+" : ""}{livePrice.changePercent?.toFixed(2)}%</span>
                                </div>
                              )}
                            </td>
                            <td className="text-right px-3 py-2.5 text-gray-600 text-[12px]">
                              {inst.lotsize}
                            </td>
                            <td className="text-center px-3 py-2.5">
                              <button
                                onClick={() => handleSelect(inst)}
                                className="px-3 py-1 text-[11px] font-medium text-white rounded"
                                style={{ backgroundColor: "#387ED1" }}
                              >
                                Add
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
                <div className="text-center text-[12px] text-gray-400 py-8">
                  No instruments found. Try "SENSEX", "NIFTY", "RELIANCE", "INFY"
                </div>
              )}
            </div>
          ) : (
            // Selected instrument form (same as before)
            <div className="p-5">
              <button
                onClick={() => setSelected(null)}
                className="text-[11px] text-[#387ED1] hover:underline mb-4 flex items-center gap-1"
              >
                ← Back to search
              </button>

              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="text-[14px] font-medium text-gray-800">
                  {formatInstrumentLabel(selected)}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {selected.exch_seg} · Lot size: {selected.lotsize}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-[12px] text-gray-500 block mb-1">Quantity</label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder={`Min: ${selected.lotsize}`}
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-md outline-none focus:border-[#387ED1]"
                />
              </div>

              <div className="mb-4">
                <label className="text-[12px] text-gray-500 block mb-1">Avg. Buy Price</label>
                <input
                  type="number"
                  value={avgCost}
                  onChange={(e) => setAvgCost(e.target.value)}
                  step="0.01"
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-md outline-none focus:border-[#387ED1]"
                />
              </div>

              {error && (
                <div className="text-[11px] text-red-500 mt-2">{error}</div>
              )}

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-1.5 text-[12px] font-medium text-gray-600 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 text-[12px] font-semibold text-white rounded disabled:opacity-50"
                  style={{ backgroundColor: "#387ED1" }}
                >
                  {saving ? "Saving..." : "Add to Holdings"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}