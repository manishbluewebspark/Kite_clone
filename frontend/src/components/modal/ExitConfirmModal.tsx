// import { useEffect, useState } from "react";
// import toast from 'react-hot-toast';
// import type { DisplayRow } from "../../pages/Positions";


// interface ExitConfirmModalProps {
//   positions: DisplayRow[];
//   onConfirm: () => void;
//   onCancel: () => void;
//   loading?: boolean;
// }

// function formatNumber(n: number) {
//   return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// }

// export default function ExitConfirmModal({ positions, onConfirm, onCancel }: ExitConfirmModalProps) {
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onCancel();
//     };
//     document.addEventListener("keydown", handleKey);
//     return () => document.removeEventListener("keydown", handleKey);
//   }, [onCancel]);

//   const handleConfirm = async () => {
//     setIsLoading(true);
//     try {
//       await onConfirm();
//       toast.success(`Successfully exited ${positions.length} position${positions.length > 1 ? 's' : ''}`);
//       onCancel();
//     } catch (error) {
//       toast.error('Failed to exit positions. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Centralized styles
//   const tableStyles = {
//     header: "text-left text-[11px] text-gray-400 font-normal pb-2",
//     cell: "text-left text-[13px] text-gray-700 py-2",
//     row: "border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-default"
//   };

//   const columnWidths = {
//     instrument: "w-[40%]",
//     qty: "w-[9%]",
//     price: "w-[9%]",
//     type: "w-[9%]",
//     product: "w-[9%]",
//     validity: "w-[9%]"
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-white/60"
//       onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
//     >
//       <div className="bg-white rounded-sm shadow-xl max-w-3xl overflow-hidden">
//         {/* Header - sirf text ke neeche border */}
//         <div className="px-5 pt-4 pb-2"> {/* Padding adjusted */}
//           <h2 className="text-[16px] font-medium text-gray-800 border-b border-gray-200 pb-3">
//             Exit position{positions.length > 1 ? "s" : ""} ({positions.length})
//           </h2>
//         </div>

//         {/* Position List */}
//         <div className="px-5 py-1 max-h-70 overflow-y-auto">
//           <table className="w-full table-fixed">
//             <colgroup>
//               <col className={columnWidths.instrument} />
//               <col className={columnWidths.qty} />
//               <col className={columnWidths.price} />
//               <col className={columnWidths.type} />
//               <col className={columnWidths.product} />
//               <col className={columnWidths.validity} />
//             </colgroup>
//             <thead>
//               <tr className="border-b border-gray-200"> {/* Header ke neeche border */}
//                 <th className={tableStyles.header}></th>
//                 <th className={tableStyles.header}>Qty</th>
//                 <th className={tableStyles.header}>Price</th>
//                 <th className={tableStyles.header}>Type</th>
//                 <th className={tableStyles.header}>Product</th>
//                 <th className={tableStyles.header}>Validity</th>
//               </tr>
//             </thead>
//             <tbody>
//               {positions.map((pos) => (
//                 <tr
//                   key={pos.id}
//                   className={tableStyles.row} // Har row mein border-b
//                 >
//                   <td className={tableStyles.cell}>
//                     <div className="flex items-center gap-4">
//                       <span className="bg-red-100 px-2.5 py-0.5 text-red-500 text-[9px] whitespace-nowrap">SELL</span>
//                       <span>
//                         {pos.instrument} <span className="text-[10px] text-gray-600">({pos.exchange})</span>
//                       </span>
//                     </div>
//                   </td>
//                   <td className={tableStyles.cell}>
//                     {pos.netQty > 0 ? `${pos.netQty}` : pos.netQty}
//                   </td>
//                   <td className={tableStyles.cell}>
//                     -
//                   </td>
//                   <td className={tableStyles.cell}>
//                     {pos.type}
//                   </td>
//                   <td className={tableStyles.cell}>
//                     <span className="text-[11px] font-medium px-1.5 py-0.5 rounded">
//                       {pos.product}
//                     </span>
//                   </td>
//                   <td className={tableStyles.cell}>
//                     {pos.validity}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Actions - sirf buttons ke upar border */}
//         <div className="px-5 pb-4 pt-2"> {/* Padding adjusted */}
//           <div className="flex items-center justify-end gap-3 ">
//             <button
//               onClick={handleConfirm}
//               disabled={isLoading}
//               className={`py-1.5 px-6 rounded-xs bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
//                 }`}
//             >
//               {isLoading ? 'Exiting...' : 'Exit'}
//             </button>
//             <button
//               onClick={onCancel}
//               disabled={isLoading}
//               className="py-1.5 px-7 rounded-xs border border-gray-400 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect } from "react";
import toast from "react-hot-toast";
import type { DisplayRow } from "../../pages/Positions";

interface ExitConfirmModalProps {
  positions: DisplayRow[];
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

function formatNumber(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ExitConfirmModal({ positions, onConfirm, onCancel, loading = false }: ExitConfirmModalProps) {

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  // FIX 3: onConfirm is already async from parent (Positions.tsx handleModalConfirm)
  // toast is handled here for UX, parent handles actual API call + state reset
  const handleConfirm = async () => {
    try {
      await onConfirm();
      toast.success(`Exited ${positions.length} position${positions.length > 1 ? "s" : ""} successfully`);
    } catch {
      toast.error("Failed to exit positions. Please try again.");
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
              <col className="w-[38%]" />
              <col className="w-[10%]" />
              {/* FIX 3: Price column — live LTP dikhao */}
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200">
                <th className={tableStyles.header}>Instrument</th>
                <th className={tableStyles.header}>Qty</th>
                <th className={tableStyles.header}>Price (LTP)</th>
                <th className={tableStyles.header}>Type</th>
                <th className={tableStyles.header}>Product</th>
                <th className={tableStyles.header}>Validity</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => {
                // Exit direction: opposite of current position
                const exitSide = pos.transaction_type === "BUY" ? "SELL" : "BUY";

                return (
                  <tr key={pos.id} className={tableStyles.row}>
                    {/* Instrument */}
                    <td className={tableStyles.cell}>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold whitespace-nowrap rounded-sm
                          ${exitSide === "SELL"
                            ? "bg-red-50 text-red-500 border border-red-200"
                            : "bg-blue-50 text-blue-500 border border-blue-200"}`}>
                          {exitSide}
                        </span>
                        <span className="text-[13px] text-gray-700">
                          {pos.instrument}
                          <span className="text-[10px] text-gray-400 ml-1">({pos.exchange})</span>
                        </span>
                      </div>
                    </td>

                    {/* Qty */}
                    <td className={tableStyles.cell}>
                      {Math.abs(pos.netQty)}
                    </td>

                    {/* FIX 3: Price — live LTP from DisplayRow.price */}
                    <td className={`${tableStyles.cell} font-medium text-gray-800`}>
                      ₹{formatNumber(pos.price)}
                    </td>

                    {/* Order type */}
                    <td className={`${tableStyles.cell} text-gray-500`}>
                      {pos.type}
                    </td>

                    {/* Product */}
                    <td className={tableStyles.cell}>
                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {pos.product}
                      </span>
                    </td>

                    {/* Validity */}
                    <td className={`${tableStyles.cell} text-gray-500`}>
                      {pos.validity}
                    </td>
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