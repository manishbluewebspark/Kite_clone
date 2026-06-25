import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DemoTrade = sequelize.define(
  "DemoTrade",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    exchange: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transaction_type: {
      type: DataTypes.ENUM("BUY", "SELL"),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // ── Order config fields ──────────────────────────────────────────────────
    product: {
      type: DataTypes.ENUM("MIS", "NRML"),
      defaultValue: "MIS", // Intraday = MIS, Overnight = NRML
    },
    order_type: {
      type: DataTypes.ENUM("MARKET", "LIMIT", "SL", "SL-M"),
      defaultValue: "MARKET",
    },
    validity: {
      type: DataTypes.ENUM("DAY", "IOC", "MINUTES"),
      defaultValue: "DAY",
    },
    price: {
      type: DataTypes.FLOAT,
      defaultValue: 0, // Limit order ke liye price, Market = 0
    },
    trigger_price: {
      type: DataTypes.FLOAT,
      defaultValue: 0, // SL/SL-M ke liye
    },
    market_protection: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // ── Trade lifecycle fields ───────────────────────────────────────────────
    entry_price: {
      type: DataTypes.FLOAT,
      allowNull: false, // actual execution price (LTP at time of order)
    },
    exit_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("OPEN", "CLOSED"),
      defaultValue: "OPEN",
    },
    pnl: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    opened_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "demo_trades",
    timestamps: true,
    underscored: true,
  }
);

export default DemoTrade;