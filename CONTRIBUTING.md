# Contributing to Business OS

Thank you for contributing! Business OS is a local-first AI workspace for solo founders. Every contribution must align with our **Company Constitution** (`company/COMPANY_CONTEXT.md`).

---

## 📋 Before You Start

### Read These First (Required)
1. **[Company Context](company/COMPANY_CONTEXT.md)** — ICP, 8 Principles, Vocabulary, AI Agent Rules
2. **[Company Manifest](company/COMPANY_MANIFEST.md)** — Mission, V1 Scope, Current Sprint
3. **[Decisions Register](company/DECISIONS.md)** — All architectural decisions (ADRs)

### The 8 Principles (Non-Negotiable)
| Principle | What It Means |
|-----------|---------------|
| **Conversation First** | Chat is the primary UI; charts support answers |
| **Local First** | Data stays on founder's machine; cloud is opt-in |
| **Founder Control** | Founder owns data & decisions; no opaque automation |
| **Context Before AI** | Enrich business context before any model call |
| **Cost First** | <$100/month total; prefer free/OSS/offline |
| **Zero Vendor Lock-in** | Export & leave anytime; no proprietary formats |
| **Compliance by Design** | Indian founder, Indian data, Indian rules |
| **Everything Should Feel Simple** | No code/docs required to get value |

---

## 🔧 Development Setup

### Prerequisites
- **Node.js 24+** (required for native `node:sqlite`)
- **pnpm 11+**

### Install & Run
```bash
git clone https://github.com/abluvsu/business-os.git
cd business-os
pnpm install
pnpm dev
```

### Available Commands
```bash
pnpm dev              # Start server (4000) + web (3000)
pnpm build            # Build all packages
pnpm typecheck        # Strict TypeScript check
pnpm clean            # Clean all build artifacts

# Documentation validation (runs on pre-commit)
pnpm validate:adrs    # ADR format, compliance, cross-refs
pnpm validate:docs    # Freshness, vocabulary, cross-refs
pnpm validate:context # Principles, banned words, glossary
pnpm validate:all     # All three
```

---

## 📝 Contribution Workflow

### 1. Pick or Create an Issue
- Use [Issue Templates](https://github.com/abluvsu/business-os/issues/new/choose): ADR, Feature, Bug, Sprint
- Every hard-to-reverse decision **requires an ADR** before implementation

### 2. Branch & Commit
```bash
git checkout -b feat/your-feature-name
# Make changes
git add -A
git commit -m "feat(scope): your sentence-case description"
```

### Commit Message Format (Enforced)
```
type(scope): description

# Allowed types:
feat     - New founder-facing capability
fix      - Bug affecting founder workflow
docs     - Documentation only
style    - Formatting only
refactor - Code restructuring, no behavior change
perf     - Performance improvement
test     - Adding tests
chore    - Tooling, deps, CI
adr      - New Architecture Decision Record
decision - Product/architecture decision
sprint   - Sprint deliverable
```

### 3. Push & Create PR
```bash
git push origin feat/your-feature-name
# Open PR using our PR template
```

### PR Requirements (Enforced by CI)
- ✅ `pnpm typecheck` passes
- ✅ `pnpm build` passes
- ✅ `pnpm validate:all` passes
- ✅ Conventional commit messages
- ✅ ADR added if changing architecture/data model/connectors/LLM contract
- ✅ Documentation updated (`spec.md`, relevant RFCs, glossary if new terms)

---

## 🏗 Adding an ADR

Required when:
- Changing data model / Trust Pipeline stages
- Adding/removing connector interface
- Changing LLM provider / Brain Interface contract
- Modifying workspace isolation / locking / DB
- Adding cloud dependency / recurring cost
- Rejecting an obvious default due to principles

### Process
1. Open issue using **ADR template** (`gh issue create --template adr.md`)
2. Write ADR following [`templates/ADR_TEMPLATE.md`](templates/ADR_TEMPLATE.md)
3. Add to [`company/DECISIONS.md`](company/DECISIONS.md) register
4. Commit: `git commit -m "adr: Your decision title"`

### ADR Anti-Patterns (Will Be Rejected)
- ❌ Writing ADR after code ships
- ❌ `Status: Proposed` forever
- ❌ Vague decisions ("improve performance")
- ❌ Rationale without rejected alternative
- ❌ Silent principle checkboxes (write explicit exception)
- ❌ Jargon-only context ("hydration mismatch in SSR")
- ❌ Deleting old ADRs (supersede instead)

---

## 🎨 Code Style

### TypeScript
- Strict mode everywhere (`tsconfig.json` at root + per-package)
- No `any` — use `unknown` + type guards
- Zod schemas at every boundary (validated in Trust Pipeline)

### Documentation
- Markdownlint config: `.markdownlint.json`
- Follow vocabulary in `COMPANY_CONTEXT.md` §17
- No banned words: *revolutionary, cutting-edge, ai-powered, best-in-class, game-changing, disruptive, seamless, effortless, magical*

### Formatting
- Prettier (runs on pre-commit)
- 2-space indent, 120-char line length

---

## 🧪 Testing

### Manual E2E (Required for Sprint Deliverables)
```
1. Create workspace
2. Connect Instagram → OAuth → Sync
3. Connect Gmail → OAuth → Sync
4. Chat: "Which campaigns drove sales?"
5. Verify chart + insight appear
6. Kill server → Restart → Workspace auto-restores
7. Disconnect network → App still functional
```

### Automated (Future)
- Unit tests for Trust Pipeline stages
- Integration tests for connector lifecycle
- Contract tests for Brain Interface

---

## 🏷 Release Process

1. Sprint review completed (`operations/SPRINT_XXX_REVIEW.md`)
2. All ADRs `Accepted`, `DECISIONS.md` updated
3. `pnpm validate:all` passes
4. Tag: `git tag v0.0.X-foundation` → `git push --tags`
5. GitHub Release auto-generated from commits

---

## 💬 Getting Help

- **Architecture questions**: Check ADRs in `company/DECISIONS.md` + RFCs in `docs/architecture/`
- **Product questions**: `company/COMPANY_CONTEXT.md` + `marketing/01_customer/CUSTOMER_PROBLEMS.md`
- **Stuck on implementation**: Open issue with `needs-triage` label

---

## 📜 License

By contributing, you agree your contributions will be licensed under the [MIT License](LICENSE).

---

> **Remember**: You're not just writing code — you're building a calm, trustworthy workspace for a solo founder in India who has $100/month for software and zero tolerance for complexity. Every decision matters.