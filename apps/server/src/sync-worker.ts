import { EventEmitter } from "node:events";
import {
  WorkspaceManager,
  knowledgeSources,
  syncMetadata,
} from "@business-os/workspace";
import { NangoSourceProvider, NangoConfig } from "@business-os/connector-sdk";
import { eq } from "drizzle-orm";

// Create the local Event Bus
export const syncEventEmitter = new EventEmitter();

// Default polling settings (60 seconds standard poll interval)
const DEFAULT_POLL_INTERVAL_MS = 60 * 1000;
const MAX_BACKOFF_MS = 10 * 60 * 1000; // 10 minutes maximum sleep on offline
let currentPollIntervalMs = DEFAULT_POLL_INTERVAL_MS;

// Flag to prevent overlapping execution runs
let isRunning = false;

// Instance of the Nango connector adapter
const provider = new NangoSourceProvider();

export function startSyncWorker(manager: WorkspaceManager) {
  console.log("🔄 Starting local-first Nango Delta Polling Worker...");

  const scheduleNextRun = () => {
    // Add jitter (randomness between -10% and +10%) to prevent client clustering
    const jitter = (Math.random() * 0.2 - 0.1) * currentPollIntervalMs;
    const finalInterval = Math.max(5000, currentPollIntervalMs + jitter);

    setTimeout(async () => {
      await pollSyncs(manager);
      scheduleNextRun();
    }, finalInterval);
  };

  scheduleNextRun();
}

async function pollSyncs(manager: WorkspaceManager) {
  if (isRunning) return;

  const ws = manager.active();
  const db = manager.db;

  if (!ws || !db) {
    // No active workspace selected yet, keep waiting
    return;
  }

  isRunning = true;

  try {
    // 1. Discover all connected knowledge sources
    const sources = await db.select().from(knowledgeSources);

    let anySyncFailed = false;
    let syncedSourceCount = 0;

    for (const source of sources) {
      const auth = source.authContext as NangoConfig;

      // Check if this source has Nango credentials configured
      if (auth && auth.apiKey && auth.connectionId && auth.providerConfigKey) {
        try {
          // 2. Fetch last sync cursor from metadata table
          const meta = await db
            .select()
            .from(syncMetadata)
            .where(eq(syncMetadata.sourceId, source.id));
          const lastSyncAt = meta[0] ? new Date(meta[0].lastSyncAt) : undefined;

          console.log(
            `📡 [SyncWorker] Pulling records for connection "${source.displayName}" (id: ${source.id})...`,
          );

          // 3. Fetch Delta Sync records
          const records = await provider.sync(auth, lastSyncAt);

          if (records.length > 0) {
            console.log(
              `💾 [SyncWorker] Found ${records.length} new records. Batch-persisting to SQLite...`,
            );

            // 4. Atomic transaction batch-insert
            await provider.persist(db, records);

            // 5. Fire completion event for client hot-reloading
            syncEventEmitter.emit("sync:completed", {
              sourceId: source.id,
              timestamp: new Date().toISOString(),
              recordsSynced: records.length,
              displayName: source.displayName,
            });
          } else {
            console.log(
              `✅ [SyncWorker] Connection "${source.displayName}" is up to date.`,
            );
          }

          syncedSourceCount++;
        } catch (syncErr: any) {
          console.error(
            `❌ [SyncWorker] Sync pipeline failed for source ${source.id}:`,
            syncErr.message,
          );
          anySyncFailed = true;
        }
      }
    }

    // 6. Adjust poll interval based on network health (Offline Jitter/Backoff)
    if (anySyncFailed && syncedSourceCount === 0) {
      // If we failed to reach Nango completely (e.g. offline), double interval (exponential backoff)
      currentPollIntervalMs = Math.min(
        MAX_BACKOFF_MS,
        currentPollIntervalMs * 2,
      );
      console.warn(
        `⚠️ [SyncWorker] Network issues detected. Backing off sync interval to ${Math.round(currentPollIntervalMs / 1000)} seconds.`,
      );
    } else {
      // Reset back to standard poll interval on successful sync
      currentPollIntervalMs = DEFAULT_POLL_INTERVAL_MS;
    }
  } catch (err: any) {
    console.error("❌ [SyncWorker] Worker run encountered error:", err.message);
  } finally {
    isRunning = false;
  }
}
