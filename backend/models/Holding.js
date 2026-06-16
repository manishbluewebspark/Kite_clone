import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Holding = sequelize.define(
  "Holding",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.STRING,
      allowNull: false,              // unique hata diya — ek user ke multiple holdings honge
    },

    // ── Stock Info ────────────────────────────────────────────────────────────
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,              // AWL, SUZLON, TCS etc.
    },

    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,              // Adani Wilmar Ltd
    },

    // kite | mtf | smallcase
    category: {
      type: DataTypes.ENUM("kite", "mtf", "smallcase"),
      allowNull: false,
      defaultValue: "kite",
    },

    // ── Quantity & Cost ───────────────────────────────────────────────────────
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    avg_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,            // average buy price per share
    },

    // ── Live Market Data ──────────────────────────────────────────────────────
    ltp: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,            // last traded price
    },

    // ── Computed Values ───────────────────────────────────────────────────────
    invested: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00,            // avg_cost * qty
    },

    cur_val: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00,            // ltp * qty
    },

    pnl: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00,            // cur_val - invested
    },

    pnl_percent: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0.00,            // (pnl / invested) * 100
    },

    net_chg: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0.00,            // same as pnl_percent
    },

    // ── Day Change ────────────────────────────────────────────────────────────
    day_chg_percent: {
      type: DataTypes.STRING(15),
      allowNull: true,               // "+1.80%" | "-0.35%"
    },

    day_chg_positive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,            // true = green, false = red
    },
    // ── Instrument identifiers (Angel One se save hote hain) ─────────────────
    token: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    exch_seg: {
      type: DataTypes.STRING(10),
      allowNull: true,        // NSE | BFO | NFO | MCX etc.
    },

    lot_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
  },
  {
    tableName: "holdings",
    timestamps: true,
    underscored: true,
  }
);

export default Holding;