# BusinessOS Canonical Domain Model

**Status**: Proposed
**Category**: Irreversible (Category 1)
**Purpose**: Define the platform-agnostic, canonical data contracts that form the core of BusinessOS.

## The Principle of Ingestion

External systems (Meta, Shopify, HubSpot, Google) are highly volatile and opinionated. BusinessOS must never inherit their technical debt or domain biases.

**Rule:** External payloads NEVER cross into the BusinessOS intelligence layer. They are intercepted by the _Trust Pipeline_ (Connector SDK), validated, and transformed into the structures defined in this document. The Brain Interface only ever reasons over these canonical structures.

---

## 1. The Workspace Model

The Workspace is the physical boundary of a single founder's business context.

```typescript
type WorkspaceID = string; // UUID

interface Workspace {
  id: WorkspaceID;
  name: string;
  ownerId: string;
  createdAt: string; // ISO8601 UTC
  schemaVersion: string;
}
```

## 2. The Connector & Data Source Model

A **Connector** is the logic (e.g., the Instagram integration). A **DataSource** is an active instance of that connector (e.g., "Ashutosh's Instagram Ads Account").

```typescript
type ConnectorID = string; // e.g., "meta_ads_v1"
type DataSourceID = string;

interface DataSource {
  id: DataSourceID;
  workspaceId: WorkspaceID;
  connectorId: ConnectorID;
  status: "healthy" | "degraded" | "disconnected" | "syncing";
  displayName: string; // e.g., "Main Shopify Store"
  lastSuccessfulSyncAt: string | null;
  authContext: Record<string, unknown>; // Securely stored token references
}
```

## 3. The Business Entity Model

This is the most critical abstraction. A "Business Entity" is anything the business cares about that has state, attributes, and relationships.

- In Shopify, it's a `Product` or an `Order`.
- In Meta, it's an `AdSet` or a `Campaign`.
- In HubSpot, it's a `Contact`.

We use an Entity-Attribute-Value (EAV) or JSON-b structured document approach for flexibility, bound by strict schemas per `EntityType`.

```typescript
type EntityID = string;
type EntityType = "campaign" | "customer" | "product" | "order" | "invoice";

interface BusinessEntity {
  id: EntityID; // Our internal UUID
  workspaceId: WorkspaceID;
  sourceId: DataSourceID; // Which system provided this?
  externalId: string; // The ID in the external system (e.g., Shopify Order ID)
  type: EntityType;

  // Standardized fields every entity must have
  name: string;
  status: "active" | "inactive" | "archived" | "completed" | "unknown";
  createdAt: string;
  updatedAt: string;

  // Platform-specific, normalized payload
  attributes: Record<string, unknown>;
}
```

## 4. The Campaign Model (Specific Entity Projection)

Because marketing is our MVP focus, we provide a strongly-typed projection for the `campaign` EntityType.

```typescript
interface CampaignEntity extends BusinessEntity {
  type: "campaign";
  attributes: {
    budget: {
      amount: number;
      currency: string;
      type: "daily" | "lifetime";
    };
    targetAudience?: string;
    objective: string; // e.g., "lead_generation", "conversion"
  };
}
```

## 5. The Time-Series Metric Model

BusinessOS intelligence fundamentally relies on observing change over time. Metrics must be decoupled from the Entities they measure so we can join disparate sources (e.g., Meta Ad Spend vs. Shopify Revenue on the same date).

We use a generalized metric schema.

```typescript
type MetricName =
  "spend" | "impressions" | "clicks" | "conversions" | "revenue" | "sessions";

interface TimeSeriesMetric {
  id: string; // UUID
  workspaceId: WorkspaceID;
  sourceId: DataSourceID;
  entityId: EntityID | null; // Null if it's a global metric not tied to a specific entity

  date: string; // "YYYY-MM-DD"

  metricName: MetricName;
  value: number;
  currency?: string; // Optional, required if value is monetary
}
```

---

## Architectural Implications

### 1. The Trust Pipeline Contract

Any new Connector we build (e.g., the Instagram MVP) must map its raw `/insights` API response into an array of `TimeSeriesMetric` objects and its `/campaigns` API response into `BusinessEntity` objects. If the raw data fails to map cleanly, the Connector throws a validation error and the data is rejected.

### 2. The Intelligence Pipeline Contract (Brain Interface)

The LLM never sees a raw JSON payload from Facebook.
When a user asks: _"Why did my CPA spike this week?"_

The Context Builder will execute SQL:

1. `SELECT * FROM time_series_metrics WHERE date >= [last_week] AND metricName IN ('spend', 'conversions')`
2. `SELECT * FROM business_entities WHERE type = 'campaign' AND status = 'active'`

The LLM is fed these canonical, perfectly structured TypeScript objects. It only needs to understand how `spend` relates to `conversions`. It never needs to know what an Instagram `ad_id` or `objective_type` is.

### 3. Database Schema Evolution

Our SQLite schema must be refactored from `campaigns` and `metrics` to `data_sources`, `business_entities`, and `time_series_metrics`. This normalizes the database, allowing us to add Shopify tomorrow without running a single `ALTER TABLE` query.
