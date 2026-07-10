# BusinessOS Trust Pipeline RFC

**Status**: Proposed
**Category**: Irreversible (Category 1)
**Purpose**: Define the constitution of BusinessOS data. This document specifies the complete lifecycle of data from external ingestion to the Brain Interface, ensuring zero ambiguity in validation, normalization, and persistence.

---

## 1. Trust Pipeline Lifecycle

The Trust Pipeline is the immune system of BusinessOS. Its purpose is to ensure that no bad, malformed, or untyped data ever reaches the intelligence layer.

The pipeline consists of the following deterministic stages. If one stage fails, the pipeline halts for that specific payload.

```text
[External API]
      │
      ▼
1. [Connector Adapter]
      │
      ▼
2. [Raw Payload Validation] (Zod)
      │
      ▼
3. [Normalization Layer] (Mapping to Domain)
      │
      ▼
4. [Canonical Business Objects] (Zod)
      │
      ▼
5. [Business Validation] (Logical Rules)
      │
      ▼
6. [Persistence Layer] (Drizzle ORM -> SQLite)
      │
      ▼
7. [Repository Layer] (Data Access)
      │
      ▼
8. [Brain Context Builder]
```

### Stage 1: Connector Adapter

- **Purpose:** Fetches data from external APIs (e.g., Meta Graph API). Handles rate limiting, pagination, and auth.
- **Input:** Auth credentials, Sync parameters.
- **Output:** Raw JSON payload.
- **Failure:** Retry with exponential backoff for 429/500s. Halt and alert for 401/403s.

### Stage 2: Raw Payload Validation

- **Purpose:** Prove the external API hasn't changed its schema unexpectedly.
- **Input:** Raw JSON payload.
- **Output:** `RawConnectorDTO` (Strictly typed).
- **Validation:** Zod schemas matching the expected external API response. Unknown fields are stripped.
- **Failure:** Halt sync for this payload. Log schema mismatch. Do not ingest bad data.

### Stage 3: Normalization Layer

- **Purpose:** Transform the `RawConnectorDTO` into BusinessOS Domain primitives.
- **Input:** `RawConnectorDTO`.
- **Output:** Unvalidated Canonical Business Objects.
- **Failure:** Halt if required fields (e.g., spend, date) cannot be parsed or mapped.

### Stage 4: Canonical Business Objects

- **Purpose:** Guarantee type safety against our internal domain.
- **Input:** Unvalidated Canonical Objects.
- **Output:** `CanonicalDTO` (Strictly typed).
- **Validation:** Zod schemas representing the BusinessOS Domain (defined in Section 2).
- **Failure:** Halt pipeline. Bug in Normalization Layer.

### Stage 5: Business Validation

- **Purpose:** Enforce business logic invariants (e.g., "Spend cannot be negative", "Clicks cannot exceed Impressions").
- **Input:** `CanonicalDTO`.
- **Output:** Validated `CanonicalDTO`.
- **Failure:** Quarantine the specific anomalous records. Allow the rest of the batch to proceed.

### Stage 6: Persistence Layer

- **Purpose:** Safely write data to the local SQLite database.
- **Input:** Validated `CanonicalDTO`.
- **Output:** Database Transaction Success/Failure.
- **Failure:** Transaction rollback. Log SQLite error.

---

## 2. Canonical Domain Specification

This is the ubiquitous language of BusinessOS. Every layer speaks this language.

### Workspace

- **Purpose:** The physical and logical boundary of a single founder's context.
- **Owner:** The system.
- **Invariants:** Must have a valid `schemaVersion`. One SQLite DB per Workspace.

### DataSource

- **Purpose:** Represents an active connection to an external platform (e.g., "Main Shopify Store").
- **Owner:** Workspace.
- **Invariants:** Cannot sync if `status` is disconnected. Must hold valid `authContext`.

### BusinessEntity

- **Purpose:** Any object the business cares about that has state, attributes, and lifecycle (Campaign, Product, Customer).
- **Owner:** DataSource.
- **Invariants:** `externalId` must be unique per `DataSource`. Must have a standard `type` (e.g., 'campaign').
- **Mapping:** Meta AdSet -> Entity, Shopify Product -> Entity, HubSpot Contact -> Entity.

### TimeSeriesMetric

- **Purpose:** An observation of a specific value at a specific time.
- **Owner:** DataSource (and optionally tied to a BusinessEntity).
- **Invariants:** Must have a `date`. Must have a recognized `metricName` (e.g., 'spend', 'revenue'). Value cannot be null.
- **Mapping:** Meta Daily Spend -> Metric, Shopify Daily Revenue -> Metric.

### SyncJob

- **Purpose:** Audit log of ingestion attempts.
- **Owner:** DataSource.
- **Invariants:** Must record start time, end time, rows processed, and terminal status (success/failed/partial).

---

## 3. Data Contracts

No layer exposes its internal representation to another layer. Every boundary is protected by Zod.

1.  **Meta Payload** (Untyped JSON from network)
    - _Transforms to..._
2.  **Connector DTO** (e.g., `MetaInsightsResponseSchema` - Zod validated)
    - _Transforms to..._
3.  **Canonical DTO** (e.g., `TimeSeriesMetricSchema` - Zod validated)
    - _Transforms to..._
4.  **Database Entity** (Drizzle Insert Model)
    - _Transforms to..._
5.  **Repository Object** (Drizzle Select Model)
    - _Transforms to..._
6.  **Brain Context Object** (A highly compressed, token-optimized string or JSON representation fed to the LLM)

---

## 4. Failure Philosophy

A trustworthy system is defined by how it behaves when things go wrong.

- **What if one metric in a batch cannot be normalized?**
  - The specific metric is quarantined (logged). The rest of the batch succeeds. We do not punish the whole dataset for one bad row.
- **What if Meta introduces a new field?**
  - Because our Zod `RawConnectorDTO` uses `.strip()`, unknown fields are safely ignored. The pipeline continues uninterrupted.
- **What if historical data changes (e.g., delayed attribution)?**
  - `TimeSeriesMetric` rows are UPSERTED using a composite unique key (`sourceId`, `entityId`, `date`, `metricName`). Newer syncs safely overwrite old values.
- **What if a connector partially succeeds?**
  - The `SyncJob` is marked as `partial`. The data that made it through the pipeline is committed.
- **What gets rejected?**
  - Payloads failing Zod schema validation. Negative financial metrics.
- **What gets retried?**
  - Network timeouts, 500s, SQLite `EBUSY` locks.

---

## 5. Design for Future Connectors

Validation of the Domain Model against 5 disparate integrations:

1.  **Meta Ads:**
    - Campaigns -> `BusinessEntity` (type: 'campaign')
    - Daily Spend/Clicks -> `TimeSeriesMetric` (metricName: 'spend', 'clicks')
2.  **Google Ads:**
    - Campaigns -> `BusinessEntity` (type: 'campaign')
    - Daily Spend/Conversions -> `TimeSeriesMetric`
3.  **Shopify:**
    - Products -> `BusinessEntity` (type: 'product')
    - Daily Revenue/Orders -> `TimeSeriesMetric` (metricName: 'revenue', 'orders')
4.  **HubSpot:**
    - Contacts -> `BusinessEntity` (type: 'customer')
    - Daily New Leads -> `TimeSeriesMetric` (metricName: 'leads_generated')
5.  **Stripe:**
    - Subscriptions -> `BusinessEntity` (type: 'subscription')
    - Daily MRR -> `TimeSeriesMetric` (metricName: 'mrr')

**Conclusion:** The Domain Model holds. No changes to the core architecture are required to support any of these platforms. External APIs adapt to BusinessOS; BusinessOS does not adapt to them.

---

## 6. Schema Review Before Implementation

The database schema emerges from the domain, not the other way around.

### Table: `data_sources`

- **Responsibility:** Tracks active connections.
- **PK:** `id` (UUID).
- **FK:** `workspace_id` (Cascades).
- **Extensibility:** Contains a JSON `auth_context` column for flexible credential storage.

### Table: `business_entities`

- **Responsibility:** Stores all stateful objects (Campaigns, Products).
- **PK:** `id` (UUID).
- **FK:** `source_id` (Cascades).
- **Unique Constraint:** `(source_id, external_id)` - Prevents duplicating the same Shopify product.
- **Extensibility:** Contains a JSON `attributes` column. We never add columns for specific platforms (no `meta_objective` column).

### Table: `time_series_metrics`

- **Responsibility:** Stores all numerical observations over time.
- **PK:** `id` (UUID).
- **FK:** `source_id`, `entity_id` (Nullable, Cascades).
- **Unique Constraint:** `(source_id, entity_id, date, metric_name)` - Enables safe UPSERTs for historical data corrections.
- **Index Strategy:** Index on `(workspace_id, date, metric_name)` to make Brain Interface context-building queries lightning fast.

---

_End of Trust Pipeline RFC_
