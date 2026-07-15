import { test, mock } from "node:test";
import assert from "node:assert";
import { SQL, StringChunk } from "drizzle-orm";
import { db, runInTenantContext, type DbTransaction } from "./client";

test("runInTenantContext - sets current_tenant_id config in transaction", async () => {
  const executedQueries: unknown[] = [];
  const tenantId = "test-tenant-123";

  // Mock the db.transaction method
  mock.method(db, "transaction", async (callback: unknown) => {
    if (typeof callback !== "function") {
      throw new Error("Expected transaction callback to be a function");
    }
    // Create a mock transaction object (tx)
    const mockTx = {
      execute: async (queryObj: unknown) => {
        executedQueries.push(queryObj);
        return [];
      },
    } as unknown as DbTransaction;
    return await callback(mockTx);
  });

  let callbackCalled = false;
  const result = await runInTenantContext(tenantId, async (tx) => {
    callbackCalled = true;
    assert.ok(tx, "Transaction client (tx) should be passed to the callback");
    return "success-result";
  });

  assert.strictEqual(result, "success-result");
  assert.strictEqual(callbackCalled, true);
  assert.strictEqual(executedQueries.length, 1);

  const queryObj = executedQueries[0];
  assert.ok(queryObj instanceof SQL, "Query should be an instance of SQL");

  const chunks = queryObj.queryChunks;
  assert.strictEqual(chunks.length, 3, "SQL query should have 3 chunks");

  const firstChunk = chunks[0];
  const secondChunk = chunks[1];
  const thirdChunk = chunks[2];

  assert.ok(
    firstChunk instanceof StringChunk,
    "First chunk should be a StringChunk",
  );
  assert.ok(
    thirdChunk instanceof StringChunk,
    "Third chunk should be a StringChunk",
  );

  assert.strictEqual(
    firstChunk.value[0],
    "SELECT set_config('app.current_tenant_id', ",
    "Query start chunk should match",
  );
  assert.strictEqual(
    secondChunk,
    tenantId,
    "Query parameter should match the provided tenant ID",
  );
  assert.strictEqual(
    thirdChunk.value[0],
    ", true)",
    "Query end chunk should match",
  );
});
