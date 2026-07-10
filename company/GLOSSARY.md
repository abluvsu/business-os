# GLOSSARY

One canonical vocabulary for Business OS. Every engineering doc, marketing asset, sales
playbook, copywriting guide, SEO doc, architecture spec, and AI prompt must use these terms
exactly as defined here. This file exists to stop terminology drift.

When a term here conflicts with your instinct, the glossary wins. When the glossary conflicts
with `COMPANY_CONTEXT.md`, raise an ADR - do not silently rename.

Each term below gives: definition, when to use it, when not to use it, related terms, and an
example sentence.

---

## Core Product Terms

### Business OS

- **Definition**: The open-source, local-first AI workspace that helps solo founders understand
  and improve their marketing through conversation, business context, and clear visualizations.
- **Use when**: Naming the product as a whole.
- **Avoid when**: Referring to a single feature, screen, or package. Name that part instead.
- **Related**: Workspace, Business Context, Founder.
- **Example**: "Business OS opens with a Conversation, not a settings page."

### Workspace

- **Definition**: A founder's isolated Business OS environment on their own machine, holding
  their Business Context, settings, data, and logs under a single `businessos/` directory.
- **Use when**: Talking about the founder's personal instance and its stored state.
- **Avoid when**: Talking about the product overall (say Business OS) or a single screen.
- **Related**: Workspace Owner, Business Context, Local First.
- **Example**: "Each Workspace is self-contained and can be moved or deleted by its owner."

### Business Context

- **Definition**: The live, accumulated understanding of a founder's business that Business OS
  builds and protects during use.
- **Use when**: Referring to the understanding the product holds and reasons over.
- **Avoid when**: Referring to stored data only (say Knowledge) or to a single metric.
- **Related**: Knowledge, Context Source, Connector, Context Before AI.
- **Example**: "The Insight is wrong because the Business Context is missing ad spend."
- **Note**: Earlier docs use "Context" as a short form of Business Context. Treat them as the
  same concept and prefer "Business Context" going forward.

### Context Source

- **Definition**: The external origin a Connector reads a founder's business data from
  (Instagram, Gmail, Google Ads, Website).
- **Use when**: Distinguishing the upstream system from our integration to it.
- **Avoid when**: You mean the integration itself (say Connector).
- **Related**: Connector, Business Context.
- **Example**: "Google Ads is the Context Source; the Connector is how we read it."

### Connector

- **Definition**: A read-only link Business OS establishes to one of the founder's accounts to
  pull Business Context.
- **Use when**: Naming the integration to Instagram, Gmail, Google Ads, or Website.
- **Avoid when**: Describing autonomous action (we do not act through Connectors) or an Agent.
- **Related**: Context Source, Business Context, Local First.
- **Example**: "The Gmail Connector reads sent campaigns; it never sends on the founder's behalf."

### Insight

- **Definition**: A plain-language explanation of what the founder's data means.
- **Use when**: Describing the output that tells the founder something, not just shows it.
- **Avoid when**: Referring to a chart (say Visualization) or raw data.
- **Related**: Conversation, Visualization, Report.
- **Example**: "The Insight explained why reach dropped after the posting gap."

### Conversation

- **Definition**: The primary way the founder interacts with Business OS: talking to the
  workspace about their business.
- **Use when**: Referring to the founder's main surface for using the product.
- **Avoid when**: Referring to a chart board or a report (those support the Conversation).
- **Related**: Insight, Visualization, Conversation First.
- **Example**: "The founder answered the question inside the Conversation."

### Visualization

- **Definition**: A single, focused chart that supports a Conversation or Insight.
- **Use when**: Naming the one chart shown to explain something.
- **Avoid when**: You mean the whole screen (say Workspace) or a pile of metrics (avoid; that
  is a Dashboard, which we do not build).
- **Related**: Insight, Conversation, Report.
- **Example**: "Show one Visualization per question, never a wall of them."
- **Note**: Earlier docs use "Chart" as a synonym. Treat Chart and Visualization as the same
  concept and prefer "Visualization" going forward.

### Report

- **Definition**: A shareable summary the founder can take away from a Conversation.
- **Use when**: Describing an exportable or savable outcome.
- **Avoid when**: Referring to the live Conversation or a single Visualization.
- **Related**: Insight, Visualization, Conversation.
- **Example**: "The founder exported a Report to send to their supplier."

### Knowledge

- **Definition**: The persisted, reusable representation of Business Context that Business OS
  stores locally and carries across sessions.
- **Use when**: Emphasizing what is retained and reused over time.
- **Avoid when**: Referring to the in-session understanding (say Business Context).
- **Related**: Business Context, Workspace, Local First.
- **Example**: "Knowledge from last month's campaigns informed this week's Insight."

### Brain

- **Definition**: The internal intelligence layer that turns Business Context into Insights and
  Conversation responses.
- **Use when**: Naming the reasoning component of the system.
- **Avoid when**: Implying autonomy or action. Brain is not an Agent and never acts on the
  founder's business without them (Founder Control).
- **Related**: Insight, Conversation, Knowledge, Context Before AI.
- **Example**: "The Brain answers only from Business Context, never from guesswork."

### SDK

- **Definition**: A reusable code package other parts of Business OS build on (for example the
  workspace SDK or brain SDK).
- **Use when**: Referring to an internal engineering package.
- **Avoid when**: Talking to non-technical founders; they never see or choose SDKs.
- **Related**: Asset, Workspace, Brain.
- **Example**: "The workspace SDK handles open, close, and lock cleanup."

### Asset

- **Definition**: Any reusable resource in the repository that helps build the product, acquire
  customers, improve operations, or preserve knowledge.
- **Use when**: Referring to a reusable document, component, template, or tool.
- **Avoid when**: You mean a specific approved foundational doc (say Company Asset).
- **Related**: Company Asset, Playbook, Template, Operating Manual.
- **Example**: "The ADR standard is a reusable Asset every team depends on."

### Sprint

- **Definition**: A fixed, short, time-boxed build cycle that ends with working software.
- **Use when**: Referring to the current or a past build cycle.
- **Avoid when**: Describing the product's long-term direction (that is not a Sprint).
- **Related**: Current Sprint, Company Asset, Operating Manual.
- **Example**: "Sprint 001 ends with a working conversation surface."

### Company Asset

- **Definition**: A permanent, approved foundational document in the operating manual, such as
  COMPANY_CONTEXT.md, CURRENT_SPRINT.md, or CURRENT_PRIORITIES.md.
- **Use when**: Referring to one of the frozen source-of-truth documents.
- **Avoid when**: Referring to a playbook, template, or any non-canonical resource (say Asset).
- **Related**: Asset, Canonical Document, Operating Manual.
- **Example**: "CURRENT_PRIORITIES.md is a Company Asset and must not be rewritten mid-sprint."

---

## Customer Terms

### Founder

- **Definition**: Our user - a solo founder running their own marketing.
- **Use when**: Referring to the person using Business OS.
- **Avoid when**: You mean a team member or an enterprise buyer (those are out of scope for V1).
- **Related**: Solo Founder, Workspace Owner, Customer.
- **Example**: "The Founder should never need to write code."

### Solo Founder

- **Definition**: A founder with no team, our primary ICP.
- **Use when**: Emphasizing the single-user, no-staff reality of our customer.
- **Avoid when**: A team or organization is in view (not our V1 customer).
- **Related**: Founder, Workspace Owner.
- **Example**: "A Solo Founder has no one to delegate marketing setup to."

### Customer

- **Definition**: Anyone who uses or could use Business OS; in practice, the Founder.
- **Use when**: Speaking broadly about the market.
- **Avoid when**: You can name the specific person (prefer Founder or Workspace Owner).
- **Related**: Founder, User, Workspace Owner.
- **Example**: "Our Customer is a Solo Founder, not a department."

### User

- **Definition**: A person operating the Workspace.
- **Use when**: Describing interaction behavior in the abstract.
- **Avoid when**: Referring to our customer specifically (prefer Founder or Workspace Owner).
- **Related**: Founder, Workspace Owner, Customer.
- **Example**: "The User types into the Conversation and waits for a reply."

### Workspace Owner

- **Definition**: The founder who owns a given Workspace and all data inside it.
- **Use when**: Stressing data ownership and control.
- **Avoid when**: You mean the product (say Business OS) or the market (say Customer).
- **Related**: Founder, Solo Founder, Local First, Founder Control.
- **Example**: "The Workspace Owner can delete everything with one action."

---

## Repository Terms

### Canonical Document

- **Definition**: A frozen source-of-truth document that future work references, not copies.
- **Use when**: Pointing to COMPANY_CONTEXT.md, CURRENT_SPRINT.md, CURRENT_PRIORITIES.md, or the
  ADR standard.
- **Avoid when**: The content is a draft, playbook, or template (those are not canonical).
- **Related**: Company Asset, ADR, Operating Manual.
- **Example**: "Reference the Canonical Document; do not paste its text into your spec."

### ADR

- **Definition**: Architecture Decision Record - a permanent, numbered record of a
  hard-to-reverse or precedent-setting decision, stored in DECISIONS.md and formatted per
  templates/ADR_TEMPLATE.md.
- **Use when**: A choice sets a precedent or is costly to undo.
- **Avoid when**: The change is reversible and local (put that in the commit, not an ADR).
- **Related**: Decision, Canonical Document, Template.
- **Example**: "Switching databases needs an ADR, not a one-line PR description."

### Company Context

- **Definition**: The canonical COMPANY_CONTEXT.md document - the first thing every agent
  reads.
- **Use when**: Referring to that specific foundational file.
- **Avoid when**: Speaking loosely about the company's situation (say Business Context for data).
- **Related**: Canonical Document, Current Sprint, Current Priorities.
- **Example**: "Before any task, read Company Context in full."

### Current Sprint

- **Definition**: The canonical CURRENT_SPRINT.md document - the company's operational memory
  for the active sprint.
- **Use when**: Referring to what the team is shipping now.
- **Avoid when**: Describing long-term direction or frozen principles (use Company Context).
- **Related**: Sprint, Canonical Document, Current Priorities.
- **Example**: "Current Sprint says real connectors are out of scope this cycle."

### Current Priorities

- **Definition**: The canonical CURRENT_PRIORITIES.md document - the guide for how to decide
  when options conflict.
- **Use when**: Justifying a choice between valid alternatives.
- **Avoid when**: Describing the product or the sprint plan (use Company Context or Current
  Sprint).
- **Related**: Canonical Document, Decision, Founder Rules.
- **Example**: "Per Current Priorities, we defer the idea because it cannot be demonstrated yet."

### Decision

- **Definition**: A resolved choice; when permanent or precedent-setting, it is recorded as an
  ADR.
- **Use when**: Naming that a call was made and how it is captured.
- **Avoid when**: The matter is still open (then it is a proposal, not a Decision).
- **Related**: ADR, Canonical Document, Current Priorities.
- **Example**: "The Decision to stay Local First is recorded as an ADR."

### Playbook

- **Definition**: A reusable step-by-step guide for a recurring task, kept in `/playbooks`.
- **Use when**: Documenting a repeatable process others should follow.
- **Avoid when**: The content is a one-off spec or a frozen principle (use a Canonical Document).
- **Related**: Template, Asset, Operating Manual.
- **Example**: "The SHIP_RELEASE playbook lists the pre-release checks."

### Template

- **Definition**: A reusable starting structure for a document or record, such as
  ADR_TEMPLATE.md.
- **Use when**: Providing a skeleton others copy and fill.
- **Avoid when**: The content is finished guidance (then it is a Playbook or Canonical Document).
- **Related**: ADR, Playbook, Asset.
- **Example**: "Start every decision from the ADR Template."

### Operating Manual

- **Definition**: The repository as a whole - the collection of canonical docs, playbooks,
  templates, and assets that run the company.
- **Use when**: Referring to the system of documents, not one file.
- **Avoid when**: Naming a single document (name it specifically).
- **Related**: Canonical Document, Company Asset, Asset.
- **Example**: "Every file in the Operating Manual must help build, acquire, operate, or preserve."

---

## Banned Terminology

We avoid these words. They are vague, hype-driven, or mask the real concept.

| Banned term   | Why discouraged                                                              | Use instead                                                                  |
| ------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| AI-powered    | Meaningless hype; every tool claims it. Says nothing about value.            | Name the actual capability, e.g. "explains your ad spend in a Conversation." |
| Revolutionary | Overclaims and reads as marketing, not as a specification.                   | State the concrete change, e.g. "shows one clear answer."                    |
| Game-changing | Empty superlative; cannot be verified or built to.                           | Describe the measurable outcome.                                             |
| Dashboard     | Implies a wall of metrics, which overwhelms our user. We build the opposite. | Conversation, Visualization, or Workspace.                                   |
| Agent         | Implies autonomous action; Business OS does not act without the founder.     | Brain (reasoning) or Connector (read-only link).                             |
| Cutting-edge  | Hype word with no product meaning; conflicts with "calm, minimal."           | Say what it does, plainly.                                                   |
| Disruptive    | Founder-hostile framing; we help, we do not disrupt their life.              | Describe the help delivered.                                                 |
| Best-in-class | Unverifiable claim; we do not rank ourselves.                                | State the specific strength.                                                 |
| Workflow      | Implies automation we do not build in V1.                                    | Say "a step in the Conversation" or "a Playbook."                            |
| Platform      | Implies breadth we deliberately avoid; we are one focused workspace.         | Business OS, or name the specific part.                                      |

---

## Style Rules

Write these terms with consistent capitalization every time. Do not lowercase or hyphenate
them idiosyncratically.

**Always capitalized (proper nouns of the product):**

- Business OS
- Business Context
- Workspace
- Workspace Owner
- Connector
- Context Source
- Insight
- Visualization
- Report
- Conversation
- Brain
- SDK
- ADR
- Company Asset
- Operating Manual

**Always capitalized (principle names, verbatim from Company Context):**

- Conversation First
- Local First
- Founder Control
- Context Before AI
- Cost First
- Zero Vendor Lock-in
- Compliance by Design
- Everything should feel simple

**Document titles (capitalize as written):**

- COMPANY_CONTEXT.md
- CURRENT_SPRINT.md
- CURRENT_PRIORITIES.md
- ADR_TEMPLATE.md
- DECISIONS.md

**Lowercase unless starting a sentence:**

- founder, solo founder, user, customer (common nouns)
- sprint (common noun; capitalize only in "Sprint 001")

When in doubt, match the spelling and capitalization used in this glossary and in
`COMPANY_CONTEXT.md`. Consistency beats cleverness.
