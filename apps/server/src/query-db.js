const {
  WorkspaceManager,
  knowledgeSources,
  businessEntities,
  observations,
} = require("@business-os/workspace");
const manager = new WorkspaceManager();

async function dump() {
  const ws = manager.active();
  console.log("Active Workspace:", ws);
  const db = manager.db;
  if (!db) {
    console.log("No active database connection.");
    return;
  }

  try {
    const sources = await db.select().from(knowledgeSources);
    console.log("\n--- KNOWLEDGE SOURCES ---");
    console.table(sources);

    const entities = await db.select().from(businessEntities);
    console.log("\n--- BUSINESS ENTITIES ---");
    console.table(entities);

    const obs = await db.select().from(observations);
    console.log("\n--- OBSERVATIONS ---");
    console.table(obs);
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    manager.close();
  }
}

dump();
