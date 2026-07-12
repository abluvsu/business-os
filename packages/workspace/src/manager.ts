import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { DatabaseSync } from "node:sqlite";
import { initializeWorkspace } from "./initializer";
import { validateWorkspace, acquireLock, releaseLock } from "./validator";
import { WorkspaceState, WorkspaceValidationResult } from "./types";
import {
  createDatabaseConnection,
  initializeDatabaseTables,
} from "./db/connection";

const GLOBAL_CONFIG_DIR = path.join(os.homedir(), ".business-os");
const GLOBAL_CONFIG_FILE = path.join(GLOBAL_CONFIG_DIR, "config.json");

// Production workspace root (persistent disk on Render)
const WORKSPACE_ROOT =
  process.env.WORKSPACE_ROOT ||
  path.join(os.homedir(), "business-os-workspaces");

interface GlobalConfig {
  activeWorkspacePath: string | null;
  recentWorkspaces: Array<{
    name: string;
    path: string;
    lastOpened: string;
  }>;
}

function getGlobalConfig(): GlobalConfig {
  if (!fs.existsSync(GLOBAL_CONFIG_FILE)) {
    return { activeWorkspacePath: null, recentWorkspaces: [] };
  }
  try {
    const raw = fs.readFileSync(GLOBAL_CONFIG_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { activeWorkspacePath: null, recentWorkspaces: [] };
  }
}

function saveGlobalConfig(config: GlobalConfig) {
  if (!fs.existsSync(GLOBAL_CONFIG_DIR)) {
    fs.mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(GLOBAL_CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
}

export class WorkspaceManager {
  private activePath: string | null = null;
  private dbSync: DatabaseSync | null = null;
  private dbRef: any = null;

  constructor() {
    if (process.env.TURSO_CONNECTION_URL) {
      console.log("🔌 [WorkspaceManager] Initializing Global SaaS Database Connection (Turso)...");
      try {
        const { sqlite, db } = createDatabaseConnection("");
        this.dbSync = sqlite;
        this.dbRef = db;
        // Run database migrations safely before release; do not rely on unawaited startup DDL
        initializeDatabaseTables(sqlite).then(() => {
          console.log("✅ [WorkspaceManager] SaaS Database Migrations Completed.");
        }).catch((err) => {
          console.error("❌ [WorkspaceManager] Migrations failed:", err);
        });
      } catch (err: any) {
        console.error("Failed to connect to SaaS database:", err);
      }
    } else {
      const config = getGlobalConfig();
      if (config.activeWorkspacePath) {
        try {
          // Try to automatically open on startup
          this.open(config.activeWorkspacePath);
        } catch (err) {
          // Clear active if it failed to open (locked, moved, etc.)
          config.activeWorkspacePath = null;
          saveGlobalConfig(config);
        }
      }
    }
  }

  public get db() {
    return this.dbRef;
  }

  public active(): WorkspaceState | null {
    if (!this.activePath) return null;
    const valResult = validateWorkspace(this.activePath);
    if (!valResult.valid || !valResult.metadata) return null;

    return {
      path: this.activePath,
      name: valResult.metadata.name,
      version: valResult.metadata.version,
      owner: valResult.metadata.owner,
      databasePath: path.join(
        this.activePath,
        "businessos",
        valResult.metadata.database,
      ),
      schemaVersion: valResult.metadata.schemaVersion,
      status: valResult.metadata.status,
    };
  }

  public recent() {
    const list = getGlobalConfig().recentWorkspaces;
    return list.slice(0, 10); // Safeguard cap at 10 items
  }

  public validate(wsPath: string): WorkspaceValidationResult {
    return validateWorkspace(wsPath);
  }

  public async create(
    name: string,
    owner: string,
    parentPath?: string,
  ): Promise<WorkspaceState> {
    const basePath = parentPath || WORKSPACE_ROOT;
    const resolvedPath = path.resolve(
      basePath,
      name.toLowerCase().replace(/\s+/g, "-"),
    );

    // Initialize container directories and files
    await initializeWorkspace(resolvedPath, name, owner);

    // Open newly created workspace
    return this.open(resolvedPath);
  }

  public open(wsPath: string, force: boolean = false): WorkspaceState {
    const resolvedPath = path.resolve(wsPath);

    // Validate the workspace
    const valResult = validateWorkspace(resolvedPath);

    // If it's a structural error (not lock related), fail immediately
    if (
      !valResult.valid &&
      valResult.lockStatus !== "crashed" &&
      valResult.lockStatus !== "locked"
    ) {
      throw new Error(
        `Invalid workspace container: ${valResult.errors.join(", ")}`,
      );
    }

    // Try to acquire process lock
    acquireLock(resolvedPath, force);

    this.activePath = resolvedPath;

    // Update global configuration
    const config = getGlobalConfig();
    config.activeWorkspacePath = resolvedPath;

    // Update or add to recent list
    const metadata = valResult.metadata || {
      name: path.basename(resolvedPath),
      version: 1,
      schemaVersion: "1.0.0",
      database: "database.sqlite",
      status: "active" as const,
    };

    // Connect to SQLite DatabaseSync and run migrations DDL
    const databasePath = path.join(
      resolvedPath,
      "businessos",
      metadata.database || "database.sqlite",
    );
    try {
      const { sqlite, db } = createDatabaseConnection(databasePath);
      this.dbSync = sqlite;
      this.dbRef = db;
      initializeDatabaseTables(sqlite);
    } catch (err: any) {
      // Release lock and throw on connection failure
      releaseLock(resolvedPath);
      this.activePath = null;
      throw new Error(`Database connection failed: ${err.message}`);
    }

    const existingIdx = config.recentWorkspaces.findIndex(
      (w) => path.resolve(w.path) === resolvedPath,
    );

    if (existingIdx !== -1) {
      config.recentWorkspaces[existingIdx].lastOpened =
        new Date().toISOString();
    } else {
      config.recentWorkspaces.push({
        name: metadata.name,
        path: resolvedPath,
        lastOpened: new Date().toISOString(),
      });
    }

    // Sort and cap at 10 items
    config.recentWorkspaces.sort(
      (a, b) =>
        new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime(),
    );
    config.recentWorkspaces = config.recentWorkspaces.slice(0, 10);

    saveGlobalConfig(config);

    return {
      path: resolvedPath,
      name: metadata.name,
      version: metadata.version,
      owner: (metadata as any).owner || "Unknown",
      databasePath,
      schemaVersion: metadata.schemaVersion || "1.0.0",
      status: metadata.status,
    };
  }

  public close(): void {
    if (this.dbSync) {
      try {
        this.dbSync.close();
      } catch (err) {
        // ignore
      }
      this.dbSync = null;
      this.dbRef = null;
    }

    if (!this.activePath) return;

    // Release lock
    releaseLock(this.activePath);

    this.activePath = null;

    const config = getGlobalConfig();
    config.activeWorkspacePath = null;
    saveGlobalConfig(config);
  }
}
