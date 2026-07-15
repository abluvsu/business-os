import { drizzle, SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import { DatabaseSync } from "node:sqlite";
import * as schema from "./schema";
import { createClient } from "@libsql/client";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";

export function createDatabaseConnection(dbPath: string): {
  sqlite: any;
  db: any;
} {
  const tursoUrl = process.env.TURSO_CONNECTION_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl) {
    console.log(`🔌 [Database] Connecting to Turso Cloud SQLite: ${tursoUrl}`);
    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken
    });
    const db = drizzleLibsql(client, { schema });
    return { sqlite: client, db };
  }

  // Fallback to local node:sqlite DatabaseSync
  const sqlite = new DatabaseSync(dbPath);
  
  const db = drizzle(
    async (sql, params, method) => {
      try {
        const stmt = sqlite.prepare(sql);
        
        if (method === "run") {
          stmt.run(...params);
          return { rows: [] };
        }
        
        const res = stmt.all(...params) as any[];
        
        if (method === "all" || method === "values") {
          const colNames = stmt.columns().map((c) => c.name);
          return { rows: res.map((row) => colNames.map((name) => row[name])) };
        }
        
        return { rows: res };
      } catch (err: unknown) {
        console.error("Database query failed:", err);
        throw err;
      }
    },
    { schema }
  );

  return { sqlite, db };
}

export async function initializeDatabaseTables(sqlite: any): Promise<void> {
  const isTurso = typeof sqlite.execute === "function";

  const executeDdl = async (ddl: string) => {
    if (isTurso) {
      try {
        await sqlite.execute(ddl);
      } catch (err: any) {
        console.error("❌ Turso DDL Execution Failed:", err);
      }
    } else {
      sqlite.exec(ddl);
    }
  };

  // 1. Identity & Tenancy Tables (Must exist first)
  await executeDdl(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      clerk_user_id TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS memberships (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      UNIQUE (user_id, organization_id)
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );
  `);

  // 2. Data Tables (Scoped to Workspaces)
  await executeDdl(`
    CREATE TABLE IF NOT EXISTS knowledge_sources (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      connector_id TEXT NOT NULL,
      status TEXT NOT NULL,
      display_name TEXT NOT NULL,
      auth_context TEXT,
      last_sync_at TEXT,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS business_entities (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      external_id TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      attributes TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES knowledge_sources(id) ON DELETE CASCADE,
      UNIQUE (source_id, external_id)
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS observations (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      entity_id TEXT,
      date TEXT NOT NULL,
      original_timezone TEXT NOT NULL,
      observation_type TEXT NOT NULL,
      value REAL NOT NULL,
      currency TEXT,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES knowledge_sources(id) ON DELETE CASCADE,
      FOREIGN KEY (entity_id) REFERENCES business_entities(id) ON DELETE CASCADE,
      UNIQUE (source_id, entity_id, date, observation_type)
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      event_name TEXT NOT NULL,
      category TEXT NOT NULL,
      properties TEXT,
      created_at TEXT NOT NULL
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS work_items (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      type TEXT NOT NULL,
      assigned_to TEXT NOT NULL,
      details TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS conversation_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS context_snapshots (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      snapshot TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (message_id) REFERENCES conversation_messages(id) ON DELETE CASCADE
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS sync_metadata (
      source_id TEXT PRIMARY KEY,
      last_sync_at TEXT NOT NULL,
      records_synced INTEGER NOT NULL DEFAULT 0
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS company_profiles (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      website TEXT,
      industry TEXT,
      stage TEXT,
      description TEXT,
      value_proposition TEXT,
      target_audience TEXT,
      business_model TEXT,
      competitor_names TEXT,
      competitor_urls TEXT,
      health_metrics TEXT,
      extracted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS onboarding_drafts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL UNIQUE,
      draft TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);

  await executeDdl(`
    CREATE TABLE IF NOT EXISTS workspace_policies (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      rule TEXT NOT NULL,
      description TEXT,
      severity TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      metadata TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);

  await executeDdl(`
    CREATE INDEX IF NOT EXISTS workspace_enabled_idx ON workspace_policies (workspace_id, enabled);
  `);

  await executeDdl(`
    CREATE INDEX IF NOT EXISTS workspace_type_idx ON workspace_policies (workspace_id, type);
  `);
}
