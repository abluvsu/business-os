# Sprint 000 Review: Foundation Setup

## Goal
Build a stable, type-safe, local-first monorepo foundation with workspaces for shared packages, backend REST API, and frontend client.

## Completed
1. **Monorepo Structure**: Setup root configurations, `pnpm` workspaces, and strict TypeScript rules (`tsconfig.json`).
2. **Shared Package (`packages/shared`)**: Defined Zod schemas and inferred types for workspace metadata (`workspace.yaml`) and settings (`settings.json`).
3. **Workspace SDK (`packages/workspace`)**:
   - Initializer: Configured workspace file structures and templates.
   - Validator: Validates schemas, lock paths, and identifies crashes.
   - Manager: Implements workspace active states, open/close pipelines, and capped recents history.
4. **Backend Server (`apps/server`)**: Custom Fastify server running on port 4000. Implements crash recovery prompts, detailed health outputs, and graceful shutdown lock cleanup. Swapped `better-sqlite3` for Node's native `node:sqlite` to remove compilation dependencies.
5. **Frontend Application (`apps/web`)**: Next.js client running on port 3000 styled with Tailwind CSS v4. Implements workspace creation panels, loading redirection, and active status control panels.

## Verification
- **Compilation**: Verified clean TypeScript compilation by running `pnpm run build` at the root.
- **E2E Manual Testing**: Executed browser flow tests simulating workspace creation, dashboard validation, crash detection, unmounting, and history loading.

## Lessons Learned
- **Native SQLite driver (`node:sqlite`)**: Leveraging the built-in database module in Node 24 completely resolves native compiler toolchain errors (e.g. Visual Studio Desktop C++ workload requirements for `node-gyp`), lowering onboarding friction.
- **Pnpm Settings**: Project configurations like `onlyBuiltDependencies` must be placed in `pnpm-workspace.yaml` in newer versions of pnpm.

## Technical Debt
- Postponed database schema migrations and relational tables definition until data structures are finalized in Sprint 003.

## Deferred
- Background synchronization cron-jobs and event loops (V1 scheduled manual importers).

## Risks
- Direct folder path inputs: File permission issues might block lock creation if path points to system directories. Added path error validation.

## Next Sprint
- **Sprint 001**: Shift focus to User Experience. Establish a ChatGPT-like dashboard layout, sidebar layout, interactive mock AI messaging, empty chart boards, and mock campaigns.

## Merge Decision
- **APPROVED**: Merging to `main`, tagged `v0.0.1-foundation`.
