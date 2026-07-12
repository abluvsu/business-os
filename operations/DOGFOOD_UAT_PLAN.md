# BusinessOS Dogfood UAT Plan & Function Inventory

This document defines the baseline state, function inventory, and UAT test plan for the BusinessOS local dogfooding release.

---

## 1. Current Git State

At the start of Phase 0, the git status shows the following modified files in the repository:
- `apps/server/package.json`: Updated dependency versions to downgrade `@fastify/compress` (to `^7.0.0`) and `@fastify/cors` (to `^8.3.0`) to resolve startup crash compatibility issues with Fastify v4.x.
- `package.json`: Standardized lockfile definitions.
- `pnpm-lock.yaml`: Regenerated lockfile.
- `render.yaml`: Updated build/start commands to use `pnpm` workspace filters instead of standard `npm` install commands to avoid dependency resolution errors.

All workspaces pass standard typechecks (`pnpm typecheck` successfully completed).

---

## 2. Environment Variables Checklist

The following environment variables are required for the dogfood release. None of the values are printed here, only their presence or configuration status:

### Apps Server (`apps/server/.env`)
- `DOGFOOD_MODE`: Set to `true` to enable strict dogfood runtime rules (no mock fallbacks, strict validation, honest errors).
- `WEB_URL`: Explicit URL of the running Next.js frontend (e.g. `http://localhost:3000` or `http://localhost:3001`).
- `API_URL`: Explicit URL of the running Fastify backend (e.g. `http://localhost:4000`).
- `META_APP_ID`: Meta developer application ID.
- `META_APP_SECRET`: Meta developer application client secret.
- `META_REDIRECT_URI`: Instagram OAuth callback URI (e.g. `${API_URL}/api/connectors/instagram/callback`).
- `GOOGLE_CLIENT_ID`: Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
- `GOOGLE_REDIRECT_URI`: Gmail OAuth callback URI (e.g. `${API_URL}/api/connectors/gmail/callback`).
- `PRIMARY_AI_PROVIDER`: Name of primary AI LLM provider (e.g. `groq` or `openai`).
- `PRIMARY_AI_BASE_URL`: API base URL for the primary LLM API.
- `PRIMARY_AI_API_KEY`: API key for the primary LLM.
- `PRIMARY_AI_MODEL`: Model ID to use (e.g. `llama-3.1-8b-instant`).
- `FALLBACK_AI_PROVIDER`: Fallback LLM provider configuration.
- `FALLBACK_AI_BASE_URL`: Base URL for the fallback LLM.
- `FALLBACK_AI_API_KEY`: API key for the fallback LLM.
- `FALLBACK_AI_MODEL`: Model ID for the fallback LLM.
- `TURSO_CONNECTION_URL`: URL of the Turso database (if remote) or local path.
- `TURSO_AUTH_TOKEN`: Auth token for Turso SQLite.
- `CLERK_PUBLISHABLE_KEY`: Clerk authentication publishable key.
- `CLERK_SECRET_KEY`: Clerk authentication secret key.
- `NANGO_SECRET_KEY`: Nango authentication secret key (optional if bypassed).

### Apps Web (`apps/web/.env`)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key for frontend.
- `CLERK_SECRET_KEY`: Clerk secret key for SSR/Server Actions.
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g. `http://localhost:4000`).

---

## 3. Function Inventory Table

| Founder-Visible Function | API Route / Component | Current State | Acceptance Criterion (UAT Pass) |
| :--- | :--- | :--- | :--- |
| **Create Workspace** | `POST /api/workspace/create` | **Working** | User can enter a name and successfully create a new workspace container locally. |
| **Open Workspace** | `POST /api/workspace/open` | **Working** | User can open an existing workspace path and load metadata/database connections. |
| **Active Workspace Check** | `GET /api/workspace/active` | **Working** | Web app automatically queries active status and redirects to onboarding or dashboard. |
| **Recent Workspaces** | `GET /api/workspace/recent` | **Working** | Displays previously opened workspace paths on startup. |
| **Close Workspace** | `POST /api/workspace/close` | **Working** | Gracefully releases lock files and database connections. |
| **Company Onboarding** | `POST /api/company/analyze-website` | **Mock / Heuristic** | Performs analysis of the founder's business URL via primary LLM or local fallback. |
| **Company Profile CRUD** | `POST/GET /api/company/profile` | **Working** | Stores and retrieves onboarding answers from the sqlite DB. |
| **Connect Instagram (OAuth)** | `GET /api/connectors/instagram/auth` / `ConnectionManager` | **Broken (Hardcoded Redirects)** | Initiates Meta auth flow and redirects back to the configured `WEB_URL` instead of hardcoded `localhost:3000`. |
| **Connect Gmail (OAuth)** | `GET /api/connectors/gmail/auth` / `ConnectionManager` | **Broken (Hardcoded Redirects)** | Initiates Google auth flow and redirects back to the configured `WEB_URL`. |
| **Sync Instagram Data** | `POST /api/connectors/instagram/sync` / `ConnectionManager` | **Mock / Fabricated** | Fetches real Instagram account and organic media posts/insights. Never falls back to mock campaigns. |
| **Sync Gmail Data** | `POST /api/connectors/gmail/sync` / `ConnectionManager` | **Mock / Unimplemented** | Lists threads and activity data from real Gmail account in read-only mode. No open rates. |
| **Ask Business Questions** | `POST /api/chat` / `ConversationArea` | **Mock Fallbacks** | Narrow real-data conversation pipeline that yields evidence-backed answers (organic reach/posts, email activity) without fabrications or paid-ad pauses. |
| **Product Health Metrics** | `GET /api/analytics/health` / Dashboard | **Mock / Hardcoded** | Displays actual sessions, activation stages, TTFI, sync durations, failures, and retries based on real DB events. |

---

## 4. Local UAT Test Plan

Once dogfooding mode is fully set up, the manual UAT test suite will be run step-by-step:

1. **Initial Clean Launch**: Launch app with missing Meta or Google configuration, verify that it surfaces a clean, jargon-free setup guide or environment preflight alert.
2. **Tenancy Lifecycle**: Create a workspace, exit the app, launch it again, verify that the workspace is re-opened.
3. **Instagram Authentication & Account Selection**: Click Connect Instagram, cancel OAuth, verify recovery. Complete OAuth, discover pages/accounts, select creator/business page, sync.
4. **Truthful Instagram Syncing**: Verify the synced items under "Analysis". Ensure only real posts are imported.
5. **Gmail Authentication & Sync**: Authenticate with Google, pull threads/messages, list inbound threads.
6. **Honest AI Chat Queries**: Ask organic Instagram and Gmail questions, verify answers contain evidence (range/source/limitations) and no paid ad ROAS assertions.
7. **Product Health Check**: Verify that "Product Health" charts match actual metrics (total sessions, total questions, sync durations) calculated from the `analytics_events` table.
