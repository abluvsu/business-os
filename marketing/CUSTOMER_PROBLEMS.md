# CUSTOMER PROBLEMS

This is the canonical problem library for Business OS.

Its purpose is **not** to describe our product. Its purpose is to deeply understand the
founder's existing reality _before_ Business OS exists. Every feature we build should solve
one or more problems documented here. If a feature cannot be mapped to a documented problem,
we should question why we are building it.

**Research basis:** Patterns below are drawn from Reddit (r/indiehackers,
r/SaaS, r/Entrepreneur, r/Marketing, r/Solopreneur), Indie Hackers, Hacker News,
Product Hunt discussions, X (Twitter, #BuildInPublic), YouTube founder interviews, and
founder-focused marketing/analytics writing from 2025-2026. Repeated patterns are
prioritized over isolated opinions. We did not search for "Business OS." We researched how
founders actually work today.

---

## 1. Purpose

Give every team one shared, evidence-backed picture of the founder's problems, separated from
our solutions. This file is the test a feature must pass: _which documented problem does this
solve, and for whom?_ It prevents solution-first building and keeps the roadmap tethered to
observed behavior.

---

## 2. Problem Classification

Problems are organized by the founder's own framing, not by our product surface.

- **Marketing** - running and choosing marketing activity.
- **Content** - producing and sustaining content.
- **Analytics** - reading and interpreting performance data.
- **Decision Making** - choosing what to do next with confidence.
- **Time** - the hours marketing admin consumes.
- **Context Switching** - moving between disconnected tools.
- **Reporting** - assembling a periodic view by hand.
- **Tool Fatigue** - the load of too many recurring tools and bills.
- **Cost** - inability to afford real help.
- **Learning** - the cost of adopting yet another complex tool.

---

## 3. Problem Statements

Each problem is stated as observed behavior, with root cause separated from symptom.

### P-01 - Cannot tell which marketing action works

- **Problem ID**: P-01
- **Category**: Marketing, Analytics, Decision Making
- **Problem Statement**: The founder cannot connect a marketing action to a result, so they
  cannot say what is working.
- **Observable Behaviour**: Runs ads, posts, and emails, then re-asks ChatGPT "why did my
  reach drop?" from memory. Keeps running the same campaigns because cutting one without data
  feels too risky.
- **Root Cause**: Data lives in disconnected platforms with no attribution; the founder is the only
  thing connecting them.
- **Current Workaround**: Eyeball week-over-week; describe the situation to ChatGPT fresh each
  time; ask communities.
- **Business Impact**: Misallocates a limited budget; cuts what might be working; growth stalls.
- **Frequency**: Very High.
- **Emotional Impact**: Anxiety, self-doubt about their own judgment.
- **Confidence Level**: High (recurs across communities; attribution industry writing frames this as
  the #1 analytics challenge for small teams).

### P-02 - Dashboards overwhelm instead of clarifying

- **Problem ID**: P-02
- **Category**: Analytics, Reporting
- **Problem Statement**: Platform dashboards show everything and clarify nothing for a non-analyst.
- **Observable Behaviour**: Opens the Google Ads or Instagram dashboard, scrolls, and leaves without
  making a decision. Later ignores dashboards entirely and relies on gut.
- **Root Cause**: Dashboards prioritize volume and vanity metrics and assume analyst skill the founder
  does not have.
- **Current Workaround**: Ignore the dashboard; act on instinct or not at all.
- **Business Impact**: Pays for tools never used; decisions remain guesswork.
- **Frequency**: High.
- **Emotional Impact**: Overwhelm, resignation ("nothing in here tells me what to do").
- **Confidence Level**: High (recurring critique that analytics tools "overwhelm you with features
  you will never use").

### P-03 - Decides by gut because no decision layer exists

- **Problem ID**: P-03
- **Category**: Decision Making
- **Problem Statement**: When something moves, the founder has no synthesized view to decide from.
- **Observable Behaviour**: On a reach drop, acts on instinct or does nothing and waits. Sometimes
  posts in a community hoping for a steer.
- **Root Cause**: Raw metrics exist, but nothing turns them into a plain-language answer tied to
  their business.
- **Current Workaround**: Community posts; waiting; guessing.
- **Business Impact**: Slow, inconsistent decisions; misses patterns that repeat.
- **Frequency**: High.
- **Emotional Impact**: Uncertainty; feeling under-equipped.
- **Confidence Level**: Medium-High.

### P-04 - Marketing admin eats founding time

- **Problem ID**: P-04
- **Category**: Time, Reporting
- **Problem Statement**: Assembling a view of marketing consumes hours the founder needs elsewhere.
- **Observable Behaviour**: Blocks weekend time to copy numbers from five tools into one place.
- **Root Cause**: No integration; the founder is the integration.
- **Current Workaround**: Manual weekend reporting blocks.
- **Business Impact**: Less time building the product; creeping burnout.
- **Frequency**: High.
- **Emotional Impact**: Resentment, burnout.
- **Confidence Level**: High.

### P-05 - Constant tab-switching fragments attention

- **Problem ID**: P-05
- **Category**: Context Switching
- **Problem Statement**: The founder's day is a continuous switch between disconnected tools.
- **Observable Behaviour**: Moves between ChatGPT, Gmail, Google Sheets, Instagram, and Google Ads
  all day. No single surface holds the thread.
- **Root Cause**: Each tool owns one slice of the business; none holds the whole.
- **Current Workaround**: None; tolerated as the cost of doing it alone.
- **Business Impact**: Lost focus, small errors, fatigue.
- **Frequency**: Very High.
- **Emotional Impact**: Fragmentation, exhaustion.
- **Confidence Level**: High (worker surveys: ~17% switch contexts 100+ times/day; ~22% lose
  2+ hours/week to tool fatigue).

### P-06 - Subscription sprawl and fatigue

- **Problem ID**: P-06
- **Category**: Tool Fatigue, Cost
- **Problem Statement**: The founder accumulates too many recurring tools and loses track of them.
- **Observable Behaviour**: Signs up for a CRM trial, an analytics dashboard, a design tool; later
  cannot recall what renews or why.
- **Root Cause**: Each tool solves one slice, never the whole; recurring billing hides the total.
- **Current Workaround**: Occasional cleanup; mostly tolerated.
- **Business Impact**: Financial leakage; cognitive load; churn-prone relationship with software.
- **Frequency**: High.
- **Emotional Impact**: Clutter, fatigue, "renting my life" resentment.
- **Confidence Level**: High (subscription-fatigue data: ~47% cancelled a subscription in 2026;
  ~65% say there are too many; ~28% feel locked in).

### P-07 - Cannot afford real help

- **Problem ID**: P-07
- **Category**: Cost
- **Problem Statement**: The founder needs marketing help but cannot pay for it.
- **Observable Behaviour**: Knows an agency would help; never engages one. Enterprise analytics
  tools are thousands per month and irrelevant.
- **Root Cause**: Help is priced for teams and enterprises, not a solo founder.
- **Current Workaround**: Does it alone, badly.
- **Business Impact**: Growth capped by the founder's own capacity.
- **Frequency**: Very High.
- **Emotional Impact**: Stuck, resigned.
- **Confidence Level**: High (consistent across community and agency-pricing writing).

### P-08 - No will to learn another complex tool

- **Problem ID**: P-08
- **Category**: Learning
- **Problem Statement**: The founder rejects capable-but-complex tools because the learning cost is too high.
- **Observable Behaviour**: Adopted ChatGPT specifically because it had zero learning curve. Avoids
  anything requiring setup, training, or a manual.
- **Root Cause**: For a time-poor founder, learning cost outweighs perceived benefit.
- **Current Workaround**: Sticks to familiar free tools.
- **Business Impact**: Rejects tools that could help; hard adoption barrier for anything not
  zero-code.
- **Frequency**: High.
- **Emotional Impact**: Avoidance, friction aversion.
- **Confidence Level**: High (consistent with `ICP.md` low-technical-ability finding).

### P-09 - Content marketing feels harder than building the product

- **Problem ID**: P-09
- **Category**: Content
- **Problem Statement**: Producing consistent content is a struggle that outweighs the build work.
- **Observable Behaviour**: Posts sporadically; expresses that content marketing is sometimes harder
  than building the product.
- **Root Cause**: No strategy function; inconsistent output; cannot tell what resonates.
- **Current Workaround**: Sporadic posting; abandonment.
- **Business Impact**: Weak top-of-funnel; wasted effort.
- **Frequency**: Medium-High.
- **Emotional Impact**: Frustration.
- **Confidence Level**: Medium (recurring but narrower community pattern).

### P-10 - Weekly reporting is manual and error-prone

- **Problem ID**: P-10
- **Category**: Reporting, Time
- **Problem Statement**: The periodic marketing view is assembled by hand and is often wrong.
- **Observable Behaviour**: Builds a spreadsheet of metrics each week by copying from platform screens.
- **Root Cause**: No automated capture; platforms do not talk to each other.
- **Current Workaround**: Manual Google Sheets.
- **Business Impact**: Stale data, occasional wrong numbers, hours lost.
- **Frequency**: High.
- **Emotional Impact**: Drudgery.
- **Confidence Level**: High.

### P-11 - Hesitation to hand data to another cloud tool

- **Problem ID**: P-11
- **Category**: Tool Fatigue, Cost (trust)
- **Problem Statement**: The founder is reluctant to connect accounts to yet another cloud service.
- **Observable Behaviour**: Hesitates before connecting; sometimes uses screenshots instead of live
  connection.
- **Root Cause**: Privacy scares, Indian-data sensitivity, and fear of lock-in from past tools.
- **Current Workaround**: Avoid connecting; use exports and screenshots.
- **Business Impact**: Stays blind to their own data; tools underused.
- **Frequency**: Medium.
- **Emotional Impact**: Distrust.
- **Confidence Level**: Medium (inferred from `ICP.md` objections and the Indian-founder context;
  treated as an assumption, not a measurement).

---

## 4. Root Cause Analysis

Recurring systemic causes behind the problems above. These are the real targets; symptoms are not.

1. **Fragmentation.** Every tool owns one slice of the business and none holds the whole. This is
   the parent cause of P-01, P-02, P-04, P-05, and P-10. The founder is forced to be
   the integration.
2. **No synthesis layer.** Raw data and metrics exist, but nothing turns them into a
   plain-language answer about _their_ business. Parent cause of P-01, P-02, P-03.
3. **Pricing mismatch.** Marketing help is built for teams and enterprises, not solo founders.
   Parent cause of P-06 and P-07.
4. **Learning cost.** Complex tools demand setup the time-poor founder will not pay. Parent cause
   of P-08.
5. **Trust and control gap.** Cloud-by-default tools conflict with the founder's need to own their
   data. Parent cause of P-11, and a multiplier on P-06.

---

## 5. Existing Alternatives

How founders currently solve (or endure) each problem.

- **Google Sheets** - used as CRM, log, and report. Solves P-04/P-10 partially; creates P-06
  (another subscription) and P-05 (another tab).
- **ChatGPT (free or Plus)** - the default thinking partner. Solves P-03 weakly (no business
  context; re-explained each time). The reason it won: zero learning curve (P-08).
- **Agencies** - the real solution to P-01/P-03/P-07, but priced out of reach. Effectively
  absent for our ICP.
- **Platform-native dashboards** - meant to solve P-02; in practice cause it (overwhelm).
- **Paid analytics / attribution tools** - solve P-01 in theory; priced for teams, cause P-06/P-07
  in practice for a solo founder.
- **Manual analysis and community asks** - the fallback for P-01/P-03; slow, inconsistent.
- **Make.com / GPT-for-Sheets (technical sub-segment only)** - solve P-04/P-10 for founders who
  can script. Out of reach for our low-technical Primary ICP.

Conclusion: every alternative either solves one slice and worsens fragmentation, or solves the whole
but is unaffordable or too complex for the solo founder. That gap is the opportunity.

---

## 6. Opportunity Assessment

Classification against the MVP only.

| Problem                        | Class             | Why                                                          |
| ------------------------------ | ----------------- | ------------------------------------------------------------ |
| P-01 Cannot tell what works    | **Must Solve**    | Core of "understand your marketing."                         |
| P-02 Dashboards overwhelm      | **Must Solve**    | Our answer is a Conversation, not a dashboard.               |
| P-03 Decides by gut            | **Must Solve**    | Insight is the product's reason to exist.                    |
| P-04 Admin eats time           | **Must Solve**    | Local capture removes manual work.                           |
| P-05 Tab-switching             | **Must Solve**    | One Workspace surface is the design.                         |
| P-06 Subscription fatigue      | **Must Solve**    | Local First + zero recurring cost is the wedge.              |
| P-07 Cannot afford help        | **Must Solve**    | Within <$100/mo, free/OSS by default.                        |
| P-08 Won't learn complex tools | **Must Solve**    | Zero-code is non-negotiable.                                 |
| P-09 Content creation struggle | **Nice to Solve** | MVP helps understand marketing, not generate content. Defer. |
| P-10 Manual reporting          | **Must Solve**    | Connectors remove hand-copied reports.                       |
| P-11 Hesitant to connect data  | **Must Solve**    | Local First + Zero Vendor Lock-in answer it.                 |

---

## 7. Product Mapping

Mapping every Must Solve problem to **current MVP capabilities** (per `COMPANY_CONTEXT.md`
and `CURRENT_SPRINT.md`), not future plans.

- **Conversation** (primary surface) → P-02, P-03, P-05. Replaces dashboard overwhelm with
  talk; gives a decision layer; ends tab-switching by being the one surface.
- **Insight** (plain-language explanation) → P-01, P-03. Turns context into "what this means."
- **Visualization** (one clear chart) → P-02. One answer, never a wall.
- **Connector** (reads Instagram, Gmail, Google Ads, Website locally) → P-04, P-05, P-10.
  Removes manual capture and switching.
- **Workspace** (single local surface) → P-05.
- **Local First** → P-06, P-07, P-11. No recurring bill, data stays on the machine, no lock-in.
- **Context Before AI** → P-01. Synthesizes the founder's business before answering.
- **Founder Control / Zero Vendor Lock-in** → P-06, P-11.

**Explicit gaps (no MVP solution yet):**

- **P-09** (content creation) has no MVP solution. It is Nice to Solve and deferred.
- **P-01 full attribution maturity** (multi-touch, cross-channel precision) is only addressed
  _directionally_ in MVP. Real connector ingestion begins after Sprint 001 (see
  `CURRENT_SPRINT.md` preview); depth matures later. We do not claim finished attribution.

---

## 8. Research Notes

- **Communities reviewed**: Reddit (r/indiehackers, r/SaaS, r/Entrepreneur, r/Marketing,
  r/Solopreneur), Indie Hackers, Hacker News, Product Hunt discussions, X/Twitter
  (#BuildInPublic), YouTube founder interviews, and 2025-2026 founder-focused
  marketing/analytics writing.
- **Patterns observed**:
  - Founders cannot attribute results ("throwing darts in the dark"; last-click trap).
  - Dashboards overwhelm non-analysts ("overwhelm you with features you will never use").
  - Context-switching is constant (worker surveys: 17% switch 100+/day; 22% lose 2+ hrs/week).
  - Subscription fatigue is real (47% cancelled a subscription in 2026; 65% say too many; 28%
    feel locked in).
  - Agencies and enterprise tools are financially out of reach for solos.
  - ChatGPT won because it had zero learning curve.
- **Assumptions**:
  - P-11 (data-hesitation) is inferred from `ICP.md` objections and the Indian-founder
    context; treated as Medium confidence, not measured.
  - Revenue and team-size ranges in `ICP.md` are stated assumptions there.
- **Confidence**: High for P-01 through P-08 and P-10 (recurring, cross-community). Medium
  for P-09 and P-11 (narrower or inferred).

---

## 9. Review Checklist

Use this to test any proposed feature against the problem library.

- [ ] Does the work map to a specific Problem ID above?
- [ ] Is it solving a _root cause_ (fragmentation, no synthesis, pricing mismatch, learning
      cost, trust gap), not a symptom?
- [ ] If it is a Must Solve problem, does it use a _current MVP_ capability, not a future one?
- [ ] Have we avoided inventing a problem we do not have evidence for?
- [ ] Does the work respect zero-code, Local First, and <$100/mo (P-06, P-07, P-08)?
- [ ] If it targets P-09 or another deferred problem, is that explicitly justified against
      `CURRENT_PRIORITIES.md`?
- [ ] Can we state, in one sentence, which founder behavior this changes?
