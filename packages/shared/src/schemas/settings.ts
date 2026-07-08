import { z } from "zod";

export const WorkspaceSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  syncIntervalMinutes: z.number().int().min(5).default(60),
});

export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>;
