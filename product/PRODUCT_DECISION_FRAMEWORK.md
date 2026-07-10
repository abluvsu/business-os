# PRODUCT DECISION FRAMEWORK

This document defines how Business OS makes product decisions. It is the bridge
between company strategy and engineering execution. Every proposed feature, connector,
workflow, UX change, pricing idea, or roadmap item must be evaluated against
this framework before implementation. It exists to prevent feature creep and preserve
product focus.

**Inputs (canonical only):** `COMPANY_CONTEXT.md`, `CURRENT_PRIORITIES.md`,
`DECISIONS.md`, `BRAND_FOUNDATION.md`, `ICP.md`, `CUSTOMER_PROBLEMS.md`,
`VALUE_PROPOSITION.md`, `BUYING_DECISION_MODEL.md`, `TRUST_MODEL.md`,
`CATEGORY_STRATEGY.md`, `PROOF_MODEL.md`. No new strategy is introduced.

---

## 1. Purpose

Give Product and Engineering one shared test a proposal must pass: _which documented
customer problem does this solve, and does it preserve the category, trust, and proof
bar?_ The framework turns the Strategic Reasoning Layer into a reject/accept gate so
that "we could add it" is never enough reason to build.

---

## 2. Product Philosophy

Business OS should evolve by **deepening one thing**, not widening. The product is
a calm, local, conversation-first Workspace that helps a solo founder understand
their marketing. Growth comes from answering the founder's questions more reliably -
not from more surfaces, more connectors, or more settings.

Per `CURRENT_PRIORITIES.md`, the only job during MVP is to prove a founder
_returns_. Every evolution is judged by whether it makes that return more likely,
not by whether it is technically interesting. We ship working software every sprint
(`CURRENT_PRIORITIES.md` Founder Rule); a narrow thing that runs beats a broad thing
that does not.

We evolve **along** the reasoning chain, never across it: a feature is valid
only if it strengthens the category (`CATEGORY_STRATEGY.md`), earns trust
(`TRUST_MODEL.md`), and can be proven (`PROOF_MODEL.md`).

---

## 3. Product Decision Principles

Eight permanent questions. Every proposed feature must answer all eight - and the
answer must trace to a canonical asset.

1. **Which documented Problem IDs does this solve?** (`CUSTOMER_PROBLEMS.md`)
   No Problem ID, no build. If none fits, new research is required first
   (`CUSTOMER_PROBLEMS.md` rule: feature requires research before implementation).
2. **Does it strengthen our category?** (`CATEGORY_STRATEGY.md` §4/§5) It must
   keep us a _Marketing Intelligence Workspace_, not drift toward CRM, dashboard,
   automation, or agency.
3. **Does it increase customer trust?** (`TRUST_MODEL.md` three beliefs: data safe,
   understands business, useful answers). It must not trigger a trust-killer.
4. **Can we prove its value?** (`PROOF_MODEL.md` Trust Ladder) It must reach at
   least Demonstration in the MVP, or be deferred until it can.
5. **Does it preserve Local First?** (`COMPANY_CONTEXT.md §8`; `DECISIONS.md` ADR-002,
   ADR-003) Data stays on the founder's machine by default.
6. **Does it reduce complexity?** (`CURRENT_PRIORITIES.md` filter; `ICP.md` P-08;
   `BRAND_FOUNDATION.md`) The founder must need no code and no docs.
7. **Is it demonstrable in the MVP?** (`CURRENT_SPRINT.md` Definition of Done;
   `PROOF_MODEL.md` §5 MVP split) Mock is fine for Sprint 001; real ingestion
   is Sprint 002+ - claim only what the sprint can show.
8. **Does it improve founder decision-making?** (`COMPANY_CONTEXT.md` success metric:
   "answer one marketing question more confidently") Not vanity, not more charts.

A single "no" to Question 1, 2, 5, or 7 is a rejection. The others are
strong cautions that usually also reject.

---

## 4. Feature Evaluation Matrix

Three buckets. Criteria are derived from the principles above.

### Must Build

Features that map directly to a **Must-Solve** problem (`CUSTOMER_PROBLEMS.md §6`)
and a value pillar (`VALUE_PROPOSITION.md §3`), and that the MVP can demonstrate.

- **Conversation surface** - the primary surface (P-02, P-03, P-05; Pillar A).
- **Insight** - plain-language explanation of what the data means (P-01, P-03; Pillar B).
- **One Visualization** - a single clear chart, never a wall (P-02; Pillar A).
- **Read-only Connector** for the four V1 sources - Instagram, Gmail, Google Ads,
  Website - local read, never post/send (P-04, P-05, P-10; Pillar C/D; `GLOSSARY.md`).
- **Local Workspace** the founder owns - single surface, `businessos/` isolation
  (P-05; ADR-002).
- **Zero-code onboarding** - open and talk, no setup (P-08; Pillar D).
- **Export / leave** - data portable, no lock-in (P-06, P-11; Zero Vendor Lock-in).

**Criterion:** solves a Must-Solve Problem ID _and_ reaches Demonstration this sprint.

### Build Later

Valuable but not yet. Deferred with reason, not abandoned.

- **Content creation help** (P-09) - Nice-to-Solve; MVP helps _understand_ marketing,
  not generate content. Defer.
- **Multi-channel attribution depth** - P-01 is directional in MVP; full maturity needs
  real ingestion (Sprint 002+) and is bounded by what local data shows (`PROOF_MODEL.md §5`).
- **Connectors beyond the V1 four** - valuable, but each adds surface area; take only
  when the four are proven.
- **Richer Visualizations** - only after one clear chart is proven calm (P-02).
- **Team / collaboration** - out of ICP (`ICP.md` Secondary/Non-Customers); defer until
  a team ICP exists.

**Criterion:** solves a problem but fails Demonstration _now_, or sits outside the
current ICP. Re-evaluate against this framework each sprint; promote only on evidence.

### Never Build

Permanently out of scope. Anchored to `CATEGORY_STRATEGY.md §5` (IS NOT)
and `COMPANY_CONTEXT.md` (V1 exclusions).

- **CRM** - contacts, deals, sales pipeline (out of V1).
- **ERP / HR / Finance** - not our customer's problem.
- **Workflow / marketing automation / multi-agent systems** - no autonomous action;
  contradicts Founder Control (`TRUST_MODEL.md`).
- **Marketplace** - not a solo-founder product.
- **Enterprise / team-first features** - per-seat, roles, SSO (out of ICP).
- **Dashboard / BI surface** - the anti-goal; we answer in Conversation (P-02).
- **Agency / consultancy** - we do not do the founder's work for them.
- **General workspace / notes / project-management tool** - we are marketing-specific
  (`Context Before AI`); not Notion or Linear.

**Criterion:** any feature whose honest description lands in the list above is rejected,
regardless of how well built.

---

## 5. Product Guardrails

Permanent boundaries. A proposal that crosses one is rejected even if it tests well
on the matrix.

- **No features outside the chosen category.** We are a Marketing Intelligence
  Workspace (`CATEGORY_STRATEGY.md §4/§5`). Anything that makes us "also a
  CRM" or "also a dashboard" is a boundary violation.
- **No enterprise-first decisions.** The ICP is a solo founder (`ICP.md`); per-seat,
  roles, and SSO are Never Build. If a request implies a team, it is deferred, not
  compromised.
- **No complexity without measurable customer value.** Every addition must map to a
  Problem ID and survive the "no code, no docs" test (P-08; `CURRENT_PRIORITIES.md`).
- **No feature without a documented customer problem.** If no Problem ID exists, the
  feature is blocked until `CUSTOMER_PROBLEMS.md` is extended with research
  (`CUSTOMER_PROBLEMS.md` rule).
- **Local First is non-negotiable.** Data stays on the machine; cloud is the exception
  (ADR-002, ADR-003; `TRUST_MODEL.md` Data Trust).
- **Founder Control is non-negotiable.** Connectors are read-only; the product never
  acts on the founder's business without them (`GLOSSARY.md`; `TRUST_MODEL.md`).
- **Zero Vendor Lock-in is non-negotiable.** The founder can export and leave with
  their data anytime (`TRUST_MODEL.md`; `CATEGORY_STRATEGY.md`).
- **Cost First is non-negotiable.** Within the under-$100/month total; prefer free and
  open-source; no recurring bill that breaks trust (`CURRENT_PRIORITIES.md`;
  `ICP.md`).
- **Conversation First is non-negotiable.** One clear answer, never a metrics wall
  (P-02; `BRAND_FOUNDATION.md`).
- **Proof before claim.** A capability is shipped only when it can be demonstrated; claims
  follow the MVP can/cannot split (`PROOF_MODEL.md §5`; `VALUE_PROPOSITION.md §6`).
- **No hype language.** Banned words from `GLOSSARY.md` never appear in product copy
  or specs (`BRAND_FOUNDATION.md`).

---

## 6. Decision Checklist

Every future PRD (product requirements document) must pass this before review:

- [ ] Names one or more `CUSTOMER_PROBLEMS.md` Problem IDs it solves.
- [ ] Strengthens the Marketing Intelligence Workspace category (§4/§5 of `CATEGORY_STRATEGY.md`).
- [ ] Increases trust on at least one of the three beliefs (`TRUST_MODEL.md`).
- [ ] Reaches Demonstration in the current MVP, or is filed as Build Later with reason.
- [ ] Preserves Local First, Founder Control, Zero Vendor Lock-in, Cost First,
      Conversation First, Context Before AI (`COMPANY_CONTEXT.md §8`).
- [ ] Reduces or holds complexity; requires no code and no docs from the founder (P-08).
- [ ] Improves a founder's ability to answer one marketing question confidently.
- [ ] Uses no banned words; leads with the problem, not the feature.
- [ ] Is not in the Never Build list (§4) and not an enterprise/team feature.

A PRD that cannot check every box is revised or rejected - not silently merged.

---

## 7. Review Process

How product decisions are proposed, reviewed, approved, and retired.

- **Propose** - A PRD states: the Problem ID(s), the category fit, the trust impact,
  and the proof level it will reach (`PROOF_MODEL.md` Ladder). No Problem ID means
  it is sent back for research first.
- **Review** - Against this framework's checklist and the `CURRENT_PRIORITIES.md`
  decision filters (helps MVP? reduces complexity? improves founder experience?
  preserves Local First? keeps costs low? demonstrable to a user?). A reviewer may
  reject on any permanent guardrail without debate.
- **Approve** - The Founder approves all permanent product decisions. A choice that is
  hard-to-reverse or sets a precedent is recorded as an ADR (`DECISIONS.md` life-cycle)
  and appended there; the ADR references this framework as the basis. Delegation is
  named in the ADR's `Deciders` field but does not transfer Founder ownership.
- **Retire** - When a decision's premise changes (new constraint, principle conflict,
  MVP learning), it is superseded by a new ADR - never deleted. History in
  `DECISIONS.md` is preserved (`DECISIONS.md` Review Process). A feature in Build
  Later is promoted only by re-running this framework on new evidence.

The loop is deliberate: strategy (the chain) flows down through this framework into
a PRD, and every PRD flows back up to an ADR or a retirement. Nothing
enters the product outside this loop.

---

## Self Review

- **Every rule traces to canonical assets** - each principle, matrix bucket, and guardrail
  cites `COMPANY_CONTEXT.md`, `CATEGORY_STRATEGY.md`, `CUSTOMER_PROBLEMS.md`,
  `TRUST_MODEL.md`, `PROOF_MODEL.md`, `CURRENT_PRIORITIES.md`, or `DECISIONS.md`.
- **Prevents feature creep** - the Never Build list plus "no feature without a Problem ID"
  plus the §6 checklist make "nice to have" insufficient to ship.
- **Independently decidable** - Product and Engineering can both run §3 + §4 + §6 and
  reach the same accept/reject call without the founder in the room.
- **No contradictions** - aligns with all 11 canonical documents; the V1 exclusions, the
  three trust beliefs, the MVP can/cannot proof split, and the category boundaries are
  all carried without conflict.
