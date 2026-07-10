import {
  sqliteTable,
  text,
  integer,
  real,
  unique,
} from "drizzle-orm/sqlite-core";

// ==========================================
// 1. Identity & Tenancy Layer (SaaS Platform)
// ==========================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Internal UUID
  clerkUserId: text("clerk_user_id").notNull().unique(), // External ID resolved from Clerk authentication
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull(), // ISO8601 UTC
});

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const memberships = sqliteTable(
  "memberships",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "owner", "admin", "member", "read_only"
    createdAt: text("created_at").notNull(),
  },
  (t) => ({
    unqMembership: unique().on(t.userId, t.organizationId),
  }),
);

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(), // UUID
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

// ==========================================
// 2. Connector & Observation Layer
// ==========================================

export const knowledgeSources = sqliteTable("knowledge_sources", {
  id: text("id").primaryKey(), // UUID
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  connectorId: text("connector_id").notNull(), // e.g., "instagram-posts", "gmail-threads"
  status: text("status").notNull(), // "connected", "disconnected", "error"
  displayName: text("display_name").notNull(),
  authContext: text("auth_context", { mode: "json" }), // Encrypted token credentials structure
  lastSyncAt: text("last_sync_at"), // ISO8601 UTC
});

export const businessEntities = sqliteTable(
  "business_entities",
  {
    id: text("id").primaryKey(), // Internal UUID
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
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
  },
  (t) => ({
    unqExternal: unique().on(t.sourceId, t.externalId),
  }),
);

export const observations = sqliteTable(
  "observations",
  {
    id: text("id").primaryKey(), // UUID
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    sourceId: text("source_id")
      .notNull()
      .references(() => knowledgeSources.id, { onDelete: "cascade" }),
    entityId: text("entity_id").references(() => businessEntities.id, {
      onDelete: "cascade",
    }), // Can be null for global metrics

    date: text("date").notNull(), // ISO8601 UTC timestamp of the observation
    originalTimezone: text("original_timezone").notNull(), // e.g., "Asia/Kolkata"

    observationType: text("observation_type").notNull(), // "clicks", "reach", "opens", "revenue"
    value: real("value").notNull(),
    currency: text("currency"), // ISO 4217 code
  },
  (t) => ({
    unqObservation: unique().on(
      t.sourceId,
      t.entityId,
      t.date,
      t.observationType,
    ),
  }),
);

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
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
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
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
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

// ==========================================
// 3. Company Profile & Website Intelligence
// ==========================================

export const companyProfiles = sqliteTable("company_profiles", {
  id: text("id").primaryKey(), // UUID
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" })
    .unique(),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  stage: text("stage"), // "pre-seed", "seed", "series-a", "growth", "mature"
  description: text("description"),
  valueProposition: text("value_proposition"),
  targetAudience: text("target_audience"),
  businessModel: text("business_model"), // "SaaS", "ecommerce", "marketplace", "services", "content"
  competitorNames: text("competitor_names", { mode: "json" }).$type<string[]>(),
  competitorUrls: text("competitor_urls", { mode: "json" }).$type<string[]>(),
  healthMetrics: text("health_metrics", { mode: "json" }).$type<
    Record<string, number>
  >(),
  extractedAt: text("extracted_at"), // ISO8601 UTC when website was analyzed
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
