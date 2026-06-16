// models/Watchlist.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Watchlist = sequelize.define("Watchlist", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    groupNo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, // tab 1-7
    symbol: { type: DataTypes.STRING, allowNull: false },
    exchange: { type: DataTypes.STRING, allowNull: false }, // NSE, BSE, BFO, NFO, INDEX
    token: { type: DataTypes.STRING, allowNull: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default Watchlist;