import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const queryClient = postgres(
  process.env.DATABASE_URL || "postgres://localhost:5432/businessos",
);
export const db = drizzle(queryClient, { schema });

// Extract Drizzle's transaction parameter type using Parameters utility
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function runInTenantContext<T>(
  tenantId: string,
  fn: (tx: DbTransaction) => Promise<T>,
): Promise<T> {
  return await db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
    return await fn(tx);
  });
}
