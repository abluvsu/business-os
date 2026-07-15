import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

// Assign drizzle-orm sql to postgres.sql to support the brief's syntax safely
Object.defineProperty(postgres, "sql", {
  value: sql,
  writable: false,
  configurable: true,
});

const queryClient = postgres(process.env.DATABASE_URL || "postgres://localhost:5432/businessos");
export const db = drizzle(queryClient, { schema });

export async function runInTenantContext<T>(tenantId: string, fn: (tx?: any) => Promise<T>): Promise<T> {
  return await db.transaction(async (tx) => {
    await tx.execute((postgres as any).sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
    return await fn(tx);
  });
}
