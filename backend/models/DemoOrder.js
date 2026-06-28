// models/DemoOrder.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DemoOrder = sequelize.define("DemoOrder", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  symbol: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: true },
  exchange: { type: DataTypes.STRING, allowNull: false },
  token: { type: DataTypes.STRING, allowNull: false },
  transaction_type: { type: DataTypes.ENUM("BUY", "SELL"), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  product: { type: DataTypes.ENUM("MIS", "NRML"), defaultValue: "MIS" },
  order_type: { type: DataTypes.ENUM("MARKET", "LIMIT", "SL", "SL-M"), defaultValue: "MARKET" },
  validity: { type: DataTypes.ENUM("DAY", "IOC", "MINUTES"), defaultValue: "DAY" },
  price: { type: DataTypes.FLOAT, defaultValue: 0 },
  trigger_price: { type: DataTypes.FLOAT, defaultValue: 0 },
  executed_price: { type: DataTypes.FLOAT, allowNull: false }, // actual LTP
  status: { type: DataTypes.ENUM("COMPLETE", "REJECTED", "CANCELLED"), defaultValue: "COMPLETE" },
}, {
  tableName: "demo_orders",
  timestamps: true,
  underscored: true,
});

export default DemoOrder;