import { useEffect } from "react";
import type { DisplayRow } from "../../pages/Positions";
import { showTradeToast } from "../../utils/tradeToast";

// ✅ Same generator function
function generateOrderId(): string {
  const fixedPart = String(Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000);
  const randomPart = String(Math.floor(Math.random() * 90_000) + 10_000);
  return `${fixedPart}${randomPart}`;
}

interface ExitConfirmModalProps {
  positions: DisplayRow[];
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ExitConfirmModal({ positions, onConfirm, onCancel, loading = false }: ExitConfirmModalProps) {

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      // ✅ Har position ke liye alag 15-digit ID generate karo
      positions.forEach((pos) => {
        const customOrderId = generateOrderId();
        showTradeToast({ ...pos, id: customOrderId } as any, "success");
      });
    } catch {
      positions.forEach((pos) => {
        const customOrderId = generateOrderId();
        showTradeToast({ ...pos, id: customOrderId } as any, "error");
      });
    }
  };

  const tableStyles = {
    header: "text-left text-[11px] text-gray-400 font-normal pb-2",
    cell: "text-left text-[13px] text-gray-700 py-2",
    row: "border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-default",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[1px]"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-4 pb-0">
          <h2 className="text-[15px] font-medium text-gray-800 pb-3 border-b border-gray-200">
            Exit position{positions.length > 1 ? "s" : ""} ({positions.length})
          </h2>
        </div>

        {/* Table */}
        <div className="px-5 py-2 max-h-72 overflow-y-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[50%]" />
              <col className="w-[10%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200">
                <th className={tableStyles.header}></th>
                <th className={tableStyles.header}>Qty</th>
                <th className={tableStyles.header}>Price</th>
                <th className={tableStyles.header}>Type</th>
                <th className={tableStyles.header}>Product</th>
                <th className={tableStyles.header}>Validity</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => {
                const exitSide = pos.transaction_type === "BUY" ? "SELL" : "BUY";
                return (
                  <tr key={pos.id} className={tableStyles.row}>
                    <td className={tableStyles.cell}>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold whitespace-nowrap rounded-xs
                          ${exitSide === "SELL" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"}`}>
                          {exitSide}
                        </span>
                        <span className="text-[13px] text-gray-700">
                          {pos.instrument}
                          <span className="text-[10px] text-gray-400 ml-1">({pos.exchange})</span>
                        </span>
                      </div>
                    </td>
                    <td className={tableStyles.cell}>{Math.abs(pos.netQty)}</td>
                    <td className={`${tableStyles.cell} font-medium text-gray-800`}>-</td>
                    <td className={tableStyles.cell}>{pos.type}</td>
                    <td className={tableStyles.cell}>
                      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded">{pos.product}</span>
                    </td>
                    <td className={tableStyles.cell}>{pos.validity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="py-1.5 px-6 rounded-sm bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Exiting..." : "Exit"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="py-1.5 px-6 rounded-sm border border-gray-300 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}