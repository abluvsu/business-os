import { pgTable, uuid, varchar, timestamp, text, numeric, date, jsonb } from "drizzle-orm/pg-core";

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const knowledgeSources = pgTable("knowledge_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  connectorType: varchar("connector_type", { length: 50 }).notNull(), // "instagram", "gmail", "google_ads"
  encryptedAuthContext: text("encrypted_auth_context").notNull(),
  status: varchar("status", { length: 50 }).notNull(), // "connected", "syncing", "failed"
  lastSyncAt: timestamp("last_sync_at"),
});

export const businessEntities = pgTable("business_entities", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "campaign", "post", "contact"
  name: varchar("name", { length: 255 }).notNull(),
  externalId: varchar("external_id", { length: 255 }).notNull(),
  attributes: jsonb("attributes").default({}).notNull(),
});

export const observations = pgTable("observations", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  entityId: uuid("entity_id").references(() => businessEntities.id),
  date: date("date").notNull(),
  metricType: varchar("metric_type", { length: 50 }).notNull(), // "spend", "clicks", "reach"
  value: numeric("value").notNull(),
});
