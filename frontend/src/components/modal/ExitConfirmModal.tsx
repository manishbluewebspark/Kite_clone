import { useEffect, useState } from "react";
import toast from 'react-hot-toast';

interface SelectedPosition {
  id: number;
  instrument: string;
  product: string;
  netQty: number;
  pnl: number;
}

interface ExitConfirmModalProps {
  positions: SelectedPosition[];
  onConfirm: () => void;
  onCancel: () => void;
}

function formatNumber(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ExitConfirmModal({ positions, onConfirm, onCancel }: ExitConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      toast.success(`Successfully exited ${positions.length} position${positions.length > 1 ? 's' : ''}`);
      onCancel();
    } catch (error) {
      toast.error('Failed to exit positions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-sm shadow-xl w-[440px] max-w-[95vw] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-medium text-gray-800">
            Exit {positions.length} Position{positions.length > 1 ? "s" : ""}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Position List */}
        <div className="px-5 py-3 max-h-[280px] overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-[11px] text-gray-400 font-normal text-left pb-2">Instrument</th>
                <th className="text-[11px] text-gray-400 font-normal text-right pb-2">Qty</th>
                <th className="text-[11px] text-gray-400 font-normal text-right pb-2 bg-gray-50 px-2">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.id} className="border-t border-gray-50">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {pos.product}
                      </span>
                      <span className="text-[13px] text-gray-700">{pos.instrument}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-[13px] text-gray-500 text-right">
                    {pos.netQty > 0 ? `+${pos.netQty}` : pos.netQty}
                  </td>
                  <td className={`py-2.5 text-[13px] font-medium text-right px-2 bg-gray-50 ${pos.pnl >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {pos.pnl >= 0 ? "+" : ""}{formatNumber(pos.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
<div className="flex items-center gap-3 px-2 py-4 border-t border-gray-100">
  <div className="flex items-center gap-3 ml-auto">
    <button
      onClick={handleConfirm}
      disabled={isLoading}
      className={`flex-1 py-1.5 px-8 rounded-xs bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium transition-colors ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? 'Exiting...' : 'Exit'}
    </button>
    <button
      onClick={onCancel}
      disabled={isLoading}
      className="flex-1 py-1.5 px-8 rounded-xs border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Close
    </button>
  </div>
</div>
      </div>
    </div>
  );
}