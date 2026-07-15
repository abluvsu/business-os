import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { TenantContext } from "../types";
import { WorkspacePolicyRepository } from "../repositories/WorkspacePolicyRepository";
import { WorkspacePolicy } from "@business-os/shared";

export interface WorkspaceContext {
  company: typeof schema.companyProfiles.$inferSelect | null;
  policies: WorkspacePolicy[];
  knowledge: (typeof schema.knowledgeSources.$inferSelect)[];
  observations: (typeof schema.observations.$inferSelect)[];
}

export class WorkspaceContextBuilder {
  constructor(private db: any, private context: TenantContext) {}

  async build(): Promise<WorkspaceContext> {
    const workspaceId = this.context.activeWorkspaceId;
    if (!workspaceId) {
      return {
        company: null,
        policies: [],
        knowledge: [],
        observations: [],
      };
    }

    const profileRows = await this.db
      .select()
      .from(schema.companyProfiles)
      .where(eq(schema.companyProfiles.workspaceId, workspaceId))
      .limit(1);
    const company = profileRows[0] || null;

    const policyRepo = new WorkspacePolicyRepository(this.db, this.context);
    const policies = await policyRepo.getEnabledPolicies();

    const knowledge = await this.db
      .select()
      .from(schema.knowledgeSources)
      .where(eq(schema.knowledgeSources.workspaceId, workspaceId));

    const observations = await this.db
      .select()
      .from(schema.observations)
      .where(eq(schema.observations.workspaceId, workspaceId));

    return {
      company,
      policies,
      knowledge,
      observations,
    };
  }
}
