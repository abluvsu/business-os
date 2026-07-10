import { WorkspaceYaml } from "@business-os/shared";

export interface WorkspaceState {
  path: string;
  name: string;
  version: number;
  owner: string;
  databasePath: string;
  schemaVersion: string;
  status: "active" | "inactive";
}

export interface WorkspaceMetadata extends WorkspaceYaml {}

export interface WorkspaceValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  upgradeRequired: boolean;
  metadata?: WorkspaceMetadata;
  lockStatus?: "clean" | "locked" | "crashed";
  lockPid?: number;
}

export interface TenantContext {
  userId: string;
  organizationId: string;
  activeWorkspaceId: string;
  role: "owner" | "admin" | "member" | "read_only";
}
