import { IKnowledgeSourceProvider } from "./types";
import {
  businessEntities,
  observations,
  syncMetadata,
} from "@business-os/workspace";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Define validation schemas for Nango cloud payloads
const NangoRecordSchema = z.object({
  id: z.string(),
  model: z.string().optional(), // "BusinessEntity" or "Observation"
  // BusinessEntity properties
  workspaceId: z.string().optional(),
  sourceId: z.string().optional(),
  externalId: z.string().optional(),
  type: z.string().optional(),
  name: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  attributes: z.any().optional(),
  // Observation properties
  entityId: z.string().optional(),
  date: z.string().optional(),
  originalTimezone: z.string().optional(),
  observationType: z.string().optional(),
  value: z.number().optional(),
  currency: z.string().nullable().optional(),
});

const NangoRecordsResponseSchema = z.object({
  records: z.array(NangoRecordSchema),
});

export interface NangoConfig {
  apiKey: string;
  connectionId: string;
  providerConfigKey: string;
  baseUrl?: string;
}

export class NangoSourceProvider implements IKnowledgeSourceProvider<
  NangoConfig,
  any[],
  any[]
> {
  config = {
    connectorId: "nango_delta_sync",
    displayName: "Nango Managed Connection (Delta Sync)",
  };

  private baseUrl: string = "https://api.nango.dev";

  async authenticate(config: NangoConfig): Promise<NangoConfig> {
    if (!config.apiKey || !config.connectionId || !config.providerConfigKey) {
      throw new Error(
        "Invalid Nango configurations: apiKey, connectionId, and providerConfigKey are required.",
      );
    }
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }

    // Check connection health/status via Nango endpoint
    const url = `${this.baseUrl}/connection/${config.connectionId}?provider_config_key=${config.providerConfigKey}`;
    const response = await this.fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to authenticate connection with Nango. Status: ${response.status}`,
      );
    }

    return config;
  }

  async discover(config: NangoConfig): Promise<unknown> {
    const url = `${this.baseUrl}/connection/${config.connectionId}?provider_config_key=${config.providerConfigKey}`;
    const res = await this.fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    return res.json();
  }

  async sync(config: NangoConfig, lastSyncAt?: Date): Promise<any[]> {
    this.baseUrl = config.baseUrl || this.baseUrl;

    let updatedAfter = lastSyncAt?.toISOString();
    const models = ["BusinessEntity", "Observation"];
    let allRecords: any[] = [];

    for (const model of models) {
      let cursor: string | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        let url = `${this.baseUrl}/records?connectionId=${config.connectionId}&providerConfigKey=${config.providerConfigKey}&model=${model}`;

        if (updatedAfter) {
          url += `&updated_after=${encodeURIComponent(updatedAfter)}`;
        }
        if (cursor) {
          url += `&cursor=${encodeURIComponent(cursor)}`;
        }

        const response = await this.fetchWithRetry(url, {
          headers: { Authorization: `Bearer ${config.apiKey}` },
        });

        const json = await response.json();
        const validated = NangoRecordsResponseSchema.parse(json);

        allRecords = allRecords.concat(
          validated.records.map((r) => ({ ...r, _model: model })),
        );

        if (json.next_cursor) {
          cursor = json.next_cursor;
        } else {
          hasMore = false;
        }
      }
    }

    return allRecords;
  }

  async normalize(rawPayload: any[]): Promise<any[]> {
    return rawPayload;
  }

  async validate(normalizedData: any[]): Promise<boolean> {
    for (const record of normalizedData) {
      NangoRecordSchema.parse(record);
    }
    return true;
  }

  async persist(db: any, normalizedData: any[]): Promise<void> {
    if (normalizedData.length === 0) return;

    const firstRecord = normalizedData[0];
    const sourceId = firstRecord.sourceId || "nango-connection";
    const workspaceId = firstRecord.workspaceId || "ws-active";

    await db.transaction(async (tx: any) => {
      let entityCount = 0;
      let obsCount = 0;

      for (const item of normalizedData) {
        if (item._model === "BusinessEntity") {
          await tx
            .insert(businessEntities)
            .values({
              id: item.id,
              workspaceId: workspaceId,
              sourceId: sourceId,
              externalId: item.externalId || item.id,
              type: item.type || "organic_post",
              name: item.name || "Unnamed Entity",
              status: item.status || "completed",
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString(),
              attributes:
                typeof item.attributes === "string"
                  ? item.attributes
                  : JSON.stringify(item.attributes || {}),
            })
            .onConflictDoUpdate({
              target: [businessEntities.sourceId, businessEntities.externalId],
              set: {
                name: item.name || "Unnamed Entity",
                status: item.status || "completed",
                updatedAt: item.updatedAt || new Date().toISOString(),
                attributes:
                  typeof item.attributes === "string"
                    ? item.attributes
                    : JSON.stringify(item.attributes || {}),
              },
            });
          entityCount++;
        } else if (item._model === "Observation") {
          await tx
            .insert(observations)
            .values({
              id: item.id,
              workspaceId: workspaceId,
              sourceId: sourceId,
              entityId: item.entityId,
              date: item.date || new Date().toISOString(),
              originalTimezone: item.originalTimezone || "UTC",
              observationType: item.observationType || "clicks",
              value: item.value ?? 0,
              currency: item.currency || null,
            })
            .onConflictDoUpdate({
              target: [
                observations.sourceId,
                observations.entityId,
                observations.date,
                observations.observationType,
              ],
              set: {
                value: item.value ?? 0,
              },
            });
          obsCount++;
        }
      }

      const today = new Date().toISOString();
      await tx
        .insert(syncMetadata)
        .values({
          sourceId: sourceId,
          lastSyncAt: today,
          recordsSynced: entityCount + obsCount,
        })
        .onConflictDoUpdate({
          target: [syncMetadata.sourceId],
          set: {
            lastSyncAt: today,
            recordsSynced: entityCount + obsCount,
          },
        });
    });
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 4,
    delay = 1000,
  ): Promise<Response> {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res;
    } catch (err) {
      if (retries > 0) {
        console.warn(
          `[NangoSourceProvider] Fetch failed. Retrying in ${delay}ms... Remaining retries: ${retries}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw err;
    }
  }
}
