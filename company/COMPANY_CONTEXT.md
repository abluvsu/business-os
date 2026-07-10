# COMPANY CONTEXT

This is the first document you read before contributing to Business OS.

If you are an AI coding agent, marketing agent, SEO agent, copywriting agent, designer,
researcher, or engineer: stop and read this whole file first. Everything you produce must be
consistent with it. Do not ask the user to re-explain the company. The answer is here.

Business OS is an open-source, local-first AI workspace. It helps solo founders understand
and improve their marketing through conversation, business context, and clear visualizations.

---

## 1. What is Business OS?

Business OS is a calm workspace that already understands a founder's business and helps them
make better marketing decisions by talking with them.

Business OS is **not**:

- a CRM
- an ERP
- a workflow or automation platform
- a multi-agent platform
- a dashboard builder

It does not run the founder's business for them. It helps them understand it. The product
asks, shows, and explains. It does not act behind their back.

---

## 2. Mission

Help solo founders understand and improve their marketing.

We measure success by whether a founder leaves a session more confident about one marketing
decision than they entered it.

---

## 3. Vision

A world where every solo founder has a private workspace that understands their business as
well as a hired marketer would, without hiring anyone, reading dashboards, or writing code.

We are building the best marketing intelligence workspace for people who run marketing alone.

---

## 4. Current Stage (MVP)

We are in MVP. The only job right now is to validate the product with real founders.

Every choice during MVP should help us learn whether a founder trusts the workspace enough to
use it on a real marketing question. Features that cannot contribute to that learning are
deferred.

---

## 5. Current Product Scope

**Connectors (what we read):**

- Instagram
- Gmail
- Google Ads
- Website

**Outputs (what we produce):**

- Conversations - the founder talks to the workspace about their business
- Charts - simple, focused visualizations
- Insights - plain-language explanations of what the data means
- Reports - shareable summaries

We connect to the founder's own accounts and turn scattered marketing activity into something
a non-technical person can understand in a conversation.

---

## 6. Target Customer (Primary ICP)

Solo founders who run their own marketing.

Reality of their day:

- They use ChatGPT, Gmail, WhatsApp, Google Sheets, Instagram, and Google Ads.
- Their technical ability is low. They should never need to write code.
- They have no marketing team and no agency budget.
- They are in India, working in rupees, often in more than one language.

If a feature requires the founder to configure, script, or read documentation to get value,
it is out of scope for this customer.

---

## 7. Customer Problems

The founder's real problems, not the industry's invented ones:

- **They cannot tell what is working.** Spend, posts, and emails are scattered across five
  tools. No single view explains cause and effect.
- **Dashboards overwhelm them.** More charts is not more clarity. They need a person-like
  explanation, not a wall of metrics.
- **They have no one to ask.** Agencies are too expensive. Friends give guesses. They want a
  calm, trustworthy second opinion that knows their actual business.
- **They are short on time and money.** Every rupee and every minute matters. Tools that add
  friction or cost lose to tools that just work.
- **They fear losing control.** Their business data is personal. They do not want it shipped
  to unknown servers or locked inside one vendor.

---

## 8. Product Principles (Canonical 8 Principles)

These are non-negotiable. Every asset, feature, and message must respect them. In priority
order as a set, not a ranking:

1. **Conversation First** - The conversation is the primary surface. If a decision changes
   what the founder can ask or see, the conversation stays central.
2. **Local First** - User data stays on the user's machine by default. Cloud is the
   exception, never the default.
3. **Founder Control** - The founder owns their data, their workspace, and the decisions.
   No opaque automation acts on their business without them.
4. **Context Before AI** - Enrich and preserve business context before applying AI. Context
   is the product; the model is a guest in it.
5. **Cost First** - A solo founder has less than $100/month for software. Favor free and
   open-source, $0-marginal-cost, and offline-capable choices.
6. **Zero Vendor Lock-in** - The founder can leave with their data and run anywhere. No
   proprietary traps, no format they cannot export.
7. **Compliance by Design** - Indian founder, Indian data, Indian rules. Privacy and
   compliance are built in, not bolted on.
8. **Everything should feel simple** - If a founder must write code or read docs to benefit,
   we failed. Low technical ability is the default user.

When two principles conflict, resolve in favor of the founder's control, privacy, and
simplicity over cleverness.

---

## 9. UX Philosophy

The user should feel like they are talking to someone who already understands their business.

Rules we hold without exception:

- Never overwhelm users with dashboards. One clear answer beats ten charts.
- Prefer conversations supported by a single, relevant visualization.
- Explain like a practical human, not a report generator.
- Surprise is bad. The workspace should feel calm and predictable.

---

## 10. Brand Personality

Business OS is:

- Calm
- Clear
- Practical
- Trustworthy
- Intelligent
- Minimal

Business OS is **not**:

- Hype-driven
- Loud
- Salesy
- Buzzword-heavy

We sound like a knowledgeable friend who respects the founder's time. We do not sound like a
pitch deck.

---

## 11. Writing Style

Use:

- Short sentences
- Plain English
- Honest language
- Founder-focused messaging

Avoid these words and their cousins entirely:

- Revolutionary
- Cutting-edge
- AI-powered
- Best-in-class
- Game-changing
- Disruptive

Say what the product does. Do not dress it up. A founder should read our copy and think
"that is exactly my problem," not "what does that mean."

---

## 12. Repository Philosophy

This repository is the company's operating manual.

Every document here must help with one of four things:

- build the product
- acquire customers
- improve operations
- preserve institutional knowledge

If a document does not do one of those, it should not exist. Delete or merge it.

---

## 13. Current Technical Constraints

Stated at product level, not implementation level:

- The workspace runs on the founder's own machine. It must work without a server we operate.
- The user is non-technical. Install and first run should be close to zero-effort.
- It must run on modest, mainstream hardware and common operating systems.
- It must function well with poor or intermittent connectivity. Offline-capable is preferred.
- It handles real personal account data. Privacy and local storage are requirements, not
  features.

Any technical choice that breaks these constraints must be justified against the principles,
and documented as a permanent decision (see Section 18).

---

## 14. Budget Constraints

Assume the founder spends less than $100/month on all software combined.

Prefer free and open-source solutions whenever practical. Treat every recurring cost,
especially cloud or per-seat fees, as something to justify hard. A feature that only works
by adding a monthly bill is a feature we probably should not ship.

---

## 15. Success Metrics

The single test for any feature:

> Does it help a founder answer one marketing question more confidently?

If yes, build it. If it only impresses, demo well, or satisfies an internal idea, cut it.
During MVP, the metric that matters most is whether real founders return to ask a second
question.

---

## 16. Out of Scope for V1

We will not build any of the following during V1:

- CRM
- ERP
- HR
- Finance
- Workflow automation
- Multi-agent systems
- Marketplace
- Enterprise features

Saying no here protects the product. A founder who needs these is not our customer yet.

---

## 17. Company Vocabulary (Business OS Glossary)

Use these terms exactly, with these meanings, across all departments:

- **Business OS** - the local-first AI workspace described in this document.
- **Founder** - our user; a solo founder running their own marketing.
- **Connector** - a read-only link to one of the founder's accounts (Instagram, Gmail,
  Google Ads, Website).
- **Conversation** - the primary way the founder interacts with the workspace.
- **Insight** - a plain-language explanation of what the founder's data means.
- **Chart** - a single, focused visualization supporting a conversation or insight.
- **Report** - a shareable summary the founder can take away.
- **Context** - the accumulated understanding of the founder's business that the workspace
  builds and protects.
- **Local First** - data stays on the founder's machine by default.
- **Founder Control** - the founder owns their data and decisions at all times.
- **Zero Vendor Lock-in** - the founder can export their data and leave anytime.
- **MVP** - the current stage; validate with real users before expanding.

Do not invent new product categories (e.g. "agent", "workflow", "automation") for things we
do not build. If a term is not here and not in the principles, do not assume it exists.

---

## 18. How AI Agents Should Contribute

Read this file before doing anything else. Then:

1. **Stay in scope.** Build, acquire, operate, or preserve knowledge. Anything else is out.
2. **Respect the 8 principles.** When unsure, choose founder control, privacy, and
   simplicity. Never trade those for cleverness or scale.
3. **Write in the brand voice.** Short sentences, plain English, no banned buzzwords.
4. **Follow the glossary.** Use the vocabulary in Section 17 exactly. Do not rename things.
5. **Document permanent decisions as ADRs.** If you make or recommend a hard-to-reverse or
   precedent-setting call, it must follow the ADR standard in `templates/ADR_TEMPLATE.md`
   and be recorded in `company/DECISIONS.md`. Do not hide decisions in code or chat.
6. **Assume a non-technical founder is watching.** If your output would confuse the ICP,
   rewrite it. Simple is the requirement, not a nice-to-have.
7. **Prefer free, local, portable solutions.** Cloud bills and lock-in are last resorts,
   explicitly justified.

You are a steward of the company's consistency, not a source of new strategy. Keep Business
OS calm, clear, and useful.
