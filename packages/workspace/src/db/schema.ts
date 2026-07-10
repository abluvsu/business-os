import { sqliteTable, text, integer, real, unique } from "drizzle-orm/sqlite-core";

export const knowledgeSources = sqliteTable("knowledge_sources", {
  id: text("id").primaryKey(), // UUID
  workspaceId: text("workspace_id").notNull(),
  connectorId: text("connector_id").notNull(), // e.g., "instagram_graph_v1", "gmail_v1", "pdf_source"
  status: text("status").notNull(), // "connected", "disconnected", "error"
  displayName: text("display_name").notNull(),
  authContext: text("auth_context", { mode: "json" }), // Secure token storage or file metadata
  lastSyncAt: text("last_sync_at"), // ISO8601 UTC
});

export const businessEntities = sqliteTable("business_entities", {
  id: text("id").primaryKey(), // Internal UUID
  workspaceId: text("workspace_id").notNull(),
  sourceId: text("source_id")
    .notNull()
    .references(() => knowledgeSources.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(), // e.g., Meta post ID, Gmail msg ID
  type: text("type").notNull(), // "campaign", "organic_post", "email", "task", "customer", "product"
  name: text("name").notNull(),
  status: text("status").notNull(), // "active", "paused", "archived", "unread", "completed"
  createdAt: text("created_at").notNull(), // ISO8601 UTC
  updatedAt: text("updated_at").notNull(), // ISO8601 UTC
  attributes: text("attributes", { mode: "json" }).notNull(), // Generic JSON attributes payload
}, (t) => ({
  unqExternal: unique().on(t.sourceId, t.externalId),
}));

export const observations = sqliteTable("observations", {
  id: text("id").primaryKey(), // UUID
  workspaceId: text("workspace_id").notNull(),
  sourceId: text("source_id")
    .notNull()
    .references(() => knowledgeSources.id, { onDelete: "cascade" }),
  entityId: text("entity_id")
    .references(() => businessEntities.id, { onDelete: "cascade" }), // Can be null for global metrics
  
  date: text("date").notNull(), // ISO8601 UTC timestamp of the observation
  originalTimezone: text("original_timezone").notNull(), // e.g., "Asia/Kolkata"
  
  observationType: text("observation_type").notNull(), // "clicks", "reach", "opens", "revenue"
  value: real("value").notNull(),
  currency: text("currency"), // ISO 4217 code
}, (t) => ({
  unqObservation: unique().on(t.sourceId, t.entityId, t.date, t.observationType),
}));

export const analyticsEvents = sqliteTable("analytics_events", {
  id: text("id").primaryKey(), // UUID
  sessionId: text("session_id").notNull(),
  eventName: text("event_name").notNull(),
  category: text("category").notNull(), // "Acquisition", "Activation", "Engagement", "Friction"
  properties: text("properties", { mode: "json" }),
  createdAt: text("created_at").notNull(),
});

export const workItems = sqliteTable("work_items", {
  id: text("id").primaryKey(), // UUID
  workspaceId: text("workspace_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(), // "pending", "in_progress", "completed", "failed"
  type: text("type").notNull(), // "analysis", "recommendation_execution", "manual_task", "automation"
  assignedTo: text("assigned_to").notNull(), // "ai", "founder"
  details: text("details", { mode: "json" }).notNull(),
  createdAt: text("created_at").notNull(), // ISO8601 UTC
  updatedAt: text("updated_at").notNull(), // ISO8601 UTC
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(), // UUID
  workspaceId: text("workspace_id").notNull(),
  title: text("title").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const conversationMessages = sqliteTable("conversation_messages", {
  id: text("id").primaryKey(), // UUID
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user", "assistant", "system"
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export const contextSnapshots = sqliteTable("context_snapshots", {
  id: text("id").primaryKey(), // UUID
  messageId: text("message_id")
    .notNull()
    .references(() => conversationMessages.id, { onDelete: "cascade" }),
  snapshot: text("snapshot", { mode: "json" }).notNull(),
  createdAt: text("created_at").notNull(),
});

export const syncMetadata = sqliteTable("sync_metadata", {
  sourceId: text("source_id").primaryKey(),
  lastSyncAt: text("last_sync_at").notNull(),
  recordsSynced: integer("records_synced").default(0).notNull(),
});
