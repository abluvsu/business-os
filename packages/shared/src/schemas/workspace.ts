import { z } from "zod";

export const WorkspaceYamlSchema = z.object({
  version: z.number().int().min(1),
  name: z.string().min(1),
  created_at: z.string(), // ISO date or simple date format
  owner: z.string().min(1),
  schema: z.string(),
  database: z.string(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type WorkspaceYaml = z.infer<typeof WorkspaceYamlSchema>;
