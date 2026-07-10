# TRUST MODEL

Business OS succeeds or fails on trust. Founders will connect their Gmail, Instagram,
Google Ads, and business data. Before they care about features, they must believe
three things:

1. Their data is safe.
2. The product understands their business.
3. The product consistently gives useful answers.

This document defines how Business OS earns, measures, and preserves trust. It is the
company's **product trust strategy** - not a security document and not a compliance
document.

**Inputs (canonical only):** `COMPANY_CONTEXT.md`, `BRAND_FOUNDATION.md`, `ICP.md`,
`CUSTOMER_PROBLEMS.md`, `VALUE_PROPOSITION.md`, `BUYING_DECISION_MODEL.md`,
`CURRENT_PRIORITIES.md`, `GLOSSARY.md`. No new customer assumptions are introduced.

Every recommendation below connects to `BUYING_DECISION_MODEL.md` (BDM), because
trust is the mechanism that collapses _perceived_ switching cost toward _real_ cost (BDM §7).

---

## 1. Purpose

Make trust an explicit, measurable product responsibility rather than a side effect of features.
If a change improves a feature but reduces one of the three beliefs, it is rejected. This
document is the lens Product, UX, and Copywriting use to protect the adoption decision
BDM models.

---

## 2. Why Trust Matters

Trust is the whole sale. Per BDM §2, the founder's current workflow is painful
but _familiar_; the competitor is inertia, not another product. They change only when
changing feels _less risky_ than staying. Trust is the lever that lowers perceived risk
(BDM §7: collapse perceived → real switching cost).

The three founding beliefs map directly to BDM's evaluation criteria (BDM §4):
"will it tell me something new?" (understands business + useful answers), "will my data
stay mine?" (data safe), and the ranked criteria put _help_ before _benefit_ - which is
trust, sequenced.

---

## 3. Trust Dimensions

Seven dimensions. Each: what trust means, how the founder evaluates it, how Business
OS demonstrates it.

### Data Trust

- **What it means**: The founder believes their business data stays theirs and on their machine.
- **How evaluated**: "Will my data leave my machine?" (BDM §6, P-11); "Can I leave
  with it?" (BDM §4 #4).
- **How demonstrated**: Local First - data read locally into `businessos/` (ADR-002);
  Zero Vendor Lock-in - portable by design; Founder Control - they decide. (BDM §5 trust
  signals.)

### Product Trust

- **What it means**: The Workspace feels calm and does what it says - one clear answer,
  no setup.
- **How evaluated**: "Is this another dashboard?" (BDM §6, P-02); can they get an answer
  in under 60 seconds with no learning? (BDM §8 Trying).
- **How demonstrated**: Conversation First; one Visualization at a time; zero-code open-and-talk.

### Recommendation Trust

- **What it means**: The answers are sound and reveal something true the founder did not
  already know (P-01).
- **How evaluated**: "Will it actually tell me something new?" (ICP objection; BDM §6 rational
  barrier).
- **How demonstrated**: Context Before AI - it reasons from their business, not generic advice;
  Insight stated in plain language; honest scope (Sprint 001 answers are mock, real
  ingestion is Sprint 002 - see `VALUE_PROPOSITION.md §6`).

### Transparency

- **What it means**: Honest about what it does and does not do; no hype.
- **How evaluated**: "Is this just another AI-powered pitch?" (BDM §6 emotional barrier;
  `BRAND_FOUNDATION.md` banned words).
- **How demonstrated**: Brand honesty; the "Things We Will Never Promise" list
  (`VALUE_PROPOSITION.md §7`); plain copy that leads with the problem.

### Reliability

- **What it means**: Consistent, demonstrable, near-zero cost, works each session.
- **How evaluated**: "Can I rely on it?" (BDM §8 Trusting); "does it keep working without
  surprises?"
- **How demonstrated**: Cost First - no recurring bill (BDM §4 #5); Context Before AI -
  it remembers their business; ships working software every sprint (`CURRENT_PRIORITIES.md`).

### Simplicity

- **What it means**: Zero-code, no learning curve, calm.
- **How evaluated**: "Do I have time to set this up or learn it?" (BDM §4 #2; ICP objection).
- **How demonstrated**: Everything should feel simple; the founder opens the Workspace and talks.

### Founder Control

- **What it means**: The product never acts on the founder's business without them.
- **How evaluated**: Fear of autonomous action (BDM §5 "never acts without you";
  `BRAND_FOUNDATION.md` promise).
- **How demonstrated**: Founder Control principle; Connectors are read-only by definition
  (`GLOSSARY.md`) - they read, they never post or send.

---

## 4. Trust Signals

Observable signals that _increase_ trust, by stage. These are the moments BDM §8 names;
each is a chance to prove one of the three beliefs.

### Before signup (BDM: Curious)

- Local First stated as a strength, not an apology.
- Honest "what it does" copy; banned hype words absent.
- Free / open-source bias visible (Cost First).

### First session (BDM: Trying)

- Opens the Workspace and talks; no setup, no docs.
- Gets one answer in under 60 seconds; data stays local from session one.
- Sees a mock Insight that reads like it knows their business (scope is honest, not fake).

### First week (BDM: Trusting → Daily Use)

- Returns, and the Workspace remembers their context (Context Before AI).
- No recurring charge appears (Cost First).
- Can export or disconnect any Connector with zero friction (Zero Vendor Lock-in).

### Long-term use (BDM: Advocate)

- A real Connector explains "what worked" (Sprint 002+; Recommendation Trust matures).
- Calm, consistent answers; still portable; still local.
- The founder tells another founder - advocacy is the byproduct of proven trust, never the ask
  (BDM §8 Advocate).

---

## 5. Trust Killers

Behaviours that _permanently_ reduce trust. Each maps to a dimension and to BDM.

- **Data leaves the machine / goes to cloud by default** - destroys Data Trust; triggers BDM §6 P-11.
- **Autonomous action on the founder's accounts** (posting, sending) without them - violates
  Founder Control; kills BDM §5 "never acts without you."
- **Hype claims unmet / "AI-powered" language** - destroys Transparency; BDM §6 emotional barrier.
- **Dashboard overload / many charts** - destroys Product Trust; the anti-goal in P-02 and BDM §4 #6.
- **Cannot export or leave** - destroys Data Trust; violates BDM §4 #4 (Zero Vendor Lock-in).
- **Confident-but-wrong answers presented as fact** - destroys Recommendation Trust; the P-01 failure mode.
- **Hidden recurring cost** - destroys Reliability and Simplicity; BDM §4 #5, P-06/P-07.
- **Asking the founder to learn or configure** - destroys Simplicity; BDM §4 #2, P-08.

---

## 6. Trust Recovery

If trust is lost, how the product should recover.

- **Start from ownership.** Because of Local First and Zero Vendor Lock-in, the founder's data
  is _already theirs_. Recovery begins by letting them leave with it, no friction - this is the
  structural advantage over cloud SaaS (BDM §7 real-vs-perceived cost).
- **Admit plainly.** Name what broke, with no spin (Transparency; `BRAND_FOUNDATION.md`).
  Hype recovery is no recovery.
- **Revert to a safe state.** Never hide the failure behind a confident answer. A wrong
  Insight is corrected in the open, not buried.
- **Founder Control is the undo.** Any action the product took is reversible by the founder.
- **Judge recovery by re-entry, not by a post.** The test is the founder moving back
  through BDM §8 Trusting → Daily Use, not a public statement.

---

## 7. Product Implications

How trust shapes each function.

- **UX** - Zero-code; one focal point; Conversation First; local-first setup; never a
  dashboard wall; read-only Connectors surfaced clearly so the founder _sees_ the boundary.
- **Onboarding** - Open and talk; under 60 seconds to first answer; data local from session
  one; no documentation gate.
- **Copywriting** - Honest; lead with the problem; Local First as a strength; banned words
  avoided; reference value pillars (and thus Problem IDs) so messaging is auditable.
- **Pricing** - Within the under-$100/month the founder can spend; prefer free and
  open-source; no recurring bill that breaks Cost First; any cost justified against
  `CURRENT_PRIORITIES.md`.
- **Connector design** - Read-only by definition (`GLOSSARY.md`); explicit "we read, we never
  post"; clear statement of what each Connector accesses; one-tap disconnect and export.
- **Support** - Empower, do not hand-hold (ICP §11); founder-owned framing; transparent
  about limits (mock vs real per `VALUE_PROPOSITION.md §6`).

---

## 8. Success Metrics

How we know founders trust Business OS (all trace to BDM stages):

- **Returns for a second question** - the only metric that matters (`CURRENT_PRIORITIES.md`
  primary objective); the precondition for BDM Advocate.
- **Connects a real Connector willingly** - Data Trust earned; the Sprint 002 behaviour.
- **Does not re-explain their business each session** - Context Before AI working;
  Recommendation and Product Trust confirmed.
- **Can export or leave with zero friction** - Zero Vendor Lock-in verified (BDM §4 #4).
- **Recommends to another founder** - trust proven; BDM Advocate reached without being asked.

---

## 9. Review Checklist

- [ ] Does every trust recommendation connect to `BUYING_DECISION_MODEL.md` (a dimension,
      signal stage, or killer)?
- [ ] Does it protect the three founding beliefs (data safe, understands business, useful
      answers)?
- [ ] Did we avoid writing security or compliance _implementation_ (strategy only)?
- [ ] Is it practical enough to reject a UX or copy change today?
- [ ] Is it consistent with `COMPANY_CONTEXT.md` principles, `BRAND_FOUNDATION.md`, `ICP.md`,
      `VALUE_PROPOSITION.md`, and `CURRENT_PRIORITIES.md`?
- [ ] Does it treat trust recovery as ownership-based (Local First + Zero Vendor Lock-in),
      not as a PR exercise?
