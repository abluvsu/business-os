# Architecture Decision Records (ADR)

This document tracks major design and engineering decisions for Business OS.

---

## ADR-001: Native Node SQLite Driver (`node:sqlite`)
- **Status**: Accepted
- **Date**: 2026-07-09
- **Decision**: Use Node 24's built-in `node:sqlite` module via Drizzle's native support instead of `better-sqlite3`.
- **Reason**: Avoids local C++ compilation (`node-gyp`) issues during dependency installation on developer environments without pre-configured Visual Studio builds.

---

## ADR-002: Workspace Configuration Isolation
- **Status**: Accepted
- **Date**: 2026-07-09
- **Decision**: Isolate all workspace internal settings, stores, logs, and database migrations within a nested `businessos/` directory inside the target folder path.
- **Reason**: Prevents pollution of the owner's startup files and provides clear boundaries for user workspace data folders.

---

## ADR-003: PID-Based Process Lock Checks
- **Status**: Accepted
- **Date**: 2026-07-09
- **Decision**: Implement a process lock using the current PID written inside `businessos/workspace.lock`. When checking active state, bypass validation locks if the PID matches the running server process PID.
- **Reason**: Prevents multiple processes (e.g. CLI tool and fastify web-server) from writing concurrently to the same SQLite database, while allowing active self-check queries on the backend without locking itself out.

---

## ADR-004: Decoupled Mock API Presentation Flow
- **Status**: Accepted
- **Date**: 2026-07-09
- **Decision**: Separate the presentation UI state, ECharts config schema, and marketing insights from the eventual AI LLM logic using mock REST endpoints.
- **Reason**: Unblocks rapid front-end visual iteration and E2E verification cycles before integrating full Instagram API ingestion routines.
