# ICP

This is the most important marketing document in the repository. It defines **who** Business OS
is built for. Every future decision about product, pricing, copywriting, SEO, onboarding, UX,
and roadmap should become easier after reading it.

This is not a persona document. It is a decision-making document. It defines the who and the
rules; named personas are a later, separate deliverable that will be built _from_ this file.

**Research basis:** The patterns below are drawn from observable founder behavior on Reddit
(r/indiehackers, r/Solopreneur, r/startups), Indie Hackers, X (Twitter, #BuildInPublic),
Product Hunt, and Hacker News, plus founder-focused marketing writing from 2025-2026. We
extracted recurring behavior; we did not invent problems. Where a claim rests on a pattern rather
than a measurement, it is stated as a pattern.

---

## 1. Purpose

Answer one question for every team: _who are we building for, and who are we not?_

A clear ICP prevents the most expensive mistake a small company makes - building a competent tool
for everyone and a great tool for no one. This document exists so product, marketing, and pricing
pull in the same direction without re-debating the customer each sprint.

---

## 2. Primary ICP

The ideal customer, in detail.

- **Business stage** - Bootstrapped and early. Often pre-product-market-fit or just past it.
  Revenue matters from day one; they are not racing to scale at a loss.
- **Team size** - One. A solo founder. At most, an occasional freelancer for a specific task. No
  marketing hire, no virtual assistant by default.
- **Revenue range** - Modest and variable. Assume under roughly $5,000/month; many are below this.
  (Stated as an assumption: Indie Hackers regularly surfaces solo founders crossing $5k MRR as a
  milestone, which implies many sit under it.)
- **Technical ability** - Low. This is fixed by `COMPANY_CONTEXT.md`: the founder should never
  need to write code. They use ChatGPT, but they are not developers and will not configure
  integrations.
- **Marketing maturity** - Self-taught, trial-and-error. No strategy function, no agency, no
  playbook they trust. Marketing is something they do because they must, not something they lead.
- **Daily workflow** - Splits attention across five or more tools: ChatGPT for drafts and
  questions, Gmail and WhatsApp for customer communication, Google Sheets as a makeshift CRM and
  log, Instagram for reach, Google Ads for spend. They move between tabs, copy numbers by hand,
  and ask ChatGPT "why did my reach drop?" in a fresh chat.
- **Current software stack** - ChatGPT (free or Plus), Gmail, WhatsApp, Google Sheets, Instagram,
  Google Ads, often Canva. All mainstream and free or near-free. No paid analytics suite.

This is the founder `COMPANY_CONTEXT.md` calls the Primary ICP: a solo founder running marketing
themselves, with low technical ability, in India, in rupees.

---

## 3. Secondary ICP

Who they are, and why they are not our initial focus.

- **Technical solo founders / indie hackers who can script.** They already wire GPT-for-Sheets,
  Make.com, and APIs together. They can build their own pipelines, so our zero-code, Local First
  value is less differentiating for them, and they are a smaller, more self-sufficient segment. We
  may serve them later; we do not optimize the MVP for them.
- **Micro-teams of 2-5.** They have a colleague to share the load. This breaks our definition of
  "solo founder" and pulls toward collaboration, roles, and sharing features we explicitly do not
  build in V1. Deferred.

The rule: if the customer is not a solo founder doing their own marketing, they are secondary or
out of scope. We earn the broader market later by being undeniable for the one person first.

---

## 4. Explicit Non-Customers

Customer types we intentionally do not build for during MVP, and why.

- **Enterprises and funded startups needing scale-grade controls** (SSO, roles, audit, compliance
  at scale). Out of V1 per `COMPANY_CONTEXT.md`. Wrong shape for a solo Workspace.
- **Agencies managing multiple client accounts.** Our model is founder-owned, single Workspace,
  Local First. Multi-tenant client management is a different product.
- **Markets needing full localization on day one.** We start with Indian English. Other languages are
  valuable later, not now (see `CURRENT_PRIORITIES.md`, deliberately ignored list).
- **Founders who do no customer marketing at all** (e.g., a pure developer tool with zero go-to-market
  need). No marketing question means no use for Business OS.
- **Anyone needing automation, workflows, or multi-agent systems.** Explicitly out of scope for V1.

Saying no here protects focus. A founder who needs these is not our customer yet.

---

## 5. Current Workflow

How the ICP works today, before Business OS exists for them.

The founder's marketing lives in their head and in five disconnected places. They screenshot Instagram
insights into a Google Sheet. They paste ad spend next to it by hand. When reach drops, they
open a fresh ChatGPT chat and describe the situation from memory. They scroll dashboards they do not
fully understand, looking for a number that explains the decision in front of them. They compare
this week to last by eyeballing. They are reactive: they act after something moved, not before.

Nothing connects. No single view tells them "this is what worked." They carry the context; the
tools do not.

---

## 6. Biggest Frustrations

Ranked by frequency of appearance in founder discussions and by business impact. Each is a pattern
observed across the communities listed above, not a single sourced statistic.

1. **"I cannot tell what is actually working."** The most frequent complaint. Founders run ads,
   post, and email, then cannot connect any action to any result. Recurring on r/indiehackers
   and in Indie Hackers writing: never quite sure if what they are doing is working.
2. **Overwhelm from dashboards and too many channels.** They are told to do SEO, content, social,
   email, and paid at once, and the analytics tools "overwhelm you with features you will never
   use" (a recurring critique of marketing-analytics products). On r/Solopreneur, founders note
   content marketing is sometimes harder than building the product.
3. **Cannot afford help.** Agencies are financially out of reach (typical retainers are well above a
   solo founder's budget). They are stuck doing it themselves, badly.
4. **Hype fatigue; cannot trust tools.** "AI-powered" is used so loosely it means nothing, and
   founder-facing marketing writing repeatedly calls most "best-in-class" claims pure hype. They have
   learned to discount anything that sounds like a pitch.
5. **No time to learn another complex tool.** They adopted ChatGPT precisely because it had zero
   learning curve. Any product that demands setup or training loses them.
6. **Data scattered, no single view.** Spreadsheets, inboxes, and platform dashboards never meet.
   The founder is the only integration.

---

## 7. Desired Outcomes

What success looks like from the founder's perspective.

- Know which single marketing action moved the needle.
- Talk to something that already understands their business, instead of re-explaining it.
- Spend _less_ time on marketing admin, not more.
- Stay in control of their data and their decisions.
- Leave a session confident about the one decision in front of them.

Note the emotional shape: relief and control, not excitement about features.

---

## 8. Buying Triggers

Events that make the ICP actively search for a solution.

- Launch or relaunch of their product.
- A plateau or drop in reach, sales, or signups.
- The realization that marketing is harder than building the product.
- Hesitation right before paying for an agency or a chunk of ad spend.
- Burnout from manual weekly reporting across five tools.

---

## 9. Buying Objections

What prevents the ICP from adopting Business OS.

- **"Do I have time to set this up?"** - answered only if zero-code truly holds.
- **"Will my data leave my machine?"** - answered by Local First and Founder Control.
- **"Another dashboard?"** - answered by being a Conversation, not a dashboard.
- **"Is this just hype?"** - answered by the honest, calm brand in `BRAND_FOUNDATION.md`.
- **"Will it actually tell me something I don't already know?"** - answered only by a real
  Insight, never by a chart alone.
- **"Can I leave if it doesn't work?"** - answered by Zero Vendor Lock-in.

Every objection maps to a principle. That is the point: the product's constraints are its sales
answers.

---

## 10. Success Metrics

How this founder judges whether Business OS was valuable.

- Answered at least one real marketing question more confidently.
- Reached a first answer in minutes, with no setup and no code.
- Came back for a second question (the signal `CURRENT_SPRINT.md` and `CURRENT_PRIORITIES.md`
  treat as the only one that matters).
- Trust held: their data stayed on their machine.
- They did not have to learn anything new to benefit.

---

## 11. Messaging Implications

How this ICP should shape each function. (Descriptions of direction, not copy or features.)

- **Product** - Conversation First; one clear answer at a time; never a wall of charts. The
  founder talks, the Workspace explains.
- **Marketing** - Lead with the founder's problem ("I can't tell what's working"), not our
  features. Plain English, honest, calm. Present Local First as a strength, never an apology.
- **UX** - Zero-code, calm, minimal. If the founder must read anything to start, we failed.
- **Pricing** - Within the under-$100/month total the founder can spend; prefer free and
  open-source. A recurring bill is a recurring risk to adoption.
- **Support** - Empower, do not hand-hold. The founder owns their Workspace; support helps them
  decide, not decide for them.

---

## 12. Review Checklist

Use this to test any proposed work against the ICP.

- [ ] Does the work serve a _solo_ founder doing their own marketing?
- [ ] Does it respect low technical ability - no code, no setup, no docs required?
- [ ] Does it reduce overwhelm rather than add another surface?
- [ ] Does it lead with the founder's problem, not our capability?
- [ ] Does it honor Local First, Founder Control, and Zero Vendor Lock-in as selling points?
- [ ] Could a founder adopt it in minutes and leave with their data anytime?
- [ ] Did we avoid building for an agency, a team, or an enterprise?
- [ ] Are we promising only what this sprint can demonstrate (per `CURRENT_PRIORITIES.md`)?
- [ ] Would this founder, overwhelmed and short on time, actually open it a second time?
