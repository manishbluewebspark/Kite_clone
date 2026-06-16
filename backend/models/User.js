import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    api_key: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    secret_key: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    account_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

export default User;