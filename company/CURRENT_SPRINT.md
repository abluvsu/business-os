# CURRENT SPRINT

This is the company's short-term working memory. Read it immediately after
`company/COMPANY_CONTEXT.md`. It changes every sprint. It describes what we are building
today, not where we are going.

---

## 1. Sprint Identity

- **Sprint Number**: 001
- **Sprint Name**: Founder Conversation Surface
- **Theme**: Make the conversation-first promise something a founder can actually see and use.
- **Duration**: Two weeks - 2026-07-09 to 2026-07-22
- **Status**: Active

---

## 2. Sprint Goal

A founder can open Business OS and talk to a calm, local workspace that shows their marketing
through conversation and one clear chart at a time.

---

## 3. Current Product State

Verified completed capabilities from Sprint 000 (foundation):

- Local-first monorepo with strict TypeScript and workspace package management.
- Shared schema package defining workspace metadata and settings.
- Workspace SDK: create, validate, open/close, track active state, capped recent history.
- Backend service on port 4000: crash recovery, health output, graceful shutdown with lock
  cleanup, native `node:sqlite` storage (no native compilation dependency).
- Frontend on port 3000: workspace creation, loading redirection, active-status control.
- A decoupled mock presentation flow is in place (per ADR-004): UI state, chart schema, and
  mock insights are separated from future real data and AI logic.

What is **not** yet built: any real connector ingestion, any real AI response, any persistent
relational data model, any multi-user or account system.

---

## 4. Current Sprint Deliverables

Exact deliverables for Sprint 001:

- A conversation-first layout: a sidebar plus a primary conversation area.
- A sidebar that lists the four V1 connectors (Instagram, Gmail, Google Ads, Website) and
  supports navigation between them.
- An interactive conversation area backed by local mock endpoints: the founder can type, see
  a mock assistant reply, and continue the exchange. No external network calls.
- Empty chart boards that render a single mock visualization from a local chart schema
  (per ADR-004), ready to show one clear answer.
- Mock campaign cards for each connector, built from local sample data, to demonstrate the
  founder's business context in the UI.
- Brand-voice copy throughout the interface, free of banned buzzwords.

No real connector, real AI, or persistent storage work is included in this sprint.

---

## 5. Out of Scope

Must NOT be built during Sprint 001:

- Real Instagram, Gmail, Google Ads, or Website data ingestion.
- Real LLM or AI response generation.
- Relational database schema migrations and table definitions (deferred to Sprint 003).
- Background synchronization, cron jobs, or event loops (deferred).
- Report export or sharing.
- Authentication, accounts, or multi-user support.
- CRM, ERP, HR, finance, workflow automation, multi-agent systems, marketplace, or enterprise
  features (per V1 scope in `COMPANY_CONTEXT.md`).

---

## 6. Definition of Done

Objective acceptance criteria:

- [ ] A founder creates or opens a workspace and lands directly in the conversation layout
      without writing code or reading documentation.
- [ ] The conversation area accepts founder input and returns a mock assistant reply served
      from a local endpoint.
- [ ] The sidebar lists all four V1 connectors and is navigable.
- [ ] At least one chart board renders a mock visualization from a local chart schema.
- [ ] Mock campaign cards display local sample data for each connector.
- [ ] No network request leaves the machine during the open-to-chart flow (Local First).
- [ ] `pnpm run build` compiles clean; the manual end-to-end flow passes.
- [ ] Interface copy contains none of the banned words and reads in the brand voice.

---

## 7. Success Metrics

How we know Sprint 001 succeeded:

- A non-technical tester completes open -> talk -> see a chart without prompts or instructions.
- Time from app launch to first mock conversation is under 60 seconds.
- Zero external network calls are observed during the flow.
- At least one real founder (out of 1-3 tested) rates the experience "calm" and "clear" at
  4 out of 5 or higher.

---

## 8. Known Risks

**Technical**

- The mock layer must stay cleanly separated so real AI and data integration later do not
  inherit demo shortcuts (enforce the ADR-004 boundary).
- Node 24 is required for native `node:sqlite`; founders on older runtimes will fail at start.
  Mitigation: clear install messaging, not silent failure.
- Chart rendering must stay light on low-end hardware.

**Product**

- A mock UI can feel like a demo rather than a product. The conversation must still demonstrate
  genuine value, not just motion.
- Pressure to pull real connectors forward must be resisted; that is a later sprint.

**UX**

- Dashboards can overwhelm the founder (an explicit anti-goal). One clear answer beats many
  charts at all times.
- A non-technical founder may not understand what the sidebar or campaign cards represent;
  labels must be plain and self-explanatory.

---

## 9. Review Checklist

Questions every reviewer asks before merge:

- Does the founder reach a conversation without code or documentation?
- Are all external network calls absent during the flow?
- Does any screen show more charts than one clear answer requires?
- Is the copy free of banned buzzwords and consistent with the brand voice?
- Does it run on local mock data with `node:sqlite` and no new native dependencies?
- Does it honor the 8 principles, especially Conversation First and Everything should feel
  simple?
- Is any hard-to-reverse or precedent-setting decision recorded as an ADR rather than hidden
  in code?

---

## 10. Next Sprint Preview

Sprint 002 will begin connecting the founder's real data, starting with the lowest-friction
connector, and will replace mock responses with context built from that data - always behind the
same conversation surface established here. No implementation details are decided yet; that work
is scoped in its own sprint.
