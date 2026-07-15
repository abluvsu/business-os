import { test, mock } from "node:test";
import assert from "node:assert";
import { db, runInTenantContext } from "./client";

test("runInTenantContext - sets current_tenant_id config in transaction", async () => {
  const executedQueries: string[] = [];
  const tenantId = "test-tenant-123";

  // Mock the db.transaction method
  mock.method(db, "transaction", async (callback: any) => {
    // Create a mock transaction object (tx)
    const mockTx = {
      execute: async (queryObj: any) => {
        executedQueries.push("set_config");
        return [];
      }
    };
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
  assert.strictEqual(executedQueries[0], "set_config");
});
