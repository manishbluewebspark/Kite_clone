import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const KiteSession = sequelize.define(
  "KiteSession",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // ek user ka ek hi active Kite session
    },
    kite_api_key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    kite_api_secret: {
      type: DataTypes.TEXT,
      allowNull: false, // encrypted store karna chahiye production me
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    public_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kite_user_id: {
      type: DataTypes.STRING, // Zerodha ka client ID jo profile se aata hai
      allowNull: true,
    },
    login_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "kite_sessions",
    timestamps: true,
    underscored: true,
  }
);

export default KiteSession;