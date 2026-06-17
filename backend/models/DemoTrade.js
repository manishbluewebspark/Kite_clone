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
      allowNull: true, // display name (formatted label)
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
    entry_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
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