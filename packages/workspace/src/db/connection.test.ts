import { test } from "node:test";
import assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  createDatabaseConnection,
  initializeDatabaseTables,
} from "./connection";
import { knowledgeSources } from "./schema";

test("Database connection integration - preserves domain object identity on query", async () => {
  const tempDbPath = path.join(__dirname, "test-temp-database.sqlite");

  if (fs.existsSync(tempDbPath)) fs.unlinkSync(tempDbPath);

  try {
    const { sqlite, db } = createDatabaseConnection(tempDbPath);
    initializeDatabaseTables(sqlite);

    const testSource = {
      id: "ds-123",
      workspaceId: "ws-1",
      connectorId: "instagram_graph_v1",
      status: "connected",
      displayName: "Test IG",
      authContext: { token: "abc" },
      lastSyncAt: null,
    };

    await db.insert(knowledgeSources).values(testSource);
    const results = await db.select().from(knowledgeSources);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, testSource.id);
  } finally {
    if (fs.existsSync(tempDbPath)) {
      try {
        fs.unlinkSync(tempDbPath);
      } catch {}
    }
  }
});
