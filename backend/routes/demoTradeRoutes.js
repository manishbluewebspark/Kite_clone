// import express from "express";
// import DemoTrade from "../models/DemoTrade.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { getLTP } from "../services/angelSession.js";
// import { subscribeInstrument, unsubscribeInstrument } from "../services/angelMarketSocket.js";
// import { getExchangeType } from "../utils/exchangeMap.js";

// const router = express.Router();

// // router.post("/open", authMiddleware, async (req, res) => {
// //   try {
// //     const {
// //       symbol,
// //       name,
// //       exchange,
// //       token,
// //       transaction_type,
// //       quantity,
// //       // ── New fields from OrderModal ──
// //       product = "MIS",           // "MIS" (Intraday) | "NRML" (Overnight)
// //       order_type = "MARKET",     // "MARKET" | "LIMIT" | "SL" | "SL-M"
// //       validity = "DAY",          // "DAY" | "IOC" | "MINUTES"
// //       price = 0,                 // Limit order price
// //       trigger_price = 0,         // SL/SL-M trigger
// //       market_protection = false,
// //     } = req.body;

// //     if (!symbol || !exchange || !token || !transaction_type || !quantity) {
// //       return res.status(400).json({ success: false, message: "All fields required" });
// //     }

// //     if (!["BUY", "SELL"].includes(transaction_type)) {
// //       return res.status(400).json({ success: false, message: "Invalid transaction_type" });
// //     }

// //     if (Number(quantity) <= 0) {
// //       return res.status(400).json({ success: false, message: "Quantity must be positive" });
// //     }

// //     const ltpData = await getLTP(exchange, symbol, token);
// //     const entryPrice = parseFloat(ltpData.ltp);

// //     const trade = await DemoTrade.create({
// //       user_id: req.user.id,
// //       symbol,
// //       name: name || symbol,
// //       exchange,
// //       token,
// //       transaction_type,
// //       quantity: Number(quantity),
// //       product: product.toUpperCase(),
// //       order_type: order_type.toUpperCase(),
// //       validity: validity.toUpperCase(),
// //       price: Number(price),
// //       trigger_price: Number(trigger_price),
// //       market_protection: Boolean(market_protection),
// //       entry_price: entryPrice,
// //       status: "OPEN",
// //     });

// //     try {
// //       const exchangeType = getExchangeType(exchange);
// //       subscribeInstrument(token, exchangeType);
// //     } catch (err) {
// //       console.error("Subscribe error:", err.message);
// //     }

// //     res.json({ success: true, data: trade });
// //   } catch (err) {
// //     console.error("Demo trade open error:", err.message);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });


// // Existing trade check karo — agar same symbol+exchange ka OPEN trade hai
// // to naya create mat karo, existing update karo (qty add karo, avg recalculate)


// router.post("/open", authMiddleware, async (req, res) => {
//   try {
//     const { symbol, name, exchange, token, transaction_type, quantity } = req.body;

//     if (!symbol || !exchange || !token || !transaction_type || !quantity) {
//       return res.status(400).json({ success: false, message: "All fields required" });
//     }

//     if (!["BUY", "SELL"].includes(transaction_type)) {
//       return res.status(400).json({ success: false, message: "Invalid transaction_type" });
//     }

//     if (Number(quantity) <= 0) {
//       return res.status(400).json({ success: false, message: "Quantity must be positive" });
//     }

//     const ltpData = await getLTP(exchange, symbol, token);
//     const newPrice = parseFloat(ltpData.ltp);
//     const newQty = Number(quantity);

//     // ── Existing OPEN position check (same user + symbol + exchange) ──────────
//     const existing = await DemoTrade.findOne({
//       where: {
//         user_id: req.user.id,
//         symbol,
//         exchange,
//         status: "OPEN",
//       },
//     });

//     let trade;

//     if (existing) {
//       const existingQty = existing.transaction_type === "BUY"
//         ? existing.quantity
//         : -existing.quantity;

//       const incomingQty = transaction_type === "BUY" ? newQty : -newQty;

//       const netQty = existingQty + incomingQty;

//       if (netQty === 0) {
//         // ── Position fully squared off ─────────────────────────────────────
//         const pnl = existing.transaction_type === "BUY"
//           ? (newPrice - existing.entry_price) * existing.quantity
//           : (existing.entry_price - newPrice) * existing.quantity;

//         await existing.update({
//           quantity: 0,
//           exit_price: newPrice,
//           status: "CLOSED",
//           pnl: parseFloat(pnl.toFixed(2)),
//           closed_at: new Date(),
//         });

//         trade = existing;

//         // Unsubscribe
//         try {
//           const { subscribeInstrument, unsubscribeInstrument } = await import("../services/angelMarketSocket.js");
//           const { getExchangeType } = await import("../utils/exchangeMap.js");
//           const exchangeType = getExchangeType(exchange);
//           unsubscribeInstrument(token, exchangeType);
//         } catch (err) {
//           console.error("Unsubscribe error:", err.message);
//         }

//       } else if (Math.sign(netQty) === Math.sign(existingQty)) {
//         // ── Same direction — qty add karo, avg recalculate ─────────────────
//         const existingValue = existing.entry_price * existing.quantity;
//         const newValue = newPrice * newQty;
//         const totalQty = existing.quantity + newQty;
//         const newAvg = (existingValue + newValue) / totalQty;

//         await existing.update({
//           quantity: totalQty,
//           entry_price: parseFloat(newAvg.toFixed(2)),
//         });

//         trade = existing;

//       } else {
//         // ── Partial close / direction flip ────────────────────────────────
//         const absNetQty = Math.abs(netQty);
//         const newDirection = netQty > 0 ? "BUY" : "SELL";

//         // Partial P&L calculate karo (jo qty close hui uski)
//         const closedQty = existing.quantity - absNetQty;
//         const partialPnl = existing.transaction_type === "BUY"
//           ? (newPrice - existing.entry_price) * closedQty
//           : (existing.entry_price - newPrice) * closedQty;

//         await existing.update({
//           quantity: absNetQty,
//           transaction_type: newDirection,
//           entry_price: newPrice, // naye direction ka entry price = current LTP
//           pnl: parseFloat((existing.pnl + partialPnl).toFixed(2)),
//         });

//         trade = existing;
//       }

//     } else {
//       // ── Naya position create karo ─────────────────────────────────────────
//       trade = await DemoTrade.create({
//         user_id: req.user.id,
//         symbol,
//         name: name || symbol,
//         exchange,
//         token,
//         transaction_type,
//         quantity: newQty,
//         entry_price: newPrice,
//         status: "OPEN",
//       });

//       // Subscribe
//       try {
//         const { subscribeInstrument } = await import("../services/angelMarketSocket.js");
//         const { getExchangeType } = await import("../utils/exchangeMap.js");
//         const exchangeType = getExchangeType(exchange);
//         subscribeInstrument(token, exchangeType);
//       } catch (err) {
//         console.error("Subscribe error:", err.message);
//       }
//     }

//     res.json({ success: true, data: trade });
//   } catch (err) {
//     console.error("Demo trade open error:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });


// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const { status } = req.query;
//     const where = { user_id: req.user.id };
//     if (status) where.status = status.toUpperCase();

//     const trades = await DemoTrade.findAll({
//       where,
//       order: [["created_at", "DESC"]],
//     });

//     res.json({ success: true, data: trades });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.post("/:id/close", authMiddleware, async (req, res) => {
//   try {
//     const trade = await DemoTrade.findOne({
//       where: { id: req.params.id, user_id: req.user.id, status: "OPEN" },
//     });

//     if (!trade) {
//       return res.status(404).json({ success: false, message: "Open trade not found" });
//     }

//     const ltpData = await getLTP(trade.exchange, trade.symbol, trade.token);
//     const exitPrice = parseFloat(ltpData.ltp);

//     const pnl =
//       trade.transaction_type === "BUY"
//         ? (exitPrice - trade.entry_price) * trade.quantity
//         : (trade.entry_price - exitPrice) * trade.quantity;

//     await trade.update({
//       exit_price: exitPrice,
//       status: "CLOSED",
//       pnl: parseFloat(pnl.toFixed(2)),
//       closed_at: new Date(),
//     });

//     try {
//       const otherOpenTrades = await DemoTrade.count({
//         where: { token: trade.token, status: "OPEN" },
//       });
//       if (otherOpenTrades === 0) {
//         const exchangeType = getExchangeType(trade.exchange);
//         unsubscribeInstrument(trade.token, exchangeType);
//       }
//     } catch (err) {
//       console.error("Unsubscribe error:", err.message);
//     }

//     res.json({ success: true, data: trade });
//   } catch (err) {
//     console.error("Demo trade close error:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const trade = await DemoTrade.findOne({
//       where: { id: req.params.id, user_id: req.user.id },
//     });

//     if (!trade) {
//       return res.status(404).json({ success: false, message: "Trade not found" });
//     }

//     await trade.destroy();
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// export default router;


import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getLTP } from "../services/angelSession.js";
import { subscribeInstrument, unsubscribeInstrument } from "../services/angelMarketSocket.js";
import { getExchangeType } from "../utils/exchangeMap.js";
import DemoOrder from "../models/DemoOrder.js";
import DemoPosition from "../models/DemoPosition.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /demo-trade/order  ← Kite ka "Place Order" equivalent
// Har ek trade yahan aata hai — order bhi save hota hai, position bhi update
// ─────────────────────────────────────────────────────────────────────────────
router.post("/order", authMiddleware, async (req, res) => {
  try {
    const {
      symbol, name, exchange, token,
      transaction_type, quantity,
      product = "MIS",
      order_type = "MARKET",
      validity = "DAY",
      price = 0,
      trigger_price = 0,
    } = req.body;

    if (!symbol || !exchange || !token || !transaction_type || !quantity) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }
    if (!["BUY", "SELL"].includes(transaction_type)) {
      return res.status(400).json({ success: false, message: "Invalid transaction_type" });
    }
    if (Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be positive" });
    }

    // ── 1. LTP fetch karo ───────────────────────────────────────────────────
    const ltpData = await getLTP(exchange, symbol, token);
    const executedPrice = parseFloat(ltpData.ltp);
    const newQty = Number(quantity);

    // ── 2. Order history save karo (always, har trade ka record) ───────────
    const order = await DemoOrder.create({
      user_id: req.user.id,
      symbol,
      name: name || symbol,
      exchange,
      token,
      transaction_type,
      quantity: newQty,
      product: product.toUpperCase(),
      order_type: order_type.toUpperCase(),
      validity: validity.toUpperCase(),
      price: Number(price),
      trigger_price: Number(trigger_price),
      executed_price: executedPrice,
      status: "COMPLETE",
    });

    // ── 3. Position find karo — same user + symbol + exchange + product ─────
    // Kite: ek instrument ka ek hi position row hoti hai per product type
    let position = await DemoPosition.findOne({
      where: {
        user_id: req.user.id,
        symbol,
        exchange,
        product: product.toUpperCase(),
      },
    });

    if (!position) {
      // ── 3a. Pehli baar — naya position create karo ──────────────────────
      position = await DemoPosition.create({
        user_id: req.user.id,
        symbol,
        name: name || symbol,
        exchange,
        token,
        product: product.toUpperCase(),
        quantity: transaction_type === "BUY" ? newQty : -newQty,
        transaction_type,
        average_price: executedPrice,
        buy_quantity: transaction_type === "BUY" ? newQty : 0,
        buy_value: transaction_type === "BUY" ? executedPrice * newQty : 0,
        sell_quantity: transaction_type === "SELL" ? newQty : 0,
        sell_value: transaction_type === "SELL" ? executedPrice * newQty : 0,
        last_price: executedPrice,
        status: "OPEN",
      });

      // Subscribe to live feed
      try {
        const exchangeType = getExchangeType(exchange);
        subscribeInstrument(token, exchangeType);
      } catch (err) {
        console.error("Subscribe error:", err.message);
      }

    } else {
      // ── 3b. Existing position update karo ──────────────────────────────
      const prevNetQty = position.quantity; // positive=long, negative=short
      const incomingQty = transaction_type === "BUY" ? newQty : -newQty;
      const netQty = prevNetQty + incomingQty;

      // Buy/Sell totals update (Kite yahi track karta hai)
      const newBuyQty = position.buy_quantity + (transaction_type === "BUY" ? newQty : 0);
      const newBuyVal = position.buy_value + (transaction_type === "BUY" ? executedPrice * newQty : 0);
      const newSellQty = position.sell_quantity + (transaction_type === "SELL" ? newQty : 0);
      const newSellVal = position.sell_value + (transaction_type === "SELL" ? executedPrice * newQty : 0);

      // ── Realised P&L calculate karo ─────────────────────────────────────
      // Formula: Kite ka exact formula
      // realised = (sell_value - buy_value) for the matched/netted quantity
      let realisedPnl = position.realised_pnl;

      if (netQty === 0) {
        // Fully flat — total realised = total sell value - total buy value
        realisedPnl = newSellVal - newBuyVal;
      } else if (Math.sign(netQty) !== Math.sign(prevNetQty) && prevNetQty !== 0) {
        // Direction flip — pehle flat kiya, phir reverse
        // Jo qty flat hui uski P&L add karo
        const flatQty = Math.abs(prevNetQty);
        if (prevNetQty > 0) {
          // Was long, sell aaya — flat P&L
          realisedPnl += (executedPrice - position.average_price) * flatQty;
        } else {
          // Was short, buy aaya — flat P&L
          realisedPnl += (position.average_price - executedPrice) * flatQty;
        }
      }

      // ── Average price recalculate ────────────────────────────────────────
      let newAvgPrice = position.average_price;

      if (netQty === 0) {
        newAvgPrice = 0; // flat
      } else if (Math.sign(netQty) === Math.sign(prevNetQty)) {
        // Same direction — weighted average
        if (netQty > 0) {
          newAvgPrice = newBuyVal / newBuyQty;
        } else {
          newAvgPrice = newSellVal / newSellQty;
        }
      } else {
        // Direction flip — naya avg = current executed price
        newAvgPrice = executedPrice;
      }

      const newTransactionType = netQty > 0 ? "BUY" : netQty < 0 ? "SELL" : null;
      const newStatus = netQty === 0 ? "CLOSED" : "OPEN";

      await position.update({
        quantity: netQty,
        transaction_type: newTransactionType,
        average_price: parseFloat(newAvgPrice.toFixed(2)),
        buy_quantity: newBuyQty,
        buy_value: parseFloat(newBuyVal.toFixed(2)),
        sell_quantity: newSellQty,
        sell_value: parseFloat(newSellVal.toFixed(2)),
        realised_pnl: parseFloat(realisedPnl.toFixed(2)),
        last_price: executedPrice,
        status: newStatus,
        closed_at: netQty === 0 ? new Date() : null,
      });

      // Unsubscribe if fully flat
      if (netQty === 0) {
        try {
          const exchangeType = getExchangeType(exchange);
          unsubscribeInstrument(token, exchangeType);
        } catch (err) {
          console.error("Unsubscribe error:", err.message);
        }
      }
    }

    res.json({ success: true, order, position });

  } catch (err) {
    console.error("Demo order error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /demo-trade/orders   ← Order book (all orders)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await DemoOrder.findAll({
      where: { user_id: req.user.id },
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /demo-trade/positions  ← Positions tab (Kite jaisa)
// ?status=OPEN  ya  ?status=CLOSED  ya kuch nahi = sab
// ─────────────────────────────────────────────────────────────────────────────
router.get("/positions", authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status.toUpperCase();

    const positions = await DemoPosition.findAll({
      where,
      order: [["updated_at", "DESC"]],
    });
    res.json({ success: true, data: positions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /demo-trade/orders/:id  ← Order history se delete (optional)
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/orders/:id", authMiddleware, async (req, res) => {
  try {
    const order = await DemoOrder.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    await order.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;