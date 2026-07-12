# Errors

Command failures and integration errors.

---

## [ERR-20260712-004] workspace_database_test

**Logged**: 2026-07-12T00:00:00+05:30
**Priority**: medium
**Status**: pending
**Area**: tests

### Summary
The only automated test fails because its fixture violates the workspace foreign-key constraint.

### Error
`connection.test.ts` inserts `knowledge_sources.workspace_id = ws-1` without first inserting the referenced workspace, causing SQLite error 787 (`FOREIGN KEY constraint failed`).

### Context
- The test runner executed successfully from `apps/server/node_modules/.bin/tsx.cmd`.
- Test result: 0 passed, 1 failed.

### Suggested Fix
Create the required organization and workspace fixtures before inserting the knowledge source, then add route-level tenancy tests.

### Metadata
- Reproducible: yes
- Related Files: packages/workspace/src/db/connection.test.ts
- Pattern-Key: tests.foreign-key-fixture
- Recurrence-Count: 1
- First-Seen: 2026-07-12
- Last-Seen: 2026-07-12

---

## [ERR-20260712-003] test_runner_path

**Logged**: 2026-07-12T00:00:00+05:30
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
The TypeScript test runner is linked in `apps/server/node_modules`, not at the monorepo root.

### Error
The root path `node_modules/.bin/tsx.cmd` was not found.

### Context
- Type checks use the root TypeScript binary successfully.
- The workspace database test needs the server package's `tsx` binary in this installation layout.

### Suggested Fix
Run the runner from `apps/server/node_modules/.bin/tsx.cmd` or declare a root test script.

### Metadata
- Reproducible: yes
- Pattern-Key: deps.module-not-found
- Recurrence-Count: 1
- First-Seen: 2026-07-12
- Last-Seen: 2026-07-12

---

## [ERR-20260712-002] corepack_pnpm

**Logged**: 2026-07-12T00:00:00+05:30
**Priority**: medium
**Status**: pending
**Area**: config

### Summary
The pnpm binary is not installed or cached, so Corepack attempted a registry download that the sandbox blocked.

### Error
`corepack pnpm --version` failed while fetching `https://registry.npmjs.org/pnpm/latest` with `EACCES`.

### Context
- Node 24 and Corepack are installed.
- `pnpm` is unavailable on PATH.
- The repository build therefore could not be executed in the current sandbox.

### Suggested Fix
Provide pnpm through the project/runtime image or authorize a controlled package-manager download before build verification.

### Metadata
- Reproducible: yes
- Pattern-Key: deps.module-not-found
- Recurrence-Count: 1
- First-Seen: 2026-07-12
- Last-Seen: 2026-07-12

---

## [ERR-20260712-001] shell_command

**Logged**: 2026-07-12T00:00:00+05:30
**Priority**: medium
**Status**: resolved
**Area**: config

### Summary
PowerShell command construction corrupted quoted ripgrep patterns during repository inspection.

### Error
Two read-only searches failed: one with a PowerShell parser error near `@ts-ignore`, and one with an unclosed ripgrep group after quote escaping changed the regex.

### Context
- Attempted a read-only repository inventory and risk-marker search.
- No repository files were read or changed by the failed command.

### Suggested Fix
Use small searches with simple single-quoted patterns; avoid quote-heavy combined regexes in PowerShell.

### Metadata
- Reproducible: yes
- Pattern-Key: shell.nonzero-exit
- Recurrence-Count: 2
- First-Seen: 2026-07-12
- Last-Seen: 2026-07-12

---
