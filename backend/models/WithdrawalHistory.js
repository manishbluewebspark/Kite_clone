import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Fund from "./Fund.js";

const WithdrawalHistory = sequelize.define(
  "WithdrawalHistory",
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

    fund_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Fund,
        key: "id",
      },
    },

    // ref no jo bank se aata hai (processed hone ke baad)
    ref_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    segment: {
      type: DataTypes.ENUM("equity", "commodity"),
      allowNull: false,
      defaultValue: "equity",
    },

    amount_requested: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    amount_processed: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,   // null jab tak process na ho
    },

    withdrawal_type: {
      type: DataTypes.ENUM("regular", "instant", "park"),
      allowNull: false,
      defaultValue: "regular",
    },

    // PENDING | PROCESSED | FAILED
    status: {
      type: DataTypes.ENUM("PENDING", "PROCESSED", "FAILED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    bank_account: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // failure reason (agar FAILED ho)
    failure_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // jab actually process hua
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "withdrawal_histories",
    timestamps: true,      // createdAt = withdrawal initiate time
    underscored: true,
  }
);

// Association
Fund.hasMany(WithdrawalHistory, { foreignKey: "fund_id" });
WithdrawalHistory.belongsTo(Fund, { foreignKey: "fund_id" });

export default WithdrawalHistory;