# Sprint 001 Review: Ask Your Business (UX Prototype)

## Goal
Establish a conversational interface and side-by-side visualization boards. Ensure a founder can fully understand the product capabilities in under 60 seconds.

## Completed
1. **ChatGPT-like split view**: Refactored `apps/web` to split viewport between a conversational feed (left) and dynamic data panel (right).
2. **Simulated stream typing**: Integrated typing visualizer inside the chat client to enhance readability.
3. **Interactive Graphics**: Integrated Apache ECharts in Next.js using a responsive ref container to draw CTR bars.
4. **Mock API Gateway**: Added Fastify routes in `/api/chat`, `/api/campaigns`, and `/api/connectors/status` to bypass LLM/integration waits.
5. **Sidebar redesign**: Updated tabs to `Workspace` (conversations panel), `Reports`, `Knowledge` (local context database), `Connectors`, and `Settings`.
6. **PID Lock Self-Correction**: Resolved self-locking validation loops when processes verify active states.
7. **Decision Ledger**: Initialized `company/DECISIONS.md` tracking major architectural entries.

## Verification
- **Builds**: Successful compilations across all 11 monorepo packages.
- **E2E Validation**: Completed browser verification recording capturing the campaign query flow, typing animation, ECharts loading, Instagram connected display, and settings details.

## Lessons Learned
- **Mock-driven design**: Designing mockup endpoints first unblocks frontend UX optimization and speeds up feedback loops.
- **Process Boundaries**: Active checks must distinguish current process IDs from external locking PIDs to prevent self-exclusion.

## Technical Debt
- Real LLM semantic routers and Instagram data ingestion schema mappings.

## Deferred
- Context-Engine memory retrieval and vector embeddings.

## Risks
- Client-side ECharts load sizes (handled via custom rendering wrappers).

## Next Sprint
- **Sprint 002 (Connect Instagram)**: Shift from mock APIs to real data ingestion. Authenticate and pull real Instagram campaign metrics and post logs.

## Merge Decision
- **APPROVED**: Merging to `main` branch, tagged `v0.0.2-ask-your-business`.
