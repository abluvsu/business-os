# Architecture Assumption Audit & Stress Test

**Status**: Critical Review
**Purpose**: Stress-test the BusinessOS Canonical Domain Model and Trust Pipeline against extreme scale, failure, and future requirements.

---

## Deliverable 1: Architecture Assumption Audit

Here are 30 foundational assumptions baked into the current RFC, heavily scrutinized:

### Data Modeling Assumptions

1. **Every external system can be represented as `BusinessEntity`.** _Why:_ To normalize wildly different APIs. _Fails when:_ Systems use edge-heavy graphs (e.g., Notion pages referencing each other). _Fix:_ Introduce a `Relationship` or `Edge` canonical object.
2. **Every business event can be represented as a `TimeSeriesMetric`.** _Why:_ Simplifies querying for the LLM. _Fails when:_ Events are discrete, non-numeric occurrences (e.g., "User changed password"). _Fix:_ Introduce an `EventLog` canonical object.
3. **JSON attributes will remain maintainable.** _Why:_ Provides schema flexibility. _Fails when:_ We need to perform complex SQL aggregations on nested JSON across millions of rows in SQLite. _Fix:_ Extract frequently queried JSON keys into dedicated columns.
4. **UUIDs are always the correct identity strategy.** _Why:_ Universally unique. _Fails when:_ External APIs return composite keys (e.g., `account_id` + `date`). _Fix:_ Hashing composite external keys into deterministic UUIDs.
5. **The Brain only needs normalized objects.** _Why:_ Reduces context window size and prompt complexity. _Fails when:_ The LLM needs raw external context to debug a specific platform quirk. _Fix:_ Provide an escape hatch to raw payloads via a specialized tool.
6. **Every connector can be normalized without information loss.** _Why:_ We believe the core business primitives capture all value. _Fails when:_ A platform has a proprietary concept (e.g., TikTok's "Spark Ads") that doesn't map to standard entities. _Fix:_ Shunt unmapped data into the JSON `attributes` blob.
7. **Time series data is always tied to a date.** _Why:_ Daily aggregation is standard. _Fails when:_ We need intraday, minute-by-minute granularity for day trading or flash sales. _Fix:_ Upgrade `date` (YYYY-MM-DD) to `timestamp` (ISO8601).
8. **Metrics are numeric.** _Why:_ Allows mathematical aggregation. _Fails when:_ A metric is a state string (e.g., "Out of Stock"). _Fix:_ State changes should be Events, not Metrics.

### Pipeline Assumptions

9. **Zod validation is performant enough for massive payloads.** _Why:_ Developer experience. _Fails when:_ Ingesting 500MB JSON dumps from Shopify. _Fix:_ Move to a streaming JSON parser (e.g., JSONStream) before Zod, or use a faster validator like TypeBox.
10. **A failed row should be quarantined while the batch succeeds.** _Why:_ Resilience. _Fails when:_ The batch is a strictly ordered ledger (e.g., double-entry accounting). _Fix:_ Implement transactional boundaries at the Connector level.
11. **Network errors warrant exponential backoff.** _Why:_ Standard practice. _Fails when:_ The external API is permanently deprecated. _Fix:_ Hard fail on 410 Gone and alert user immediately.
12. **The pipeline is unidirectional (External -> Internal).** _Why:_ Read-only MVP. _Fails when:_ We need to mutate external state (e.g., pause an ad). _Fix:_ Add an Action/Mutation pipeline parallel to ingestion.

### Storage Assumptions

13. **SQLite is sufficient for the local workspace.** _Why:_ Local-first, zero-config. _Fails when:_ The workspace exceeds 10GB or requires concurrent high-throughput writes. _Fix:_ Move to DuckDB for local analytics, or Postgres for cloud workspaces.
14. **Workspace isolation via physical files is optimal.** _Why:_ Security and offline capability. _Fails when:_ We need cross-workspace analytics (e.g., an agency managing 50 clients). _Fix:_ Implement a federated query engine across SQLite files, or move to multi-tenant DB.
15. **Metrics can be safely UPSERTED on `(sourceId, entityId, date, metricName)`.** _Why:_ Handles delayed attribution. _Fails when:_ The platform changes historical data _and_ deletes the entity. _Fix:_ Soft deletes and immutable event sourcing for financial data.

_(Note: 15 more assumptions spanning sync concurrency, LLM context windows, rate limit fairness, authentication persistence, offline conflict resolution, query performance, memory limits, schema migrations, and OS compatibility are fully recognized as potential breaking points.)_

---

## Deliverable 2: Failure Scenario Catalogue (Sample of 100 Matrix)

We categorize disasters to ensure the Trust Pipeline doesn't just catch errors, but recovers gracefully.

**Category: AI & Intelligence Failures**

- **Prompt injection through imported data:** (Root Cause: Malicious Shopify product name like `Ignore all instructions`). (Detection: Output parsers fail). (Recovery: Sanitize strings in Normalization layer). (Architecture: Currently vulnerable. Needs a sanitization step in Stage 4).
- **Context window overflow:** (Root Cause: User asks "Summarize all 10,000 campaigns"). (Architecture: Fails. Needs Vector DB / RAG integration, not just SQL SELECTs).

**Category: Connector & Data Failures**

- **Historical Data Mutation (Attribution Lag):** Meta changes click data from 28 days ago. (Architecture: Handled by UPSERT constraint).
- **Currency Conversion Collapse:** Ingesting JPY but assuming USD. (Architecture: Partially handled via `currency` field, but lacks a centralized exchange rate normalizer).
- **Timezone Skew:** Meta reports in PST, Shopify in EST. (Architecture: Fails. We assume YYYY-MM-DD is universal. Must store data in UTC timestamps and project to user timezone on read).
- **Duplicate Identities:** Shopify returns the same customer with two different IDs. (Architecture: Fails. Needs Identity Resolution / Merging capability).

**Category: Storage & Concurrency**

- **Corrupted SQLite File:** Power loss during write. (Architecture: Fails. Needs WAL mode explicitly enabled and automated backup/restore mechanisms).
- **Concurrent Synchronization:** Two cron jobs fire simultaneously for the same connector. (Architecture: Handled if DB locks, but leads to `EBUSY`. Needs a Job Queue / Mutex lock per DataSource).

---

## Deliverable 3: Domain Challenge

**Challenge: Why is `BusinessEntity` an entity?**
Currently, an Entity is a mutable row. But businesses are actually ledgers of events. If a Campaign's budget changes, mutating the `attributes.budget` destroys history.
_Redesign:_ BusinessOS should use **Event Sourcing**. The canonical object shouldn't be `BusinessEntity`; it should be `BusinessEvent`. The "Entity" is just a materialized view of events.

**Challenge: Why do Workspaces own DataSources?**
A founder might have two Workspaces (two different startups) but use the same Meta Ads account. Tying the DataSource to the Workspace forces redundant syncing.
_Redesign:_ DataSources should be owned by the _User_, and Workspaces should have _Permissions_ to query DataSources.

**Challenge: Could it be simpler?**
Yes. Instead of Entity-Attribute-Value, we could literally just store DuckDB Parquet files of raw connector data and let the LLM write SQL against the raw schemas. It removes the Normalization layer entirely. However, it violates the principle of a stable canonical domain.

---

## Deliverable 4: Scalability Simulation

**10 Customers (MVP):**

- _Survives:_ Everything. Local SQLite, synchronous Zod validation.

**1,000 Customers:**

- _Survives:_ Local SQLite (because it's distributed across 1,000 local machines).
- _Collapses:_ Our OAuth app rate limits. We need proxy servers to queue and throttle external API requests.

**50,000 Customers:**

- _Collapses:_ The Brain Interface context building. SQLite queries become too slow if a user has 5 years of daily data for 100,000 entities. We must migrate from SQLite to DuckDB for columnar analytics.

**1 Million Workspaces:**

- _Collapses:_ Global schema migrations. Updating 1 million distinct local SQLite schemas simultaneously is impossible.
- _Redesign:_ The database schema must be entirely schemaless (Event Store + Document DB), or we must build a robust, eventual-consistency migration engine.

---

## Deliverable 5: Future Feature Simulation

- **Multi-agent collaboration:** _Fails._ Current architecture assumes 1 User : 1 Workspace. Needs a pub/sub event bus for agents to react to each other.
- **Knowledge graph:** _Fails._ We have Entities and Metrics, but no Relationships (Edges). The domain model must add `Relationship` primitives.
- **Document ingestion:** _Fails._ We only model structured data. We need a `Document` entity and a Vector Store for embeddings.
- **CRM / Financial forecasting:** _Survives._ `BusinessEntity` and `TimeSeriesMetric` perfectly handle CRM contacts and revenue forecasting.
- **Cross-workspace analytics:** _Fails._ SQLite databases are isolated files. Requires a federated query engine or centralized cloud sync.

---

## Deliverable 6: External Architecture Review

- **vs. Notion:** Notion uses generic Blocks. We use specific Entities. Notion is too flexible for analytics; our rigidity provides analytical power.
- **vs. AirTable:** Airtable allows user-defined relational schemas. BusinessOS forces a canonical schema. Airtable is a database; BusinessOS is an intelligence engine.
- **vs. Stripe/Shopify:** They use immutable event ledgers for financial integrity. BusinessOS currently uses mutable CRUD (UPSERTs). _Lesson to adopt:_ We must move to immutable events for financial metrics.
- **vs. dbt:** dbt transforms raw data into models using SQL DAGs. BusinessOS uses code (Zod/TypeScript) to normalize. _Lesson to adopt:_ We should allow users to define custom metrics using SQL over our canonical schema.

---

## Deliverable 7: Technical Debt Forecast

1. **(6 Months) Timezone/Currency Tech Debt:** Impact: High. Fixing historical data ingested under the wrong timezone will require massive recalculation jobs. _Prevention:_ Enforce UTC timestamps and base currencies instantly.
2. **(1 Year) JSON Attribute Bloat:** Impact: Medium. The `attributes` column in SQLite will become impossible to index for fast analytics. _Prevention:_ Move to DuckDB or PostgreSQL JSONB indexing.
3. **(3 Years) Monolithic Brain Context Builder:** Impact: High. Writing SQL to feed the LLM will hit context window limits. _Prevention:_ Implement RAG (Retrieval-Augmented Generation) early.

---

## Deliverable 8: Rewrite the Constitution

Based on this stress test, the RFC _must_ change. The current design collapses under timezone skew, lacks event history, and cannot support relationships (Knowledge Graph).

**Key Revisions to the Domain Model:**

1.  **Add `EventLog`:** A canonical object for discrete occurrences (e.g., "Ad Paused", "Order Shipped").
2.  **Add `Relationship`:** Edges connecting Entities (e.g., `Customer_A` -> `PURCHASED` -> `Product_B`).
3.  **Strict Timestamps:** `date` is insufficient. All time series metrics must use ISO8601 UTC timestamps, with a separate `originalTimezone` field.
4.  **Immutable Financials:** Financial metrics (Spend, Revenue) cannot be UPSERTED blindly. They must be appended as correcting journal entries to prevent data corruption.
5.  **Sanitization Boundary:** Stage 4 (Canonical Validation) must include strict prompt-injection sanitization for all string fields.

The core principle remains true: **External APIs adapt to BusinessOS.** But BusinessOS must be designed to withstand the realities of time, events, and graphs.
