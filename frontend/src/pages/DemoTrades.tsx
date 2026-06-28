// // pages/DemoTrades.tsx
// import { useState, useEffect } from "react";
// import { useDemoTradeStore } from "../store/useDemoTradeStore";
// import { useWatchlistStore } from "../store/useWatchlistStore"; // live quotes ke liye

// export default function DemoTrades() {
//   const { trades, loading, fetchTrades, closeTrade } = useDemoTradeStore();
//   const { quotes } = useWatchlistStore(); // existing live LTP polling reuse karte hain
//   const [tab, setTab] = useState<"OPEN" | "CLOSED">("OPEN");

//   useEffect(() => {
//     fetchTrades(tab);
//   }, [tab]);

//   const calcLivePnl = (trade: any) => {
//     if (trade.status === "CLOSED") return trade.pnl;
//     const q = quotes[trade.token];
//     const currentLtp = q?.ltp ?? trade.entry_price;
//     return trade.transaction_type === "BUY"
//       ? (currentLtp - trade.entry_price) * trade.quantity
//       : (trade.entry_price - currentLtp) * trade.quantity;
//   };

//   return (
//     <div className="p-6">
//       <div className="flex gap-2 mb-4">
//         <button
//           onClick={() => setTab("OPEN")}
//           className={`px-4 py-2 rounded text-sm font-medium ${tab === "OPEN" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
//         >
//           Open Positions
//         </button>
//         <button
//           onClick={() => setTab("CLOSED")}
//           className={`px-4 py-2 rounded text-sm font-medium ${tab === "CLOSED" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
//         >
//           History
//         </button>
//       </div>

//       {loading && <p className="text-sm text-gray-500">Loading...</p>}

//       <div className="space-y-2">
//         {trades.map((trade) => {
//           const pnl = calcLivePnl(trade);
//           const isProfit = pnl >= 0;

//           return (
//             <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
//               <div>
//                 <div className="font-semibold text-sm">{trade.name}</div>
//                 <div className="text-xs text-gray-500">
//                   {trade.transaction_type} • Qty: {trade.quantity} • Entry: ₹{trade.entry_price.toFixed(2)}
//                   {trade.status === "CLOSED" && ` • Exit: ₹${trade.exit_price?.toFixed(2)}`}
//                 </div>
//               </div>

//               <div className="text-right">
//                 <div className={`font-semibold text-sm ${isProfit ? "text-green-600" : "text-red-500"}`}>
//                   {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
//                 </div>
//                 {trade.status === "OPEN" && (
//                   <button
//                     onClick={() => closeTrade(trade.id)}
//                     className="text-xs text-red-600 hover:underline mt-1"
//                   >
//                     Close
//                   </button>
//                 )}
//               </div>
//             </div>
//           );
//         })}

//         {trades.length === 0 && !loading && (
//           <p className="text-sm text-gray-400 text-center py-8">No trades found</p>
//         )}
//       </div>
//     </div>
//   );
// }



import { useEffect } from "react";
import { useDemoTradeStore } from "../store/useDemoTradeStore";
import type { DemoPosition } from "../store/useDemoTradeStore";

export default function DemoTrades() {
  const { positions, liveQuotes, loading, fetchAll, placeOrder } = useDemoTradeStore();

  useEffect(() => {
    fetchAll();
  }, []);

  const calcLivePnl = (trade: DemoPosition) => {
    if (trade.status === "CLOSED") return trade.realised_pnl;
    const currentLtp = liveQuotes[trade.token]?.ltp ?? trade.average_price;
    return trade.transaction_type === "BUY"
      ? (currentLtp - trade.average_price) * trade.quantity
      : (trade.average_price - currentLtp) * Math.abs(trade.quantity);
  };

  const handleClose = async (trade: DemoPosition) => {
    if (!trade.transaction_type) return;
    await placeOrder({
      symbol: trade.symbol,
      name: trade.name,
      exchange: trade.exchange,
      token: trade.token,
      transaction_type: trade.transaction_type === "BUY" ? "SELL" : "BUY",
      quantity: Math.abs(trade.quantity),
      product: trade.product,
      order_type: "MARKET",
    });
    await fetchAll();
  };

  const openPositions = positions.filter((p) => p.status === "OPEN");
  const closedPositions = positions.filter((p) => p.status === "CLOSED");

  return (
    <div className="p-6">
      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {/* Open Positions */}
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Open Positions</h2>
      <div className="space-y-2 mb-6">
        {openPositions.map((trade) => {
          const pnl = calcLivePnl(trade);
          const isProfit = pnl >= 0;
          return (
            <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-semibold text-sm">{trade.name}</div>
                <div className="text-xs text-gray-500">
                  {trade.transaction_type} • Qty: {trade.quantity} • Entry: ₹{trade.average_price.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold text-sm ${isProfit ? "text-green-600" : "text-red-500"}`}>
                  {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
                </div>
                <button
                  onClick={() => handleClose(trade)}
                  className="text-xs text-red-600 hover:underline mt-1"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })}
        {openPositions.length === 0 && !loading && (
          <p className="text-sm text-gray-400 text-center py-8">No open positions</p>
        )}
      </div>

      {/* Closed / History */}
      <h2 className="text-sm font-semibold text-gray-700 mb-2">History</h2>
      <div className="space-y-2">
        {closedPositions.map((trade) => {
          const pnl = trade.realised_pnl;
          const isProfit = pnl >= 0;
          return (
            <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg opacity-70">
              <div>
                <div className="font-semibold text-sm">{trade.name}</div>
                <div className="text-xs text-gray-500">
                  {trade.transaction_type} • Qty: {trade.quantity} • Avg: ₹{trade.average_price.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold text-sm ${isProfit ? "text-green-600" : "text-red-500"}`}>
                  {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
        {closedPositions.length === 0 && !loading && (
          <p className="text-sm text-gray-400 text-center py-8">No history found</p>
        )}
      </div>
    </div>
  );
}