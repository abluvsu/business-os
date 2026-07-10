# ADR Standard & Template

This file is the single source of truth for how Business OS records decisions. Every
architectural, engineering, product, or operational decision that is **hard to reverse** or
**sets a precedent others will copy** must become an Architecture Decision Record (ADR).

ADRs are permanent. We never delete them. We supersede them. The goal is not to be right
forever; it is to make the reasoning findable forever.

Our principles are non-negotiable constraints on every decision below. They are quoted
verbatim from the company brief so ADRs never drift from the source:

- **Conversation First** - The conversation is the primary surface for understanding the business. If a decision changes what the founder can ask or see, the conversation stays central.
- **Local First** - User data stays on the user's machine by default. Cloud is the exception, never the default.
- **Founder Control** - The founder owns their data, their workspace, and the decisions. No opaque automation acts on their business without them.
- **Context Before AI** - Enrich and preserve business context before applying AI. Context is the product; the model is a guest in it.
- **Cost First** - A solo founder has less than $100/month for software. Favor free and open-source, $0-marginal-cost, and offline-capable choices.
- **Zero Vendor Lock-in** - The founder can leave with their data and run anywhere. No proprietary traps, no format they cannot export.
- **Compliance by Design** - Indian founder, Indian data, Indian rules. Privacy and compliance are built in, not bolted on.
- **Everything should feel simple** - If a founder must write code or read docs to get value, we failed. Low technical ability is the default user.

---

## When to write an ADR

Write an ADR **before or during** a decision, not after the fact. Concrete triggers:

- You chose one technology or library over another (e.g. `node:sqlite` over `better-sqlite3`).
- You set a boundary that future code must respect (e.g. all state lives under `businessos/`).
- You rejected an obvious default because of our principles (e.g. no cloud sync by default).
- You changed a rule that the team already followed.
- Two reasonable people disagree and the call needs to be settled in writing.

Do **not** write an ADR for: routine bug fixes, a one-off script, a cosmetic UI tweak, or
anything reversible in under a day without downstream effects. Those go in the commit log,
not here.

---

## ADR lifecycle

ADRs move through a fixed set of states. Use the `Status` field.

| Status       | Meaning                                                |
| ------------ | ------------------------------------------------------ |
| `Proposed`   | Drafted, open for objection. Not yet binding.          |
| `Accepted`   | Approved. Binding. Implement against it.               |
| `Deprecated` | Still true for old code, but do not apply to new work. |
| `Superseded` | Replaced. Link the new ADR. Keep for history only.     |

A superseded ADR is never deleted. It is the paper trail that stops us from re-litigating
solved problems. If you are tempted to "just delete the old one," that is an anti-pattern
(see below).

---

## Canonical format

Copy everything from `## ADR-000: Title` to the end of the file for each new record.
Keep the heading numbering sequential and global (`ADR-005`, `ADR-006`, ...). Do not
renumber when one is superseded.

```markdown
## ADR-000: Title in Active Voice

- **Status**: Proposed | Accepted | Deprecated | Superseded (by ADR-0XX)
- **Date**: YYYY-MM-DD
- **Deciders**: @handle, @handle
- **Category**: Engineering | Product | Operations | Security

### Context

What is the situation? What forces are in play (our principles, user reality, constraints)?
Write two to six sentences a new hire can understand in 2027 without your Slack history.

### Decision

One clear sentence stating what we will do. Follow with the concrete rules if needed.
Be opinionated. "We will X" not "We considered X and Y."

### Rationale

Why this and not the alternative? Tie it explicitly to our five principles where relevant.
Name the option we rejected and the reason we rejected it.

### Consequences

What becomes easier, what becomes harder, what we must now maintain forever.
Include the cost in attention, rupees, or code we owe the future.

### Alternatives considered

- **Option A** (rejected): reason
- **Option B** (rejected): reason

### Compliance & principles check

- [ ] Conversation First respected
- [ ] Local First respected (or explicitly justified exception)
- [ ] Founder Control respected (founder still owns data and decisions)
- [ ] Context Before AI respected (context enriched before any model call)
- [ ] Cost First respected (within <$100/month, prefer free/OSS)
- [ ] Zero Vendor Lock-in respected (data is exportable and portable)
- [ ] Compliance by Design respected
- [ ] Everything should feel simple (no code or docs required to benefit)

### References

- Links to specs, issues, chats, or prior ADRs.
```

---

## Worked example (real shape, mirroring ADR-001)

This is the exact style we expect. Do not pad it; match its density.

```markdown
## ADR-001: Native Node SQLite Driver (`node:sqlite`)

- **Status**: Accepted
- **Date**: 2026-07-09
- **Deciders**: @shekar
- **Category**: Engineering

### Context

Contributors install Business OS on varied Windows laptops without a configured C++
toolchain. `better-sqlite3` requires `node-gyp` native compilation, which fails in that
environment and blocks first run.

### Decision

Use Node 24's built-in `node:sqlite` module via Drizzle's native support. Do not add
`better-sqlite3` or any native dependency to the core workspace.

### Rationale

Local First and Cost First both favor zero-install friction. A founder should run
`businessos` with one command and no compiler. The built-in module removes a whole class
of "it works on my machine" failures.

### Consequences

We depend on Node 24+. Query surface is smaller than `better-sqlite3`, so we avoid
exotic SQL features. We owe Drizzle-version alignment to the Node release line.

### Alternatives considered

- **better-sqlite3** (rejected): native build breaks on fresh Windows installs.
- **Postgres/remote DB** (rejected): violates Local First and adds a server to run.

### Compliance & principles check

- [x] Conversation First respected
- [x] Local First respected
- [x] Founder Control respected
- [x] Context Before AI respected
- [x] Cost First respected
- [x] Zero Vendor Lock-in respected
- [x] Compliance by Design respected
- [x] Everything should feel simple
```

---

## Authoring checklist

Before you mark an ADR `Accepted`, confirm every box:

- [ ] Title is in active voice and states the decision ("Use X", not "Thoughts on X").
- [ ] `Status`, `Date`, `Deciders`, and `Category` are filled. No `_TODO_` anywhere.
- [ ] `Context` can be understood by someone who was not in the room.
- [ ] `Decision` is one unambiguous sentence, not a list of maybes.
- [ ] `Rationale` names the rejected alternative and the reason it lost.
- [ ] The five principles checkboxes are all answered (an "x" or an explicit written exception).
- [ ] It is linked from `company/DECISIONS.md`.
- [ ] If it supersedes another ADR, that ADR's `Status` is updated to `Superseded (by ADR-0XX)`.

## Review checklist (for the decider approving it)

- [ ] The decision is reversible-through-ADR, not hidden in a PR description.
- [ ] A solo founder in India is not worse off because of this choice.
- [ ] We are not adding a recurring cost (cloud bill, maintenance, dependency) without reason.
- [ ] Future contributors can find this by searching the symptom, not the jargon.

---

## Anti-patterns

These are the ways ADRs rot. Avoid all of them.

- **Deleting instead of superseding.** Someone finds a wrong ADR and removes it. Six months
  later a new contributor repeats the mistake the ADR was meant to prevent. Keep the corpse;
  mark it `Superseded`.
- **Writing the ADR after the code ships.** The decision is already made, so the record is
  a ritual, not a tool. Write it while the trade-off is still alive in your head.
- **`Status: Proposed` forever.** A Proposed ADR that is silently implemented is a lie. Either
  accept it or kill it within the sprint it was opened.
- **Vague decisions.** "We will improve performance" is not a decision. "We will cache
  Instagram insights in `businessos/cache` and invalidate on connector pull" is.
- **Rationale without the rejected option.** If you only describe what you chose, you have not
  explained why. The rejected alternative is the whole point.
- **Bypassing the principles check.** Marking every box `x` without thought is worse than a
  real, written exception. An explicit "Local First exception: we sync only the encrypted
  backup" is correct; a silent checkbox is not.
- **Jargon-only context.** "Because of the hydration mismatch in the SSR boundary." Future you
  in 2028 has no idea what that means. Explain the force, not the acronym.
- **One ADR per PR.** ADRs are for decisions that outlive the change. A PR that renames a
  variable needs no ADR. If every PR gets one, the log becomes noise and real decisions drown.
- **Renumbering on supersede.** Keeping the original number is what lets `DECISIONS.md` form a
  stable, searchable history.

---

## Where ADRs live

- New ADRs are appended to `company/DECISIONS.md` in the same compact style as ADR-001..004.
- The full, expandable format above is the standard; `DECISIONS.md` is the index of records.
- This template file (`templates/ADR_TEMPLATE.md`) is the only place the format is defined.
  Change the format here, then update existing records to match over time - do not fork styles
  across files.
