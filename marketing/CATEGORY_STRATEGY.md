# CATEGORY STRATEGY

Products do not compete only on features. They compete on the mental category
customers place them in. This document defines the category Business OS belongs
to - and, equally, the categories it deliberately refuses to enter. The objective
is to eliminate market confusion.

**Inputs (canonical only):** `COMPANY_CONTEXT.md`, `BRAND_FOUNDATION.md`,
`ICP.md`, `CUSTOMER_PROBLEMS.md`, `VALUE_PROPOSITION.md`, `BUYING_DECISION_MODEL.md`,
`TRUST_MODEL.md`, `CURRENT_PRIORITIES.md`, `GLOSSARY.md`, `DECISIONS.md`.

**Research basis (perception only):** How founders mentally file existing tools -
ChatGPT is described as a "standalone AI assistant"; Notion as a "workspace"; Linear
as an "issue tracker"; HubSpot as a "CRM"; Looker Studio as a "dashboard" / BI
tool; Windsor.ai as "marketing attribution / data connectors"; Google Analytics as
"web analytics." These are category perceptions, not feature comparisons. No new
product strategy is introduced; the category below is derived from canonical assets.

---

## 1. Purpose

Give the company one mental box to put Business OS in, and a list of boxes we will
never sit in. Every future positioning, message, and product scope call should be
checkable against §4 (the category) and §5 (the boundaries). Confusion about "what
is this" is a trust and adoption failure (`BUYING_DECISION_MODEL.md §6`); this
document pre-empts it.

---

## 2. Existing Categories

The major categories a founder already recognises, and what they expect from each.

- **AI Assistant** (ChatGPT) - Expect a smart chat that answers almost anything. Standalone,
  no memory of _their_ business. Adopted precisely because it had zero learning curve
  (`ICP.md`, `CUSTOMER_PROBLEMS.md` P-08).
- **Marketing Analytics** (Google Analytics) - Expect tracked web behaviour and numbers. Assumes
  setup and analyst skill the founder does not have.
- **Marketing Attribution / Data Connector** (Windsor.ai) - Expect ad-platform data piped
  into dashboards or a warehouse. Team-scoped and paid.
- **Business Intelligence / Dashboard** (Looker Studio) - Expect custom dashboards blending
  data sources. Build-it-yourself; analyst skill required.
- **CRM / Marketing Automation** (HubSpot) - Expect contact and deal management plus automation.
  Team-scoped, per-seat cost, sales-oriented.
- **Workspace / Knowledge Management** (Notion) - Expect a flexible docs/notes/database
  space. General, not marketing-specific.
- **Project Management / Issue Tracker** (Linear) - Expect task and issue tracking for teams.
  Team-scoped, unrelated to marketing decisions.

---

## 3. Why Existing Categories Fail Our ICP

For each: where it succeeds, where it fails our ICP, and why we must not position
there.

- **AI Assistant** - _Succeeds_ for general Q&A (the zero-learning-curve win). _Fails
  ICP_ because it has no persistent Business Context; the founder re-explains each time
  (P-01, P-03). _Why not here_: "another AI assistant" is the most crowded,
  hype-filled box (`BRAND_FOUNDATION.md` - AI noise) and inherits "AI-powered" fatigue
  (P-02, `TRUST_MODEL.md` emotional barrier). We would buy a word we banned.
- **Marketing Analytics** - _Succeeds_ for web behaviour tracking. _Fails ICP_ by assuming
  analyst skill and showing metrics, not answers (P-02 overwhelm). We answer in
  Conversation, so this box misleads.
- **Attribution / Data Connector** - _Succeeds_ for teams wanting a warehouse or dashboard.
  _Fails ICP_ by being team-scoped, paid, and still ending in a dashboard
  (P-02, P-06, P-07). We read locally; we do not pipe to a warehouse.
- **Business Intelligence / Dashboard** - _Succeeds_ for analysts building reports. _Fails ICP_
  because the dashboard _is_ the anti-goal (P-02), and building one is the learning
  cost we reject (P-08). We are explicitly **not** a dashboard tool.
- **CRM / Marketing Automation** - _Succeeds_ for sales teams. _Fails ICP_ by being
  team-scoped, per-seat, and sales-not-marketing; automation is out of V1 scope
  (`COMPANY_CONTEXT.md` out-of-scope list). We are explicitly **not** a CRM or
  automation platform.
- **Workspace / Knowledge Management** - _Succeeds_ for flexible docs. _Fails ICP_ by
  being general and never answering "what is working" (P-01). We share the word
  "workspace" but mean a marketing-specific one.
- **Project Management / Issue Tracker** - _Succeeds_ for engineering teams. _Fails ICP_ by
  being team-scoped and unrelated to marketing decisions. Not our customer.

---

## 4. Business OS Category

**One-sentence category (a definition, not a tagline):**

> Business OS is a local-first **Marketing Intelligence Workspace** - a calm place where a
> solo founder talks to their own business data and gets one clear answer, instead of a
> dashboard, a CRM, or an agency.

**Purpose of the category:** End the fragmentation (`CUSTOMER_PROBLEMS.md` P-04, P-05)
by being the single surface that _knows_ the business and answers in Conversation -
not by adding another tab.

**Customer expectation it sets:** "I talk; it tells me what is working; my data stays
on my machine; and I learned nothing new to use it." This is the promise in
`VALUE_PROPOSITION.md` and the three beliefs in `TRUST_MODEL.md`, stated as a category.

**The problem this category exists to solve:** The founder cannot tell what works and
is drowning in tools and dashboards they cannot use (P-01, P-02). "Marketing
Intelligence Workspace" names the job - _intelligence about my marketing, in a workspace I
own_ - without borrowing a box that fails the ICP.

---

## 5. Category Boundaries

Permanent product guardrails. Every scope and message decision is checked against these.

**Business OS IS:**

- A **Workspace** the founder owns (Founder Control, Zero Vendor Lock-in).
- **Local-first** - data stays on the machine (`Local First`; ADR-002 in `DECISIONS.md`).
- **Conversation-first** - one clear answer at a time (`Conversation First`).
- **Marketing-intelligent** - reasons from the founder's connected Business Context
  (`Context Before AI`).
- **Calm and simple** - a non-technical founder needs no code (`Everything should feel
simple`; P-08).
- **Near-zero cost** - free and open-source by default (`Cost First`; under $100/month
  total per `ICP.md`).

**Business OS IS NOT:**

- A **CRM** - no contacts, deals, or sales pipeline (out of V1).
- An **automation or multi-agent platform** - nothing acts autonomously (`COMPANY_CONTEXT.md`
  out-of-scope; Founder Control).
- A **dashboard / BI tool** - we answer; we do not display metrics walls (P-02 anti-goal).
- A **general workspace / notes app** - we are marketing-specific (`Context Before AI`);
  not a docs tool.
- An **agency or consultancy** - we do not do the founder's work for them.
- An **enterprise / team product** - solo founder only; per-seat scaling is not us.

---

## 6. Competitive Narrative

Without attacking any tool, here is why Business OS exists _alongside_ them.

We do not replace these categories; we sit where none of them does. ChatGPT is a
great general assistant but forgets your business - we remember it. Dashboards
(Looker Studio, Google Analytics, attribution tools) show data the non-analyst founder
cannot use - we answer in plain language. CRMs manage customers, not understand
marketing. Agencies help, but cost more than a solo founder can spend (`ICP.md`,
P-07). Business OS is the calm, local, _owned_ surface for the founder who runs
marketing alone and cannot afford or operate the rest. The category is defined by what
it removes - the dashboard, the agency retainer, the learning curve - not by beating
incumbents on their own terms (`BRAND_FOUNDATION.md` positioning).

---

## 7. Product Implications

How the chosen category shapes each function.

- **Product decisions** - §5 boundaries are filters. Any feature that pushes us toward
  dashboard, CRM, or automation is rejected unless it maps to a `CUSTOMER_PROBLEMS.md`
  Problem ID. Conversation First is the default surface.
- **UX** - One focal point per screen; Conversation as home; zero-code; Local First
  setup; never a metrics wall. The UI _proves_ the category by being the opposite of
  a dashboard.
- **Marketing** - Lead with the problem (P-01: "I cannot tell what is working"), not a
  category label. Use "Marketing Intelligence Workspace" only as a clarifying noun, never
  as hype. Present Local First as the strength (`VALUE_PROPOSITION.md` Pillar C).
- **Website** - Explain the category in plain founder language. Show the Conversation, not a
  dashboard screenshot. Answer "what is this?" with the three beliefs (`TRUST_MODEL.md`):
  data safe, understands my business, useful answers.
- **Pricing** - Within the under-$100/month the founder can spend; prefer free and
  open-source; **no per-seat pricing** (it would imply a team product and contradict §5).
  Any cost is justified against `CURRENT_PRIORITIES.md`.
- **Sales** - Qualify on solo founder + low technical ability; disqualify agencies, teams,
  and enterprise early (§5 boundaries). Explain fit by stating what we are _not_.

---

## 8. Review Checklist

- [ ] Does the category statement read as a definition, not a slogan?
- [ ] Is it understandable to a non-technical solo founder (`ICP.md`)?
- [ ] Does it reduce confusion rather than add a new box?
- [ ] Does every boundary in §5 trace to a canonical asset (principle, Problem ID, or
      `COMPANY_CONTEXT.md` out-of-scope list)?
- [ ] Did we avoid feature-comparison tables and "AI-powered" / banned hype words
      (`GLOSSARY.md`)?
- [ ] Would a founder say "now I know what this is and is not"?
- [ ] Can future positioning and messaging be derived directly from §4 and §5?
- [ ] Does it contradict any canonical document? (It must not.)
