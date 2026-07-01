// import express from "express";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { getLTP } from "../services/angelSession.js";
// import { subscribeInstrument, unsubscribeInstrument } from "../services/angelMarketSocket.js";
// import { getExchangeType } from "../utils/exchangeMap.js";
// import DemoOrder from "../models/DemoOrder.js";
// import DemoPosition from "../models/DemoPosition.js";

// const router = express.Router();

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /demo-trade/order  ← Kite ka "Place Order" equivalent
// // Har ek trade yahan aata hai — order bhi save hota hai, position bhi update
// // ─────────────────────────────────────────────────────────────────────────────
// router.post("/order", authMiddleware, async (req, res) => {
//   try {
//     const {
//       symbol, name, exchange, token,
//       transaction_type, quantity,
//       product = "MIS",
//       order_type = "MARKET",
//       validity = "DAY",
//       price = 0,
//       trigger_price = 0,
//     } = req.body;

//     if (!symbol || !exchange || !token || !transaction_type || !quantity) {
//       return res.status(400).json({ success: false, message: "All fields required" });
//     }
//     if (!["BUY", "SELL"].includes(transaction_type)) {
//       return res.status(400).json({ success: false, message: "Invalid transaction_type" });
//     }
//     if (Number(quantity) <= 0) {
//       return res.status(400).json({ success: false, message: "Quantity must be positive" });
//     }

//     // ── 1. LTP fetch karo ───────────────────────────────────────────────────
//     const ltpData = await getLTP(exchange, symbol, token);
//     const executedPrice = parseFloat(ltpData.ltp);
//     const newQty = Number(quantity);

//     // ── 2. Order history save karo (always, har trade ka record) ───────────
//     const order = await DemoOrder.create({
//       user_id: req.user.id,
//       symbol,
//       name: name || symbol,
//       exchange,
//       token,
//       transaction_type,
//       quantity: newQty,
//       product: product.toUpperCase(),
//       order_type: order_type.toUpperCase(),
//       validity: validity.toUpperCase(),
//       price: Number(price),
//       trigger_price: Number(trigger_price),
//       executed_price: executedPrice,
//       status: "COMPLETE",
//     });

//     // ── 3. Position find karo — same user + symbol + exchange + product ─────
//     // Kite: ek instrument ka ek hi position row hoti hai per product type
//     let position = await DemoPosition.findOne({
//       where: {
//         user_id: req.user.id,
//         symbol,
//         exchange,
//         product: product.toUpperCase(),
//       },
//     });

//     if (!position) {
//       // ── 3a. Pehli baar — naya position create karo ──────────────────────
//       position = await DemoPosition.create({
//         user_id: req.user.id,
//         symbol,
//         name: name || symbol,
//         exchange,
//         token,
//         product: product.toUpperCase(),
//         quantity: transaction_type === "BUY" ? newQty : -newQty,
//         transaction_type,
//         average_price: executedPrice,
//         buy_quantity: transaction_type === "BUY" ? newQty : 0,
//         buy_value: transaction_type === "BUY" ? executedPrice * newQty : 0,
//         sell_quantity: transaction_type === "SELL" ? newQty : 0,
//         sell_value: transaction_type === "SELL" ? executedPrice * newQty : 0,
//         last_price: executedPrice,
//         status: "OPEN",
//       });

//       // Subscribe to live feed
//       try {
//         const exchangeType = getExchangeType(exchange);
//         subscribeInstrument(token, exchangeType);
//       } catch (err) {
//         console.error("Subscribe error:", err.message);
//       }

//     } else {
//       // ── 3b. Existing position update karo ──────────────────────────────
//       const prevNetQty = position.quantity; // positive=long, negative=short
//       const incomingQty = transaction_type === "BUY" ? newQty : -newQty;
//       const netQty = prevNetQty + incomingQty;

//       // Buy/Sell totals update (Kite yahi track karta hai)
//       const newBuyQty = position.buy_quantity + (transaction_type === "BUY" ? newQty : 0);
//       const newBuyVal = position.buy_value + (transaction_type === "BUY" ? executedPrice * newQty : 0);
//       const newSellQty = position.sell_quantity + (transaction_type === "SELL" ? newQty : 0);
//       const newSellVal = position.sell_value + (transaction_type === "SELL" ? executedPrice * newQty : 0);

//       // ── Realised P&L calculate karo ─────────────────────────────────────
//       // Formula: Kite ka exact formula
//       // realised = (sell_value - buy_value) for the matched/netted quantity
//       let realisedPnl = position.realised_pnl;

//       if (netQty === 0) {
//         // Fully flat — total realised = total sell value - total buy value
//         realisedPnl = newSellVal - newBuyVal;
//       } else if (Math.sign(netQty) !== Math.sign(prevNetQty) && prevNetQty !== 0) {
//         // Direction flip — pehle flat kiya, phir reverse
//         // Jo qty flat hui uski P&L add karo
//         const flatQty = Math.abs(prevNetQty);
//         if (prevNetQty > 0) {
//           // Was long, sell aaya — flat P&L
//           realisedPnl += (executedPrice - position.average_price) * flatQty;
//         } else {
//           // Was short, buy aaya — flat P&L
//           realisedPnl += (position.average_price - executedPrice) * flatQty;
//         }
//       }

//       // ── Average price recalculate ────────────────────────────────────────
//       let newAvgPrice = position.average_price;

//       if (netQty === 0) {
//         newAvgPrice = 0; // flat
//       } else if (Math.sign(netQty) === Math.sign(prevNetQty)) {
//         // Same direction — weighted average
//         if (netQty > 0) {
//           newAvgPrice = newBuyVal / newBuyQty;
//         } else {
//           newAvgPrice = newSellVal / newSellQty;
//         }
//       } else {
//         // Direction flip — naya avg = current executed price
//         newAvgPrice = executedPrice;
//       }

//       const newTransactionType = netQty > 0 ? "BUY" : netQty < 0 ? "SELL" : null;
//       const newStatus = netQty === 0 ? "CLOSED" : "OPEN";

//       await position.update({
//         quantity: netQty,
//         transaction_type: newTransactionType,
//         average_price: parseFloat(newAvgPrice.toFixed(2)),
//         buy_quantity: newBuyQty,
//         buy_value: parseFloat(newBuyVal.toFixed(2)),
//         sell_quantity: newSellQty,
//         sell_value: parseFloat(newSellVal.toFixed(2)),
//         realised_pnl: parseFloat(realisedPnl.toFixed(2)),
//         last_price: executedPrice,
//         status: newStatus,
//         closed_at: netQty === 0 ? new Date() : null,
//       });

//       // Unsubscribe if fully flat
//       if (netQty === 0) {
//         try {
//           const exchangeType = getExchangeType(exchange);
//           unsubscribeInstrument(token, exchangeType);
//         } catch (err) {
//           console.error("Unsubscribe error:", err.message);
//         }
//       }
//     }

//     res.json({ success: true, order, position });

//   } catch (err) {
//     console.error("Demo order error:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /demo-trade/orders   ← Order book (all orders)
// // ─────────────────────────────────────────────────────────────────────────────
// router.get("/orders", authMiddleware, async (req, res) => {
//   try {
//     const orders = await DemoOrder.findAll({
//       where: { user_id: req.user.id },
//       order: [["created_at", "DESC"]],
//     });
//     res.json({ success: true, data: orders });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /demo-trade/positions  ← Positions tab (Kite jaisa)
// // ?status=OPEN  ya  ?status=CLOSED  ya kuch nahi = sab
// // ─────────────────────────────────────────────────────────────────────────────
// router.get("/positions", authMiddleware, async (req, res) => {
//   try {
//     const { status } = req.query;
//     const where = { user_id: req.user.id };
//     if (status) where.status = status.toUpperCase();

//     const positions = await DemoPosition.findAll({
//       where,
//       order: [["updated_at", "DESC"]],
//     });
//     res.json({ success: true, data: positions });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // DELETE /demo-trade/orders/:id  ← Order history se delete (optional)
// // ─────────────────────────────────────────────────────────────────────────────
// router.delete("/orders/:id", authMiddleware, async (req, res) => {
//   try {
//     const order = await DemoOrder.findOne({
//       where: { id: req.params.id, user_id: req.user.id },
//     });
//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });
//     await order.destroy();
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// export default router;


import express from "express";
import { Op } from "sequelize";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getLTP } from "../services/angelSession.js";
import { subscribeInstrument, unsubscribeInstrument } from "../services/angelMarketSocket.js";
import { getExchangeType } from "../utils/exchangeMap.js";
import { isPastMarketClose, getTodayRangeUTC } from "../utils/marketTiming.js";
import DemoOrder from "../models/DemoOrder.js";
import DemoPosition from "../models/DemoPosition.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Market band hone ke baad saari OPEN positions auto square-off karo
// ─────────────────────────────────────────────────────────────────────────────
const autoSquareOffExpiredPositions = async (userId) => {
  if (!isPastMarketClose()) return;

  const { start } = getTodayRangeUTC();

  // Sirf aaj ki open positions jo abhi tak close nahi hui
  const openPositions = await DemoPosition.findAll({
    where: {
      user_id: userId,
      status: "OPEN",
      created_at: { [Op.gte]: start },
    },
  });

  for (const position of openPositions) {
    const netQty = position.quantity;
    if (netQty === 0) continue;

    const closingPrice = position.last_price; // market band, last known LTP use karo
    let realisedPnl = position.realised_pnl;

    if (netQty > 0) {
      // Long tha — sell karke square-off
      realisedPnl += (closingPrice - position.average_price) * netQty;
    } else {
      // Short tha — buy karke square-off
      realisedPnl += (position.average_price - closingPrice) * Math.abs(netQty);
    }

    await position.update({
      quantity: 0,
      transaction_type: null,
      average_price: 0,
      realised_pnl: parseFloat(realisedPnl.toFixed(2)),
      last_price: closingPrice,
      status: "CLOSED",
      closed_at: new Date(),
      auto_squared_off: true, // optional flag — model me column add karna hoga (BOOLEAN, default false)
    });

    try {
      const exchangeType = getExchangeType(position.exchange);
      unsubscribeInstrument(position.token, exchangeType);
    } catch (err) {
      console.error("Auto square-off unsubscribe error:", err.message);
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /demo-trade/order  (koi change nahi — same as before)
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

    // Market band hai to naya order allow mat karo (Kite bhi yahi karta hai)
    if (isPastMarketClose()) {
      return res.status(400).json({ success: false, message: "Market is closed. Trading resumes at 9:15 AM." });
    }

    const ltpData = await getLTP(exchange, symbol, token);
    const executedPrice = parseFloat(ltpData.ltp);
    const newQty = Number(quantity);

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

    let position = await DemoPosition.findOne({
      where: {
        user_id: req.user.id,
        symbol,
        exchange,
        product: product.toUpperCase(),
        status: "OPEN", // sirf aaj ki open position match karo, purani closed wali nahi
      },
    });

    if (!position) {
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

      try {
        const exchangeType = getExchangeType(exchange);
        subscribeInstrument(token, exchangeType);
      } catch (err) {
        console.error("Subscribe error:", err.message);
      }

    } else {
      const prevNetQty = position.quantity;
      const incomingQty = transaction_type === "BUY" ? newQty : -newQty;
      const netQty = prevNetQty + incomingQty;

      const newBuyQty = position.buy_quantity + (transaction_type === "BUY" ? newQty : 0);
      const newBuyVal = position.buy_value + (transaction_type === "BUY" ? executedPrice * newQty : 0);
      const newSellQty = position.sell_quantity + (transaction_type === "SELL" ? newQty : 0);
      const newSellVal = position.sell_value + (transaction_type === "SELL" ? executedPrice * newQty : 0);

      let realisedPnl = position.realised_pnl;

      if (netQty === 0) {
        realisedPnl = newSellVal - newBuyVal;
      } else if (Math.sign(netQty) !== Math.sign(prevNetQty) && prevNetQty !== 0) {
        const flatQty = Math.abs(prevNetQty);
        if (prevNetQty > 0) {
          realisedPnl += (executedPrice - position.average_price) * flatQty;
        } else {
          realisedPnl += (position.average_price - executedPrice) * flatQty;
        }
      }

      let newAvgPrice = position.average_price;

      if (netQty === 0) {
        newAvgPrice = 0;
      } else if (Math.sign(netQty) === Math.sign(prevNetQty)) {
        if (netQty > 0) {
          newAvgPrice = newBuyVal / newBuyQty;
        } else {
          newAvgPrice = newSellVal / newSellQty;
        }
      } else {
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
// GET /demo-trade/orders  ← Aaj ke orders hi (previous day exclude)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    const { start, end } = getTodayRangeUTC();
    const orders = await DemoOrder.findAll({
      where: {
        user_id: req.user.id,
        created_at: { [Op.between]: [start, end] },
      },
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /demo-trade/positions  ← Sirf AAJ ki positions, purani nahi
// Market band hai to auto square-off pehle chala do
// ─────────────────────────────────────────────────────────────────────────────
router.get("/positions", authMiddleware, async (req, res) => {
  try {
    await autoSquareOffExpiredPositions(req.user.id);

    const { status } = req.query;
    const { start, end } = getTodayRangeUTC();

    const where = {
      user_id: req.user.id,
      created_at: { [Op.between]: [start, end] }, // aaj ki hi
    };
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
// DELETE /demo-trade/orders/:id  (koi change nahi)
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