import "dotenv/config";
import { createDatabaseConnection, initializeDatabaseTables } from "./connection";

async function runMigrations() {
  console.log("🚀 Starting Database Migrations...");
  try {
    const { sqlite, db } = createDatabaseConnection("");
    await initializeDatabaseTables(sqlite);
    console.log("✅ Database Migrations Completed Successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database Migration Failed:", error);
    process.exit(1);
  }
}

runMigrations();
