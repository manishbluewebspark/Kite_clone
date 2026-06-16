import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Fund = sequelize.define(
  "Fund",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ── Segment: equity | commodity ──────────────────────────────────────────
    segment: {
      type: DataTypes.ENUM("equity", "commodity"),
      allowNull: false,
      defaultValue: "equity",
    },

    // ── Core balances ────────────────────────────────────────────────────────
    available_margin: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    used_margin: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    available_cash: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    opening_balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    // ── Transactions ─────────────────────────────────────────────────────────
    payin: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    payout: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    // ── Margin components ────────────────────────────────────────────────────
    span: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    delivery_margin: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    exposure: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    options_premium: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    // ── Collateral (equity segment only) ────────────────────────────────────
    collateral_liquid_funds: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    collateral_equity: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    total_collateral: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    // ── Withdraw fields ──────────────────────────────────────────────────────
    withdrawable_balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    // withdrawal_type: regular | instant | park
    withdrawal_type: {
      type: DataTypes.ENUM("regular", "instant", "park"),
      allowNull: true,
    },

    // last withdraw amount requested
    last_withdraw_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },

    // ── Add Funds fields ─────────────────────────────────────────────────────
    // payment_mode: upi | netbanking
    payment_mode: {
      type: DataTypes.ENUM("upi", "netbanking"),
      allowNull: true,
    },

    bank_account: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    upi_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "funds",
    timestamps: true,           // createdAt, updatedAt auto
    underscored: true,          // camelCase → snake_case in DB
  }
);

export default Fund;