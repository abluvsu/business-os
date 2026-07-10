import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";
import { WorkspaceYamlSchema } from "@business-os/shared";
import { WorkspaceValidationResult, WorkspaceMetadata } from "./types";

export function validateWorkspace(
  parentPath: string,
): WorkspaceValidationResult {
  const result: WorkspaceValidationResult = {
    valid: false,
    warnings: [],
    errors: [],
    upgradeRequired: false,
  };

  const businessosDir = path.join(parentPath, "businessos");
  if (!fs.existsSync(businessosDir)) {
    result.errors.push(
      `Directory 'businessos' does not exist in target path: ${parentPath}`,
    );
    return result;
  }

  const yamlPath = path.join(businessosDir, "workspace.yaml");
  if (!fs.existsSync(yamlPath)) {
    result.errors.push(`workspace.yaml does not exist in ${businessosDir}`);
    return result;
  }

  const dbPath = path.join(businessosDir, "database.sqlite");
  if (!fs.existsSync(dbPath)) {
    result.errors.push(`database.sqlite does not exist in ${businessosDir}`);
    return result;
  }

  // Parse and validate yaml
  let parsed: any;
  try {
    const rawYaml = fs.readFileSync(yamlPath, "utf8");
    parsed = YAML.parse(rawYaml);
  } catch (err: any) {
    result.errors.push(`Failed to parse workspace.yaml: ${err.message}`);
    return result;
  }

  const validationResult = WorkspaceYamlSchema.safeParse(parsed);
  if (!validationResult.success) {
    result.errors.push(
      `workspace.yaml validation failed: ${validationResult.error.message}`,
    );
    return result;
  }

  // Check lock status
  const lockPath = path.join(businessosDir, "workspace.lock");
  if (fs.existsSync(lockPath)) {
    const lockPidStr = fs.readFileSync(lockPath, "utf8").trim();
    const lockPid = parseInt(lockPidStr, 10);
    if (!isNaN(lockPid)) {
      result.lockPid = lockPid;
      if (lockPid === process.pid) {
        result.lockStatus = "clean";
      } else {
        try {
          process.kill(lockPid, 0);
          // Process is alive: locked!
          result.lockStatus = "locked";
          result.errors.push(
            `Workspace is locked by another running process (PID: ${lockPid})`,
          );
        } catch (err: any) {
          if (err.code === "EPERM") {
            result.lockStatus = "locked";
            result.errors.push(
              `Workspace is locked by another running process (PID: ${lockPid}) (Permission Denied)`,
            );
          } else {
            // Process is dead: crashed!
            result.lockStatus = "crashed";
            result.warnings.push(
              `Previous session crashed. Lock file exists but process PID ${lockPid} is not running.`,
            );
          }
        }
      }
    } else {
      result.lockStatus = "crashed";
      result.warnings.push("Stale lock file found.");
    }
  } else {
    result.lockStatus = "clean";
  }

  result.metadata = validationResult.data as WorkspaceMetadata;
  result.valid = result.errors.length === 0;

  return result;
}

export function acquireLock(parentPath: string, force: boolean = false): void {
  const lockPath = path.join(parentPath, "businessos", "workspace.lock");

  if (fs.existsSync(lockPath)) {
    const lockPidStr = fs.readFileSync(lockPath, "utf8").trim();
    const lockPid = parseInt(lockPidStr, 10);
    if (!isNaN(lockPid)) {
      if (lockPid === process.pid) {
        return;
      }
      try {
        process.kill(lockPid, 0);
        // Still running!
        if (!force) {
          throw new Error(
            `Workspace is locked by another running process (PID: ${lockPid})`,
          );
        }
      } catch (err: any) {
        if (err.code === "EPERM") {
          if (!force) {
            throw new Error(
              `Workspace is locked by another running process (PID: ${lockPid}) (Permission Denied)`,
            );
          }
        }
        // Dead process, safe to overwrite
      }
    }
  }

  fs.writeFileSync(lockPath, process.pid.toString(), "utf8");
}

export function releaseLock(parentPath: string): void {
  const lockPath = path.join(parentPath, "businessos", "workspace.lock");
  if (fs.existsSync(lockPath)) {
    try {
      fs.unlinkSync(lockPath);
    } catch (err) {
      // ignore
    }
  }
}
