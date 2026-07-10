import { eq, and } from "drizzle-orm";
import * as schema from "./schema";
import { TenantContext } from "../types";

export class TenantRepository {
  constructor(private db: any, private context: TenantContext) {}

  // ==========================================
  // 1. Knowledge Sources
  // ==========================================

  async getKnowledgeSources() {
    return this.db
      .select()
      .from(schema.knowledgeSources)
      .where(eq(schema.knowledgeSources.workspaceId, this.context.activeWorkspaceId));
  }

  async getKnowledgeSource(id: string) {
    const results = await this.db
      .select()
      .from(schema.knowledgeSources)
      .where(
        and(
          eq(schema.knowledgeSources.id, id),
          eq(schema.knowledgeSources.workspaceId, this.context.activeWorkspaceId)
        )
      );
    return results[0] || null;
  }

  async insertKnowledgeSource(data: Omit<typeof schema.knowledgeSources.$inferInsert, "workspaceId">) {
    return this.db
      .insert(schema.knowledgeSources)
      .values({
        ...data,
        workspaceId: this.context.activeWorkspaceId
      });
  }

  async updateKnowledgeSource(id: string, data: Partial<Omit<typeof schema.knowledgeSources.$inferInsert, "id" | "workspaceId">>) {
    return this.db
      .update(schema.knowledgeSources)
      .set(data)
      .where(
        and(
          eq(schema.knowledgeSources.id, id),
          eq(schema.knowledgeSources.workspaceId, this.context.activeWorkspaceId)
        )
      );
  }

  async deleteKnowledgeSource(id: string) {
    return this.db
      .delete(schema.knowledgeSources)
      .where(
        and(
          eq(schema.knowledgeSources.id, id),
          eq(schema.knowledgeSources.workspaceId, this.context.activeWorkspaceId)
        )
      );
  }

  // ==========================================
  // 2. Business Entities
  // ==========================================

  async getBusinessEntities() {
    return this.db
      .select()
      .from(schema.businessEntities)
      .where(eq(schema.businessEntities.workspaceId, this.context.activeWorkspaceId));
  }

  async getBusinessEntitiesByType(type: string) {
    return this.db
      .select()
      .from(schema.businessEntities)
      .where(
        and(
          eq(schema.businessEntities.type, type),
          eq(schema.businessEntities.workspaceId, this.context.activeWorkspaceId)
        )
      );
  }

  async insertBusinessEntity(data: Omit<typeof schema.businessEntities.$inferInsert, "workspaceId">) {
    return this.db
      .insert(schema.businessEntities)
      .values({
        ...data,
        workspaceId: this.context.activeWorkspaceId
      });
  }

  async upsertBusinessEntities(items: Omit<typeof schema.businessEntities.$inferInsert, "workspaceId">[]) {
    // SQLite upsert support or serial inserts
    for (const item of items) {
      await this.db
        .insert(schema.businessEntities)
        .values({
          ...item,
          workspaceId: this.context.activeWorkspaceId
        })
        .onConflictDoUpdate({
          target: [schema.businessEntities.sourceId, schema.businessEntities.externalId],
          set: {
            name: item.name,
            status: item.status,
            updatedAt: item.updatedAt,
            attributes: item.attributes
          }
        });
    }
  }

  // ==========================================
  // 3. Observations
  // ==========================================

  async getObservations() {
    return this.db
      .select()
      .from(schema.observations)
      .where(eq(schema.observations.workspaceId, this.context.activeWorkspaceId));
  }

  async getObservationsBySource(sourceId: string) {
    return this.db
      .select()
      .from(schema.observations)
      .where(
        and(
          eq(schema.observations.sourceId, sourceId),
          eq(schema.observations.workspaceId, this.context.activeWorkspaceId)
        )
      );
  }

  async insertObservations(items: Omit<typeof schema.observations.$inferInsert, "workspaceId">[]) {
    const valuesToInsert = items.map((item) => ({
      ...item,
      workspaceId: this.context.activeWorkspaceId
    }));
    if (valuesToInsert.length === 0) return;
    return this.db.insert(schema.observations).values(valuesToInsert);
  }

  async upsertObservations(items: Omit<typeof schema.observations.$inferInsert, "workspaceId">[]) {
    for (const item of items) {
      await this.db
        .insert(schema.observations)
        .values({
          ...item,
          workspaceId: this.context.activeWorkspaceId
        })
        .onConflictDoUpdate({
          target: [
            schema.observations.sourceId,
            schema.observations.entityId,
            schema.observations.date,
            schema.observations.observationType
          ],
          set: {
            value: item.value,
            currency: item.currency,
            originalTimezone: item.originalTimezone
          }
        });
    }
  }

  // ==========================================
  // 4. Sync Metadata
  // ==========================================

  async getSyncMetadata(sourceId: string) {
    const results = await this.db
      .select()
      .from(schema.syncMetadata)
      .where(eq(schema.syncMetadata.sourceId, sourceId));
    return results[0] || null;
  }

  async upsertSyncMetadata(sourceId: string, lastSyncAt: string, recordsSynced: number) {
    return this.db
      .insert(schema.syncMetadata)
      .values({
        sourceId,
        lastSyncAt,
        recordsSynced
      })
      .onConflictDoUpdate({
        target: schema.syncMetadata.sourceId,
        set: {
          lastSyncAt,
          recordsSynced
        }
      });
  }

  // ==========================================
  // 5. Conversations & Messages
  // ==========================================

  async getConversations() {
    return this.db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.workspaceId, this.context.activeWorkspaceId));
  }

  async getConversation(id: string) {
    const results = await this.db
      .select()
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.id, id),
          eq(schema.conversations.workspaceId, this.context.activeWorkspaceId)
        )
      );
    return results[0] || null;
  }

  async createConversation(id: string, title: string) {
    const now = new Date().toISOString();
    return this.db
      .insert(schema.conversations)
      .values({
        id,
        workspaceId: this.context.activeWorkspaceId,
        title,
        createdAt: now,
        updatedAt: now
      });
  }

  async getConversationMessages(conversationId: string) {
    // Validate conversation belongs to workspace first
    const conv = await this.getConversation(conversationId);
    if (!conv) return [];

    return this.db
      .select()
      .from(schema.conversationMessages)
      .where(eq(schema.conversationMessages.conversationId, conversationId));
  }

  async insertConversationMessage(id: string, conversationId: string, role: string, content: string) {
    const conv = await this.getConversation(conversationId);
    if (!conv) throw new Error("Conversation access unauthorized or does not exist.");

    const now = new Date().toISOString();
    return this.db
      .insert(schema.conversationMessages)
      .values({
        id,
        conversationId,
        role,
        content,
        createdAt: now
      });
  }

  // ==========================================
  // 6. Work Items
  // ==========================================

  async getWorkItems() {
    return this.db
      .select()
      .from(schema.workItems)
      .where(eq(schema.workItems.workspaceId, this.context.activeWorkspaceId));
  }

  async insertWorkItem(data: Omit<typeof schema.workItems.$inferInsert, "workspaceId">) {
    return this.db
      .insert(schema.workItems)
      .values({
        ...data,
        workspaceId: this.context.activeWorkspaceId
      });
  }

  async updateWorkItemStatus(id: string, status: string) {
    return this.db
      .update(schema.workItems)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(schema.workItems.id, id),
          eq(schema.workItems.workspaceId, this.context.activeWorkspaceId)
        )
      );
  }
}
