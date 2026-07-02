// models/DemoPosition.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DemoPosition = sequelize.define("DemoPosition", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  symbol: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: true },
  exchange: { type: DataTypes.STRING, allowNull: false },
  token: { type: DataTypes.STRING, allowNull: false },
  product: { type: DataTypes.ENUM("MIS", "NRML"), defaultValue: "MIS" },

  // Net quantity — BUY = positive, SELL = negative
  // 0 matlab position closed, but row rehti hai (Kite bhi yehi karta hai)
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

  transaction_type: { type: DataTypes.ENUM("BUY", "SELL"), allowNull: true }, // null when flat

  // Weighted average buy/sell price
  average_price: { type: DataTypes.FLOAT, defaultValue: 0 },

  // Total buy/sell value for avg recalculation
  buy_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  buy_value: { type: DataTypes.FLOAT, defaultValue: 0 },  // sum of (price * qty) for all buys
  sell_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  sell_value: { type: DataTypes.FLOAT, defaultValue: 0 }, // sum of (price * qty) for all sells

  realised_pnl: { type: DataTypes.FLOAT, defaultValue: 0 },
  unrealised_pnl: { type: DataTypes.FLOAT, defaultValue: 0 },

  // day_change tracking
  last_price: { type: DataTypes.FLOAT, defaultValue: 0 }, // updated via socket

  // OPEN = net qty != 0, CLOSED = qty == 0 (row stays!)
  status: { type: DataTypes.ENUM("OPEN", "CLOSED"), defaultValue: "OPEN" },

  closed_at: { type: DataTypes.DATE, allowNull: true },
  auto_squared_off: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "demo_positions",
  timestamps: true,
  underscored: true,
});

export default DemoPosition;