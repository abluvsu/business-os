# DECISIONS

## Purpose

This document is the permanent institutional memory of Business OS. It answers one question:
**why did we make this decision?**

It is not an ADR. Individual ADRs explain single decisions in detail; this file is the
chronological index of every significant founder decision, so anyone can trace how we got here
without reading chat logs or guessing from code.

Preserving decision history matters because:

- It stops us re-litigating solved problems.
- It shows new contributors the reasoning, not just the result.
- It makes the cost we already paid (in attention, rupees, or code) visible before we undo it.
- It keeps the company consistent as more agents and people contribute.

History in this file is never deleted. Decisions are superseded or deprecated, never erased.

---

## Decision Lifecycle

Every significant decision moves through these states. A decision can sit in a state; it cannot
skip Founder Approval and remain binding.

```
Proposal → Discussion → ADR → Founder Approval → Implementation → Review → Archived
```

- **Proposal** - Someone raises an option. Nothing is decided. May live in chat, a playbook,
  or a draft.
- **Discussion** - The trade-off is examined against the 8 principles and `CURRENT_PRIORITIES.md`.
  If the call is hard-to-reverse or sets a precedent, an ADR is opened (status `Proposed`).
- **ADR** - The decision is written in the canonical ADR format (`templates/ADR_TEMPLATE.md`)
  and recorded here. Status moves from `Proposed` toward `Accepted`.
- **Founder Approval** - The Founder (or a delegated decider named in the ADR) accepts it.
  Status becomes `Accepted`. The decision is now binding.
- **Implementation** - Work proceeds against the accepted ADR.
- **Review** - At sprint review, or when a related change is proposed, the outcome is checked
  against the ADR's stated consequences.
- **Archived** - The decision is no longer the active rule for new work. It is marked
  `Deprecated` (true for old code) or `Superseded` (replaced by a new ADR). The record stays.

A decision returns to **Discussion** only when its premise changes - new constraint, principle
conflict, or MVP learning. That produces a new ADR that supersedes the old one.

---

## Decision Categories

Each decision is filed under exactly one category. Categories are mutually exclusive.

- **Product** - What the product does and does not do: scope, features, and the founder-facing
  capabilities we commit to (e.g., Founder Control, Context Before AI as product commitments).
- **Architecture** - How the system is structured and where data lives: local-first shape,
  monorepo, workspace isolation, presentation boundaries.
- **UX** - How the founder experiences the product: conversation-first surface, calm/simple
  interaction, what we deliberately do not show.
- **Branding** - Voice, personality, naming, and how the company presents itself.
- **Marketing** - How we reach and speak to founders: copy, channels, acquisition.
- **Engineering** - Specific implementation choices: libraries, drivers, tooling, lock
  mechanics. (Distinct from Architecture: if it is "which tool," it is Engineering; if it is
  "how components fit," it is Architecture.)
- **Compliance** - Privacy, data residency, and Indian founder/Indian data obligations.
- **Operations** - How we run: process, documentation, ADR adoption, sprint system.

---

## Decision Register

The chronological index. `ADR Ref` points to the detailed record in the ADR Records section
below, or to the canonical document that holds the decision.

| ID         | Title                                             | Category     | Status   | ADR Ref                                                       | Date       | Owner   |
| ---------- | ------------------------------------------------- | ------------ | -------- | ------------------------------------------------------------- | ---------- | ------- |
| D-2026-001 | Local First architecture                          | Architecture | Accepted | COMPANY_CONTEXT §8                                            | 2026-07-09 | Founder |
| D-2026-002 | Conversation First UX                             | UX           | Accepted | COMPANY_CONTEXT §8, §9                                        | 2026-07-09 | Founder |
| D-2026-003 | Founder Control                                   | Product      | Accepted | COMPANY_CONTEXT §8                                            | 2026-07-09 | Founder |
| D-2026-004 | Context Before AI                                 | Product      | Accepted | COMPANY_CONTEXT §8                                            | 2026-07-09 | Founder |
| D-2026-005 | Monorepo architecture                             | Architecture | Accepted | SPRINT_000_REVIEW                                             | 2026-07-09 | Founder |
| D-2026-006 | Native Node SQLite driver (`node:sqlite`)         | Engineering  | Accepted | ADR-001                                                       | 2026-07-09 | @shekar |
| D-2026-007 | Workspace configuration isolation (`businessos/`) | Architecture | Accepted | ADR-002                                                       | 2026-07-09 | @shekar |
| D-2026-008 | PID-based process lock checks                     | Engineering  | Accepted | ADR-003                                                       | 2026-07-09 | @shekar |
| D-2026-009 | Decoupled mock API presentation flow              | Architecture | Accepted | ADR-004                                                       | 2026-07-09 | @shekar |
| D-2026-010 | Canonical Company Foundation documents            | Operations   | Accepted | COMPANY_CONTEXT, CURRENT_SPRINT, CURRENT_PRIORITIES, GLOSSARY | 2026-07-09 | Founder |
| D-2026-011 | ADR process adoption                              | Operations   | Accepted | templates/ADR_TEMPLATE.md                                     | 2026-07-09 | Founder |

---

## Initial Decisions

The founding period (MVP, dated 2026-07-09) established the decisions below. They are the
bedrock the current sprint builds on. Definitions of the principles live in `COMPANY_CONTEXT.md`
and are not restated here; this section records only that they were adopted as binding
founder decisions.

**Founder commitment decisions (Product / UX / Architecture)**
The Founder adopted the eight product principles as non-negotiable constraints
(D-2026-001 through D-2026-004), including Local First, Conversation First, Founder Control,
and Context Before AI. These govern every later decision and are the reason cloud-by-default and
autonomous-action options were rejected from the start.

**Structural decisions (Architecture / Engineering)**
The product was built as a local-first monorepo (D-2026-005), with all workspace state
isolated under a `businessos/` directory (D-2026-007), a native `node:sqlite` driver instead
of a native-compiled package (D-2026-006, ADR-001), PID-based lock checks to allow safe
concurrent access (D-2026-008, ADR-003), and a decoupled mock presentation flow so the UI
could be validated before real ingestion (D-2026-009, ADR-004).

**Operating decisions (Operations)**
The Founder established the Company Foundation as the permanent context layer
(D-2026-010) and adopted the ADR process as the only way to record permanent decisions
(D-2026-011). From this point, no hard-to-reverse or precedent-setting call is valid unless it
has an ADR recorded in this file.

---

## Decision Rules

**What requires an ADR**
A decision needs an ADR when it is hard to reverse, sets a precedent others will copy, changes
a rule the team already follows, rejects an obvious default because of our principles, or affects
more than one package or the founder's experience. (See `templates/ADR_TEMPLATE.md`,
"When to write an ADR.")

**What can be decided without an ADR**
Routine bug fixes, one-off scripts, cosmetic UI tweaks, and anything reversible in under a day
without downstream effect. These go in the commit log, not here.

**Who approves decisions**
The Founder approves all permanent decisions. Engineering ADRs are proposed by the engineer and
accepted by the Founder; where the Founder delegates, the named decider is recorded in the ADR's
`Deciders` field (e.g., D-2026-006 through D-2026-009 name `@shekar`). Delegation does not
remove Founder ownership.

**When a decision may be revisited**
Only when its premise changes: a new constraint, a conflict between principles, or validated
MVP learning. Revisiting always produces a new ADR that supersedes the old one. Silent reversal
is forbidden.

---

## Review Process

**How decisions are reviewed**
During sprint review, and whenever a change touching an accepted ADR is proposed. Reviewers use
the ADR authoring and review checklists in `templates/ADR_TEMPLATE.md` and the review checklist
in `CURRENT_SPRINT.md`. A `Proposed` ADR that is implemented without reaching `Accepted` is a
violation and must be ratified or rolled back.

**How deprecated decisions are handled**
A decision that is still true for existing code but should not govern new work is marked
`Deprecated`. The record stays, a note explains the boundary (old vs new work), and the Register
status is updated. Nothing is removed.

**How superseded decisions are recorded**
A decision replaced by a better one is marked `Superseded (by ADR-0XX)`. The new ADR links back,
the old ADR's `Status` is updated, and the Register reflects both. The original number is kept
for stable history.

**History is never deleted.**
No ADR or register row is ever removed from this file. Deletion hides the cost we already paid
and invites repeating the mistake the record was meant to prevent.

---

## ADR Records

The detailed, individual decision records referenced by the Register above. These are preserved
verbatim from acceptance; do not edit their substance. Corrections happen by superseding, not
editing.

---

### ADR-001: Native Node SQLite Driver (`node:sqlite`)

- **Status**: Accepted
- **Date**: 2026-07-09
- **Decision**: Use Node 24's built-in `node:sqlite` module via Drizzle's native support instead of `better-sqlite3`.
- **Reason**: Avoids local C++ compilation (`node-gyp`) issues during dependency installation on developer environments without pre-configured Visual Studio builds.

---

### ADR-002: Workspace Configuration Isolation

- **Status**: Accepted
- **Date**: 2026-07-09
- **Decision**: Isolate all workspace internal settings, stores, logs, and database migrations within a nested `businessos/` directory inside the target folder path.
- **Reason**: Prevents pollution of the owner's startup files and provides clear boundaries for user workspace data folders.

---

### ADR-003: PID-Based Process Lock Checks

- **Status**: Accepted
- **Date**: 2026-07-09
- **Decision**: Implement a process lock using the current PID written inside `businessos/workspace.lock`. When checking active state, bypass validation locks if the PID matches the running server process PID.
- **Reason**: Prevents multiple processes (e.g. CLI tool and fastify web-server) from writing concurrently to the same SQLite database, while allowing active self-check queries on the backend without locking itself out.

---

### ADR-004: Decoupled Mock API Presentation Flow

- **Status**: Accepted
- **Date**: 2026-07-09
- **Decision**: Separate the presentation UI state, ECharts config schema, and marketing insights from the eventual AI LLM logic using mock REST endpoints.
- **Reason**: Unblocks rapid front-end visual iteration and E2E verification cycles before integrating full Instagram API ingestion routines.
