import { readFileSync } from "fs";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
});

const sql = readFileSync("./migrations/init.sql", "utf-8");

async function runMigration() {
  try {
    await client.connect();
    await client.query(sql);
    console.log("✅ Migration done!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();