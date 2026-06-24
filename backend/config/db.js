import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  }
);

// 🔌 DB se connect + models sync karo. server.js se yahi function call hoga.
export const connectDB = async () => {
  await sequelize.authenticate();
  console.log("✅ PostgreSQL Connected");

  await sequelize.sync({ alter: true });
  console.log("✅ Models Synced");
};

export default sequelize;