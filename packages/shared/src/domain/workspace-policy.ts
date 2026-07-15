export type PolicyType = 
  | "BRAND"
  | "CONTENT"
  | "COMPLIANCE"
  | "MARKETING"
  | "LEGAL"
  | "STYLE"
  | "CUSTOM";

export type PolicySeverity =
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "BLOCKING";

export type PolicySource =
  | "SYSTEM"
  | "FOUNDER"
  | "AI";

export interface WorkspacePolicy {
  id: string;
  workspaceId: string;
  type: PolicyType;
  category: string;
  title: string;
  rule: string;
  description: string | null;
  severity: PolicySeverity;
  enabled: boolean;
  metadata: Record<string, unknown> | null;
  version: number;
  createdBy: PolicySource;
  createdAt: string;
  updatedAt: string;
}
