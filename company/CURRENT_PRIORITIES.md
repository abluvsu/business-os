# CURRENT PRIORITIES

This document tells every agent - engineering, marketing, branding, SEO, copywriting,
compliance, and research - what to optimize for when making a decision. It is about _how to
choose_, not what the product is or what this sprint ships. Read it after
`company/COMPANY_CONTEXT.md` and `company/CURRENT_SPRINT.md`.

When two valid options exist, this document breaks the tie.

---

## 1. Primary Objective

Optimize every decision toward proving that a non-technical solo founder will return to
Business OS to answer a real marketing question.

---

## 2. Current Priorities

Ordered by importance. Each explains why it earns its place.

1. **Prove the founder comes back.** MVP exists only to validate usage, not to accumulate
   features. A returning founder is the only signal that matters right now; everything else is
   support for that proof.
2. **Keep the experience calm and simple.** Our user is non-technical and time-poor. Any
   addition that raises cognitive load loses more than it gains. One clear answer beats ten
   capabilities they must learn.
3. **Protect Local First and zero lock-in.** Trust is the wedge. Once user data leaves the
   machine by default, or gets trapped, we cannot undo the damage to that relationship.
4. **Hold cost near zero.** The founder spends under $100 a month on all software. A recurring
   bill we add is a recurring risk to their survival and ours. Free and local win by default.
5. **Ship working software every sprint.** Engineering capacity is small. Stalled work is lost
   work. A narrow thing that runs beats a broad thing that does not.

---

## 3. Decision Filters

Run every proposed idea through these six questions. Answer each with yes or no.

- Does it help the MVP?
- Does it reduce complexity?
- Does it improve founder experience?
- Does it preserve Local First?
- Does it keep costs low?
- Can it be demonstrated to a user?

**Tie-break rule:** An idea that answers _no_ to "Does it help the MVP?" or _no_ to "Can it
be demonstrated to a user?" is deferred, regardless of how good it sounds. An idea that raises
complexity or cost without improving the demonstrated founder experience is rejected.

---

## 4. Current Constraints

Only verified constraints. These are facts, not preferences.

- **Solo founder** - one user, no team, no internal champion to adopt on their behalf.
- **Limited budget** - under $100/month for all software combined.
- **Local-first** - the product runs on the founder's machine; we do not operate a server.
- **Zero-code users** - the founder never writes or reads code; configuration is a failure.
- **MVP stage** - the goal is validation, not completeness or scale.
- **Limited engineering capacity** - small team, so leverage and reuse beat raw output.

---

## 5. Things We Are Deliberately Ignoring

Valuable, but intentionally postponed. Do not start these without an ADR and a founder
decision.

- Real connector ingestion (Instagram, Gmail, Google Ads, Website) - begins in a later
  sprint, behind the existing conversation surface.
- Real AI or LLM response generation - the mock boundary stays until data exists to ground it.
- Persistent relational data model - deferred until data structures are proven.
- Background synchronization and automation loops - manual import is acceptable for now.
- Authentication, accounts, and multi-user support - a solo founder needs none of it yet.
- CRM, ERP, HR, finance, workflow automation, multi-agent systems, marketplace, enterprise
  features - out of V1 entirely.
- Paid user acquisition and advertising - we cannot measure or fund it yet.
- Localization beyond English and mobile apps - valuable later, not now.

---

## 6. Founder Rules

Operating rules for everyone contributing to this repository.

- **Ship over perfection.** A working, narrow release teaches more than a flawless plan.
- **Build reusable assets.** Prefer one durable document, component, or pattern over ten
  one-off efforts.
- **Avoid unnecessary abstraction.** Name the thing. Do not invent a layer until two real
  cases demand it.
- **Every sprint ends with working software.** If it does not run, it did not ship.
- **Documentation should enable execution.** Write so the next agent acts without asking.
- **Default to the boring choice.** Free, local, and plain beats clever, paid, and novel.
- **Say no early and often.** A deferred idea is cheaper than a built and maintained one.

---

## 7. Exit Criteria

These priorities should change only when the following are all true, and only through an ADR
plus an explicit founder decision:

- A repeatable set of real founders uses Business OS at least weekly to answer marketing
  questions (the return signal is confirmed, not hoped for).
- At least one connector delivers real, non-mock value end-to-end through the conversation
  surface.
- Per-founder cost is confirmed sustainable within the under-$100/month limit.
- The conversation surface is demonstrably calmer and clearer for this user than a dashboard
  alternative.

When these hold, the company graduates from _validate_ priorities to _grow_ priorities. Until
then, this document stands unchanged.
