import { WorkspacePolicy } from "@business-os/shared";
import { WorkspacePolicyRepository } from "../repositories/WorkspacePolicyRepository";
import { WorkspaceContextCache } from "../cache/WorkspaceContextCache";

export class WorkspacePolicyService {
  constructor(private repo: WorkspacePolicyRepository) {}

  async validatePolicy(
    policy: Omit<WorkspacePolicy, "workspaceId" | "createdAt" | "updatedAt">,
  ): Promise<void> {
    // 1. Empty checks
    if (!policy.title.trim()) {
      throw new Error("Policy title cannot be empty");
    }
    if (!policy.rule.trim()) {
      throw new Error("Policy rule definition cannot be empty");
    }

    // 2. Enum validations
    const validTypes = [
      "BRAND",
      "CONTENT",
      "COMPLIANCE",
      "MARKETING",
      "LEGAL",
      "STYLE",
      "CUSTOM",
    ];
    if (!validTypes.includes(policy.type)) {
      throw new Error(`Unsupported policy type: ${policy.type}`);
    }

    const validSeverities = ["INFO", "WARNING", "ERROR", "BLOCKING"];
    if (!validSeverities.includes(policy.severity)) {
      throw new Error(`Invalid policy severity: ${policy.severity}`);
    }

    // 3. Fetch existing policies to run comparisons
    const existingPolicies = await this.repo.getPolicies();

    // 4. Workspace policy limit check (max 100)
    if (
      existingPolicies.length >= 100 &&
      !existingPolicies.some((p) => p.id === policy.id)
    ) {
      throw new Error(
        "Workspace policy limit reached (maximum 100 policies allowed)",
      );
    }

    // 5. Duplicate title checks (excluding the policy itself if updating)
    const duplicateTitle = existingPolicies.find(
      (p) =>
        p.title.toLowerCase() === policy.title.toLowerCase() &&
        p.id !== policy.id,
    );
    if (duplicateTitle) {
      throw new Error(
        `A policy with the title "${policy.title}" already exists`,
      );
    }

    // 6. Duplicate rule definition checks
    const duplicateRule = existingPolicies.find(
      (p) =>
        p.rule.toLowerCase() === policy.rule.toLowerCase() &&
        p.id !== policy.id,
    );
    if (duplicateRule) {
      throw new Error(
        "An identical policy rule definition already exists in this workspace",
      );
    }

    // 7. Conflict detection (e.g. opposite keywords check)
    const isNoDiscount =
      policy.rule.toLowerCase().includes("never") &&
      policy.rule.toLowerCase().includes("discount");
    const isYesDiscount =
      policy.rule.toLowerCase().includes("always") &&
      policy.rule.toLowerCase().includes("discount");
    if (isNoDiscount || isYesDiscount) {
      const opposing = existingPolicies.find((p) => {
        if (p.id === policy.id || !p.enabled) return false;
        const pLower = p.rule.toLowerCase();
        if (isNoDiscount) {
          return pLower.includes("always") && pLower.includes("discount");
        } else {
          return pLower.includes("never") && pLower.includes("discount");
        }
      });
      if (opposing) {
        throw new Error(
          `Conflicting policies detected: This rule opposes existing rule: "${opposing.title}"`,
        );
      }
    }
  }

  async getPolicies(): Promise<WorkspacePolicy[]> {
    return this.repo.getPolicies();
  }

  async getEnabledPolicies(): Promise<WorkspacePolicy[]> {
    return this.repo.getEnabledPolicies();
  }

  async createPolicy(
    policy: Omit<
      WorkspacePolicy,
      "workspaceId" | "version" | "createdAt" | "updatedAt"
    >,
  ): Promise<WorkspacePolicy> {
    const newPolicy: WorkspacePolicy = {
      ...policy,
      workspaceId: "", // Scoped in repo
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.validatePolicy(newPolicy);
    await this.repo.createPolicy(newPolicy);
    WorkspaceContextCache.invalidate(this.repo.activeWorkspaceId);
    return newPolicy;
  }

  async updatePolicy(
    id: string,
    updates: Partial<
      Omit<
        WorkspacePolicy,
        "id" | "workspaceId" | "version" | "createdAt" | "updatedAt"
      >
    >,
    clientVersion?: number,
  ): Promise<WorkspacePolicy> {
    const existing = await this.repo.getPolicy(id);
    if (!existing) {
      throw new Error("Policy not found");
    }

    // Optimistic Concurrency check
    if (clientVersion !== undefined && existing.version !== clientVersion) {
      throw new Error(
        "Conflict: The policy has been modified by another process. Please refresh and try again.",
      );
    }

    const merged: WorkspacePolicy = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.validatePolicy(merged);

    merged.version = existing.version + 1;

    await this.repo.updatePolicy(id, {
      ...updates,
      version: merged.version,
      updatedAt: merged.updatedAt,
    });

    WorkspaceContextCache.invalidate(this.repo.activeWorkspaceId);
    return merged;
  }

  async deletePolicy(id: string): Promise<void> {
    const existing = await this.repo.getPolicy(id);
    if (!existing) {
      throw new Error("Policy not found");
    }
    await this.repo.deletePolicy(id);
    WorkspaceContextCache.invalidate(this.repo.activeWorkspaceId);
  }

  async togglePolicy(id: string, enabled: boolean): Promise<WorkspacePolicy> {
    const existing = await this.repo.getPolicy(id);
    if (!existing) {
      throw new Error("Policy not found");
    }

    const updated = {
      ...existing,
      enabled,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    await this.repo.updatePolicy(id, {
      enabled,
      version: updated.version,
      updatedAt: updated.updatedAt,
    });

    WorkspaceContextCache.invalidate(this.repo.activeWorkspaceId);
    return updated;
  }
}
