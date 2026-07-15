import { WorkspaceContext } from "../context/WorkspaceContextBuilder";

interface CacheEntry {
  context: WorkspaceContext;
  expiresAt: number;
}

export class WorkspaceContextCache {
  private static cache = new Map<string, CacheEntry>();
  private static TTL_MS = 5 * 60 * 1000; // 5 minutes

  static get(workspaceId: string): WorkspaceContext | null {
    const entry = this.cache.get(workspaceId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(workspaceId);
      return null;
    }
    return entry.context;
  }

  static set(workspaceId: string, context: WorkspaceContext): void {
    this.cache.set(workspaceId, {
      context,
      expiresAt: Date.now() + this.TTL_MS,
    });
  }

  static invalidate(workspaceId: string): void {
    this.cache.delete(workspaceId);
  }

  static clear(): void {
    this.cache.clear();
  }
}
