// services/squareOffService.js
import { Op } from "sequelize";
import DemoPosition from "../models/DemoPosition.js";
import { getExchangeType } from "../utils/exchangeMap.js";
import { unsubscribeInstrument } from "./angelMarketSocket.js";

export const autoSquareOffAllUsers = async () => {
  const openPositions = await DemoPosition.findAll({
    where: { status: "OPEN", quantity: { [Op.ne]: 0 } },
  });

  console.log(`🔔 Auto square-off: ${openPositions.length} open positions found`);

  for (const position of openPositions) {
    try {
      const netQty = position.quantity;
      const closingPrice = position.last_price;
      let realisedPnl = position.realised_pnl;

      if (netQty > 0) {
        realisedPnl += (closingPrice - position.average_price) * netQty;
      } else {
        realisedPnl += (position.average_price - closingPrice) * Math.abs(netQty);
      }

      await position.update({
        quantity: 0,
        transaction_type: null,
        average_price: 0,
        realised_pnl: parseFloat(realisedPnl.toFixed(2)),
        status: "CLOSED",
        closed_at: new Date(),
        auto_squared_off: true,
      });

      const exchangeType = getExchangeType(position.exchange);
      unsubscribeInstrument(position.token, exchangeType);
    } catch (err) {
      console.error(`Square-off failed for position ${position.id}:`, err.message);
      // Loop continue rahega, ek position fail hone se baaki na ruke
    }
  }

  console.log(`✅ Auto square-off complete`);
};