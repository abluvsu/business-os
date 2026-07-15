import { eq, and } from "drizzle-orm";
import * as schema from "../db/schema";
import { TenantContext } from "../types";
import { WorkspacePolicy, PolicyType, PolicySeverity, PolicySource } from "@business-os/shared";

export class WorkspacePolicyRepository {
  constructor(private db: any, private context: TenantContext) {}

  private mapRowToPolicy(row: any): WorkspacePolicy {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      type: row.type as PolicyType,
      category: row.category,
      title: row.title,
      rule: row.rule,
      description: row.description,
      severity: row.severity as PolicySeverity,
      enabled: row.enabled,
      metadata: row.metadata ? (typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata) as Record<string, unknown> : null,
      version: row.version,
      createdBy: row.createdBy as PolicySource,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async getPolicies(): Promise<WorkspacePolicy[]> {
    const workspaceId = this.context.activeWorkspaceId;
    if (!workspaceId) return [];
    const rows = await this.db
      .select()
      .from(schema.workspacePolicies)
      .where(eq(schema.workspacePolicies.workspaceId, workspaceId));
    return rows.map((r: any) => this.mapRowToPolicy(r));
  }

  async getEnabledPolicies(): Promise<WorkspacePolicy[]> {
    const workspaceId = this.context.activeWorkspaceId;
    if (!workspaceId) return [];
    const rows = await this.db
      .select()
      .from(schema.workspacePolicies)
      .where(
        and(
          eq(schema.workspacePolicies.workspaceId, workspaceId),
          eq(schema.workspacePolicies.enabled, true)
        )
      );
    return rows.map((r: any) => this.mapRowToPolicy(r));
  }

  async getPolicy(id: string): Promise<WorkspacePolicy | null> {
    const workspaceId = this.context.activeWorkspaceId;
    if (!workspaceId) return null;
    const rows = await this.db
      .select()
      .from(schema.workspacePolicies)
      .where(
        and(
          eq(schema.workspacePolicies.id, id),
          eq(schema.workspacePolicies.workspaceId, workspaceId)
        )
      )
      .limit(1);
    if (rows.length === 0) return null;
    return this.mapRowToPolicy(rows[0]);
  }

  async createPolicy(policy: Omit<WorkspacePolicy, "workspaceId">): Promise<void> {
    const workspaceId = this.context.activeWorkspaceId;
    if (!workspaceId) throw new Error("No active workspace context");
    await this.db.insert(schema.workspacePolicies).values({
      ...policy,
      workspaceId,
    });
  }

  async updatePolicy(id: string, policy: Partial<Omit<WorkspacePolicy, "id" | "workspaceId">>): Promise<void> {
    const workspaceId = this.context.activeWorkspaceId;
    if (!workspaceId) throw new Error("No active workspace context");
    await this.db
      .update(schema.workspacePolicies)
      .set(policy)
      .where(
        and(
          eq(schema.workspacePolicies.id, id),
          eq(schema.workspacePolicies.workspaceId, workspaceId)
        )
      );
  }

  async deletePolicy(id: string): Promise<void> {
    const workspaceId = this.context.activeWorkspaceId;
    if (!workspaceId) throw new Error("No active workspace context");
    await this.db
      .delete(schema.workspacePolicies)
      .where(
        and(
          eq(schema.workspacePolicies.id, id),
          eq(schema.workspacePolicies.workspaceId, workspaceId)
        )
      );
  }

  async togglePolicy(id: string, enabled: boolean): Promise<void> {
    await this.updatePolicy(id, { enabled });
  }

  async incrementVersion(id: string, currentVersion: number): Promise<void> {
    await this.updatePolicy(id, { version: currentVersion + 1 });
  }
}
