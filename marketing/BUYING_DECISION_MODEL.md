# BUYING DECISION MODEL

Business OS is not competing for attention. It is competing against inertia.

This document explains how a founder actually decides to adopt or reject Business OS. It is
the canonical model for Product, Marketing, UX, Sales, Pricing, and Customer Success.

**Core thesis (derived from canonical assets, not new research):** People do not buy software
because it has features. They buy because they believe changing their current behaviour is
_less risky_ than keeping it. For the solo founder in `ICP.md`, the current behaviour is
painful but familiar - five tools, manual reporting, gut decisions. The rival is not another
product; it is the founder's own inertia.

**Inputs (canonical only):** `COMPANY_CONTEXT.md`, `BRAND_FOUNDATION.md`, `ICP.md`,
`CUSTOMER_PROBLEMS.md`, `VALUE_PROPOSITION.md`, `CURRENT_PRIORITIES.md`, `GLOSSARY.md`.
No new customer assumptions are introduced. Where a claim goes beyond the assets, it is
labelled as a derived assumption.

---

## 1. Purpose

Model the founder's adoption decision so every function can reduce the _perceived_ risk of
changing, not just add reasons to change. The objective is a decision model, not a pitch.

---

## 2. Current Behaviour

How the ICP solves marketing problems today (from `CUSTOMER_PROBLEMS.md §5` and `ICP.md §5/§6`):

- **Google Sheets** as CRM, log, and report - manual, error-prone, another tab.
- **ChatGPT (free/Plus)** as the default thinking partner - re-explained from memory each time.
- **Platform-native dashboards** - opened, scrolled, ignored (they overwhelm, P-02).
- **Manual weekly reporting** - numbers copied by hand (P-04, P-10).
- **Agencies** - the real solution, but financially out of reach (P-07).
- **Community asks** - the fallback for decisions (P-03).

The founder _is_ the integration. Behaviour is reactive, manual, fragmented across five tools,
and decided by gut. It hurts, but it is known - which is exactly why it persists.

---

## 3. Trigger Events

What happens in the founder's business that causes active searching (from `ICP.md §8`):

- Launch or relaunch of their product.
- A plateau or drop in reach, sales, or signups.
- The realization that content marketing is harder than building the product.
- Hesitation right before paying for an agency or a chunk of ad spend.
- Burnout from manual weekly reporting across five tools.

Before any of these, the founder tolerates the pain. The trigger is not "I want a tool" -
it is "something just broke or I am about to spend money blind."

---

## 4. Evaluation Criteria

How the founder compares alternatives, ranked by importance. Ranking is derived from
problem frequency/impact (`CUSTOMER_PROBLEMS.md`) and the value pillars (`VALUE_PROPOSITION.md §3`).

1. **Will it tell me something I do not already know?** (P-01, P-03; Pillar B) - the
   core pain is not knowing what works. This outranks every feature.
2. **Do I have time to set it up or learn it?** (P-08; Pillar D) - zero-code is
   non-negotiable; any setup is rejection.
3. **Will my data stay mine, on my machine?** (P-06, P-07, P-11; Pillar C; Local First,
   Founder Control, Zero Vendor Lock-in).
4. **Can I leave with my data anytime?** (P-11; Zero Vendor Lock-in).
5. **What does it cost, recurring?** (P-06, P-07; Cost First; under $100/month total).
6. **Is it calm and clear, not another dashboard?** (P-02; Conversation First; Pillar A).
7. **Is it honest, not hype?** (P-02 hype fatigue; `BRAND_FOUNDATION.md`).

Note the order: the founder evaluates _risk of changing_ (will it help, will it cost me time,
will it take my data) before _benefit_. This is the inertia model in action.

---

## 5. Trust Signals

Evidence that makes the founder believe Business OS is credible (from `VALUE_PROPOSITION.md §6`
and `BRAND_FOUNDATION.md`):

- **Local First** - data stays on the machine (ADR-002/003 in `DECISIONS.md`); answers the
  P-11 trust gap directly.
- **Zero Vendor Lock-in** - the founder can leave with their data; the opposite of the
  lock-in they fear (P-06, P-11).
- **"Never acts without you"** - Founder Control; removes fear of autonomous action.
- **Calm, honest brand** - no hype words (`GLOSSARY.md` banned list); the antidote to
  P-02 hype fatigue.
- **One clear answer, not a wall** - Conversation First proves it is not another dashboard.
- **Demonstrable this sprint** - per `CURRENT_PRIORITIES.md`, a claim must be showable; we
  do not promise what Sprint 001 cannot demonstrate (real ingestion is Sprint 002).

---

## 6. Adoption Barriers

Every reason a founder may reject Business OS, separated by type.

### Rational barriers

- **Time to set up / learn** (P-08) - the top rational reject.
- **"Will it actually tell me something new?"** (P-01) - fair doubt until proven.
- **Recurring cost** (P-06, P-07) - any bill triggers fatigue.
- **"Can I leave?"** (P-11) - lock-in fear, rational given past tools.

### Emotional barriers

- **Hype fatigue / distrust** (P-02) - "is this just another AI-powered pitch?"
- **Fear of another dashboard** (P-02) - dashboards have overwhelemed them before.
- **Data-privacy anxiety** (P-11) - heightened for the Indian founder (`COMPANY_CONTEXT.md`).
- **"Another tool I will abandon"** (P-06) - subscription fatigue is emotional, not just financial.

### Operational barriers

- **Context-switching habit** (P-05) - five tools is the groove.
- **Manual-workflow inertia** (P-04, P-10) - "good enough" reporting already exists.
- **Current stack 'works enough'** - the inertia itself; the strongest barrier.
- **Compliance expectation** - Indian founder expects data handled properly (`Compliance by Design`).

---

## 7. Switching Costs

The gap between real and perceived cost is the whole game.

**Real switching costs (for Business OS):** low by design.

- Setup: zero-code; open the Workspace and talk (P-08, Pillar D).
- Learning: none required; no docs (Everything should feel simple).
- Data: local files the founder already owns; exportable (Zero Vendor Lock-in).

**Perceived switching costs (in the founder's head):** high, and mostly inherited.

- "Will I have to learn another complex tool?" (P-08 pattern)
- "Will my data leave my machine?" (P-11 pattern)
- "Am I getting locked in?" (P-06 pattern)
- "Is this just another subscription?" (P-06 pattern)

**The insight:** the founder generalizes past SaaS pain onto every new tool. Business OS's
_real_ costs are low, but its _perceived_ costs are high because the founder has been burned
before. The work of adoption is to collapse perceived cost toward real cost - by proving
Local First, Zero Vendor Lock-in, zero-code, and no recurring bill _before_ asking for belief.

> **Derived assumption (labelled):** that founders transfer prior SaaS switching-pain onto new
> tools is inferred from P-06/P-08/P-11 patterns and `BRAND_FOUNDATION.md` objections, not
> measured here. Treat as a working assumption, not a statistic.

---

## 8. Adoption Journey

Unaware → Curious → Evaluating → Trying → Trusting → Daily Use → Advocate.

### Unaware

- **Questions:** none.
- **Doubts:** none.
- **Info needed:** none.
- **Product responsibility:** none. Do not push. Inertia is unbroken.

### Curious

- **Questions:** "Does this apply to someone like me?"
- **Doubts:** "Is this another dashboard? Another hype post?"
- **Info needed:** which problem it solves, in plain language (point to Problem IDs).
- **Product responsibility:** lead with the founder's problem, not features; stay calm and honest.

### Evaluating

- **Questions:** Time? Data? Cost? Will it tell me something?
- **Doubts:** trust gap (P-11); "will it actually know my business?"
- **Info needed:** Local First proof, Zero Vendor Lock-in, one demonstrable answer.
- **Product responsibility:** show one clear answer with no setup; answer the ranked criteria (§4).

### Trying

- **Questions:** "Can I do this in minutes, alone?"
- **Doubts:** will it know my business yet? (honest: mock in Sprint 001, real in Sprint 002)
- **Info needed:** the conversation works now; real connector data arrives next.
- **Product responsibility:** zero-code open→talk; one Visualization; under-60s to first answer
  (per `CURRENT_SPRINT.md` DoD).

### Trusting

- **Questions:** "Can I rely on it?"
- **Doubts:** is my data safe and local?
- **Info needed:** Local First evidence; Founder Control ("never acts without you").
- **Product responsibility:** prove data stays; prove the founder can leave with it.

### Daily Use

- **Questions:** "What is my next marketing question?"
- **Product responsibility:** consistent calm answers; Context Before AI keeps building their context.

### Advocate

- **Product responsibility:** earn it by being undeniable - the only metric that matters is the
  founder _returning_ (`CURRENT_PRIORITIES.md`). Advocacy is the byproduct, never the ask.

---

## 9. Product Implications

How this model should shape each function.

- **UX** - Zero-code; one focal point per screen; Conversation First; show one clear answer;
  local-first setup; never a dashboard wall (answers P-02, P-05, P-08).
- **Pricing** - within the under-$100/month the founder can spend; prefer free and open-source;
  no recurring bill that breaks Cost First; any cost is justified against `CURRENT_PRIORITIES.md`.
- **Onboarding** - The founder opens the Workspace and talks. No setup, no docs, data local
  from the first session; first answer in under 60 seconds.
- **Documentation** - Minimal. Empower, do not hand-hold. Founder-owned framing (they own the
  Workspace; support helps them decide, not decide for them).
- **Messaging** - Lead with the problem (P-01: "I cannot tell what is working"); honest;
  Local First as a strength; reference value pillars and Problem IDs; banned hype words avoided.
  Collapse perceived→real switching cost explicitly (local, portable, zero-code, no bill).

---

## 10. Research Notes

- **Sources:** exclusively the six canonical assets listed at the top. No external research was
  introduced; this is a synthesis document, not a discovery document.
- **Derived (not measured):** the inertia thesis and the perceived-vs-real switching-cost gap
  (§7) are inferred from `CUSTOMER_PROBLEMS.md` root causes (fragmentation, learning
  cost, trust gap) plus `BRAND_FOUNDATION.md` objections and `CURRENT_PRIORITIES.md`
  (prove return). They are labelled as assumptions where they appear.
- **Confidence:** High where it restates canonical problems/pillars; Medium where it models
  psychology (labelled).
- **No contradictions introduced** with `ICP.md` (solo, low-technical, India, <$100/mo) or
  `VALUE_PROPOSITION.md` (pillars, "never promise" list).

---

## 11. Review Checklist

- [ ] Does it explain why the founder _delays_ buying (inertia, not missing features)?
- [ ] Are assumptions labelled separately from observations (§7, §10)?
- [ ] Could this guide a pricing call and an onboarding decision today?
- [ ] Does it avoid duplicating `ICP.md` or `VALUE_PROPOSITION.md` (it is a model, not those)?
- [ ] Does every recommendation map to a Problem ID or a value pillar?
- [ ] Does it respect the ranked evaluation criteria (§4) - help first, then time/data/cost risk?
- [ ] Does it collapse perceived switching cost toward real cost using Local First, Zero Vendor
      Lock-in, zero-code, and no recurring bill?
