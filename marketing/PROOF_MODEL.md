# PROOF MODEL

Business OS does not compete by making stronger claims. It competes by producing
stronger _evidence_. This document defines what Business OS must consistently
_demonstrate_ before asking a founder to believe any marketing message. It is the
company's permanent **evidence hierarchy**.

**Inputs (canonical only):** `COMPANY_CONTEXT.md`, `BRAND_FOUNDATION.md`,
`ICP.md`, `CUSTOMER_PROBLEMS.md`, `VALUE_PROPOSITION.md`, `BUYING_DECISION_MODEL.md`,
`TRUST_MODEL.md`, `CATEGORY_STRATEGY.md`, `CURRENT_PRIORITIES.md`, `GLOSSARY.md`,
`DECISIONS.md`. No new strategy, no invented future capabilities.

---

## 1. Purpose

Make proof a prerequisite, not an afterthought. Every external claim is checked
against this model before it ships. A message the founder cannot verify is a
trust-killer (`TRUST_MODEL.md §5`), not a selling point. The objective is a
permanent bar: stronger evidence than the competition, never stronger adjectives.

---

## 2. Evidence Philosophy

Promises without proof are exactly what the founder is tired of. Per
`CUSTOMER_PROBLEMS.md` P-02, they have learned to discount "AI-powered" and
"best-in-class" as hype; `TRUST_MODEL.md` names unmet hype as a permanent
trust-killer. So a claim alone sits at the bottom of belief.

Evidence is what moves a founder. `BUYING_DECISION_MODEL.md §7` shows the
founder's _perceived_ switching cost is high and inherited; the product's job is
to collapse it toward _real_ cost by **proving** Local First, Zero Vendor Lock-in,
zero-code, and no recurring bill _before_ asking for belief. `CURRENT_PRIORITIES.md`
already encodes this: a decision that fails "can it be demonstrated to a user?" is
deferred. The calm brand (`BRAND_FOUNDATION.md`) means we _show_, not shout.

---

## 3. Trust Ladder

Five rungs of proof. A claim should climb as high as the founder's stage
needs (`BUYING_DECISION_MODEL.md §8`). Each higher rung lowers perceived risk.

- **Claim** - A statement made ("Business OS tells you what is working"). Lowest rung.
  Alone, it is untrusted (hype fatigue, P-02). Every message starts here but
  should not _stay_ here.
- **Demonstration** - The founder can _see it happen_ in the product: one clear answer
  in under 60 seconds, data staying on their machine. Demonstrable by the MVP
  (`CURRENT_SPRINT.md` Definition of Done). Maps to the Trying stage (BUYING §8).
- **Verification** - A structural or independent check, not our say-so. Local First is
  proven by `DECISIONS.md` ADR-002 (data in `businessos/`) and ADR-003 (local
  lock); near-zero cost is proven by Cost First + open-source bias
  (`CURRENT_PRIORITIES.md`). The architecture is the receipt.
- **Repeated Success** - The founder _returns_ and gets a useful answer again. This is the
  only metric that matters (`CURRENT_PRIORITIES.md` primary objective: prove the founder
  comes back). One answer is a demo; a return is proof.
- **Customer Validation** - A real founder (1-3 tested per `CURRENT_SPRINT.md` success
  metrics) confirms it in their own words. Advocacy, the Advocate stage (BUYING §8),
  reached as a byproduct, never the ask.

Rule: if a claim cannot reach Demonstration in the MVP, it is cut or downgraded
to an honest lower rung. We do not borrow higher rungs we have not earned.

---

## 4. Evidence Categories

- **Product Evidence** - What the running MVP shows: the Conversation answers, one
  Visualization, the local read of connectors (`COMPANY_CONTEXT.md` outputs;
  `CURRENT_SPRINT.md`). Seen by the founder directly.
- **Technical Evidence** - Structural proof: Local First via ADR-002/003; no native
  dependencies; `node:sqlite`; runs offline (`DECISIONS.md`). Verifiable in code
  and architecture, not in our copy.
- **Customer Evidence** - A founder returns, says "it told me what worked," can export
  and leave (`CURRENT_SPRINT.md` success metrics; `TRUST_MODEL.md §8`).
- **Research Evidence** - Observed founder behaviour patterns (`CUSTOMER_PROBLEMS.md`
  research; `ICP.md`). This grounds the _problem_, not our product - it proves we
  understood them before we sold to them.
- **Behavioural Evidence** - The founder's own in-product behaviour: returned, connected
  a real Connector (Sprint 002+), did not re-explain their business
  (`TRUST_MODEL.md §8` success metrics). The strongest proof is what they _do_.

---

## 5. MVP Evidence

What the MVP can honestly support **today**, and what it cannot yet. This split is
non-negotiable; it is carried from `VALUE_PROPOSITION.md §6`.

**Can honestly support (Sprint 001 and the Local First architecture):**

- A calm Conversation surface with local mock responses; zero-code open-and-talk.
- One clear Visualization, not a dashboard wall (P-02, Conversation First).
- Data stays on the founder's machine (`businessos/`; ADR-002/003; Local First).
- No recurring bill; free and open-source by default (Cost First; under $100/month total).
- The founder gets a first answer in under 60 seconds (`CURRENT_SPRINT.md` DoD).

**Cannot yet support (honest limit — do not imply otherwise):**

- Real ingestion of the founder's _live_ connector data (begins Sprint 002;
  `CURRENT_SPRINT.md` preview).
- Full multi-channel attribution maturity - P-01 is addressed _directionally_, not finished.
- "It knows my business" beyond mock context - Context Before AI matures only as real
  data arrives.
- Any statement that a specific founder's revenue or reach improved.

If a claim needs the lower list, it waits until the MVP earns it. Presenting
Sprint 001 mock Insights as live founder data is a `TRUST_MODEL.md` trust-killer.

---

## 6. Evidence Requirements

For every future marketing claim, define three things before it ships:

- **Required evidence** - The claim must map to a `CUSTOMER_PROBLEMS.md` Problem ID
  and a `VALUE_PROPOSITION.md` pillar, and be demonstrable by the MVP or
  structurally verified (ADR / principle). No Problem ID, no claim.
- **Acceptable proof** - One of: the founder can _see_ it (Demonstration), a
  structural ADR/principle confirms it (Verification), a return event proves it
  (Repeated Success), or a real founder quote confirms it (Validation).
- **Unacceptable proof** - Our own adjective ("powerful," "effortless"); any banned word
  from `BRAND_FOUNDATION.md`; a vanity metric; a claim the MVP cannot show and
  no ADR verifies.

**Review process:** every claim runs the `CURRENT_PRIORITIES.md` filter
("can it be demonstrated to a user?") plus the `TRUST_MODEL.md §9` checklist plus
this ladder. If no evidence exists at the rung the founder's stage needs, the claim
is cut or downgraded to an honest lower rung.

---

## 7. Product Implications

How evidence shapes each function.

- **Product** - Ship working software every sprint (`CURRENT_PRIORITIES.md`) so
  Demonstration evidence exists. Never hide a wrong answer; honest correction _is_ the
  recovery path (`TRUST_MODEL.md §6`). Working software is the root of all proof.
- **UX** - Make the proof visible. The founder should _see_ data stay local, see one
  answer, and feel the under-60-second first answer. Do not bury the evidence
  inside settings.
- **Marketing** - Lead with a demonstrable claim; if all we have is a claim, say
  "here is how you see it," not "here is why we are great." Reference Problem
  IDs. Banned words absent.
- **Website** - Show the Conversation, not a dashboard screenshot
  (`CATEGORY_STRATEGY.md`); show the Local First proof (data in `businessos/`).
- **Pricing** - Demonstrate near-zero cost _structurally_ (Cost First; free/OSS); no
  recurring bill that would break the proof.
- **Sales** - The evidence is the founder _trying it_, not a pitch. Qualify on solo
  founder; let the product demonstrate.

---

## 8. Evidence Anti-Patterns

Behaviours we will never use (each maps to a canonical prohibition):

- **Vanity metrics** - "10,000 founders" before any returned. Advocacy is a byproduct
  (`BUYING_DECISION_MODEL.md §8`), not a number to lead with.
- **Unsupported testimonials** - Quotes we cannot tie to a real founder or session.
  Customer Validation requires a real person (`TRUST_MODEL.md §8`).
- **Inflated ROI claims** - "30% more revenue." We never promise growth
  (`VALUE_PROPOSITION.md §7` Things We Will Never Promise).
- **Artificial urgency / fake scarcity** - Countdowns, "last chance." Forbidden by
  `BRAND_FOUNDATION.md` Things We Never Do.
- **Banned words** - "best-in-class," "AI-powered," "revolutionary,"
  "game-changing." Listed in `GLOSSARY.md` and `BRAND_FOUNDATION.md`.
- **Claim without demo** - Any statement the MVP cannot show and no ADR verifies.
  Cut or downgrade (§3 rule).
- **Mock presented as real** - Sprint 001 Insights are mock. Presenting them as live
  founder data is a permanent trust-killer (`TRUST_MODEL.md §5`).

---

## 9. Review Checklist

- [ ] Can every future claim be placed on the Trust Ladder and evaluated?
- [ ] Does each claim map to a Problem ID and a value pillar?
- [ ] Is the evidence at or above the rung the founder's stage needs (BUYING §8)?
- [ ] Did we avoid banned words and vanity / urgency anti-patterns (§8)?
- [ ] Does the MVP-evidence split (§5) honestly separate can-support from
      cannot-yet?
- [ ] Is there no contradiction with `TRUST_MODEL.md` (3 beliefs, killers, recovery)?
- [ ] Is it suitable for a bootstrapped solo founder - calm, honest, under $100/month?
- [ ] Could a founder _verify_ the claim themselves, or is it our word alone?
