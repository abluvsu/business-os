import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";
import { WorkspaceMetadata } from "./types";

export async function initializeWorkspace(
  parentPath: string,
  name: string,
  owner: string
): Promise<WorkspaceMetadata> {
  const businessosDir = path.join(parentPath, "businessos");

  // Create directories
  const dirs = [
    "",
    "connectors",
    "connectors/instagram",
    "connectors/gmail",
    "connectors/google-ads",
    "connectors/website",
    "generated",
    "uploads",
    "reports",
    "logs",
    "cache",
  ];

  for (const dir of dirs) {
    fs.mkdirSync(path.join(businessosDir, dir), { recursive: true });
  }

  // Create workspace.yaml
  const metadata: WorkspaceMetadata = {
    version: 1,
    name,
    created_at: new Date().toISOString().split("T")[0],
    owner,
    schema: "marketing-v1",
    schemaVersion: "1.0.0",
    database: "database.sqlite",
    status: "active",
  };

  const yamlContent = YAML.stringify(metadata);
  fs.writeFileSync(path.join(businessosDir, "workspace.yaml"), yamlContent, "utf8");

  // Create settings.json
  const defaultSettings = {
    theme: "system",
    syncIntervalMinutes: 60,
  };
  fs.writeFileSync(
    path.join(businessosDir, "settings.json"),
    JSON.stringify(defaultSettings, null, 2),
    "utf8"
  );

  // Initialize empty database file
  fs.writeFileSync(path.join(businessosDir, "database.sqlite"), "", "utf8");

  return metadata;
}
