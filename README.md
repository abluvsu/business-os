# Business OS

[![CI](https://github.com/abluvsu/business-os/actions/workflows/validate-docs.yml/badge.svg)](https://github.com/abluvsu/business-os/actions/workflows/validate-docs.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-24+-green?logo=nodedotjs)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11+-orange?logo=pnpm)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> **Local-first AI Chief of Staff for solo founders.** Connect your marketing data (Instagram, Gmail, Google Ads, Website), chat with your business context, get charts + plain-language insights — all running 100% on your machine.

---

## 🎯 What is Business OS?

Business OS is a **local-first, privacy-respecting AI workspace** that helps solo founders understand and improve their marketing through conversation, business context, and clear visualizations.

**It is not:** a CRM, ERP, workflow automation platform, multi-agent system, or dashboard builder.

**It is:** a calm workspace that already understands your business and helps you make better marketing decisions by talking with you.

### The Problem

Solo founders run marketing across 5+ tools (Instagram, Gmail, Google Ads, Google Analytics, WhatsApp, Sheets). They:

- Can't tell what's actually working — spend, posts, emails scattered across tools
- Get overwhelmed by dashboards — more charts ≠ more clarity
- Have no one to ask — agencies too expensive, friends give guesses
- Fear losing control — data shipped to unknown servers, locked in vendors

### The Solution

Business OS connects to your accounts via OAuth, normalizes everything into a **canonical domain model** (Campaigns, Customers, Products, Metrics), and lets you chat with an AI that _only sees your structured, validated data_ — no raw API payloads, no hallucinations.

---

## ✨ Key Features

| Feature                           | Description                                                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔒 **Local-First**                | SQLite database on your machine. Zero cloud dependency.                                                                                              |
| 🧠 **Trust Pipeline**             | 6-stage ingestion: Adapter → Zod Validation → Normalization → Canonical Objects → Business Validation → Persistence. Bad data never reaches the LLM. |
| 💬 **Conversation-First UX**      | Chat interface. Ask "Why did CPA spike?" → get chart + 2-sentence insight + 2 actionable recommendations.                                            |
| 📊 **Canonical Domain Model**     | Platform-agnostic: `BusinessEntity` (campaign, customer, product) + `TimeSeriesMetric` (spend, clicks, revenue, conversions).                        |
| 🔌 **Standardized Connectors**    | Instagram, Gmail, Google Ads, Website. Each implements 6-step lifecycle: `authenticate → discover → sync → normalize → validate → persist`.          |
| 📈 **Built-in Product Analytics** | Tracks TTFI (Time to First Insight), activation funnel, friction points — the product dogfoods itself.                                               |
| 🔄 **Workspace Isolation**        | One SQLite file per project. Process locking prevents corruption. Auto-restore last session.                                                         |
| ⚡ **Dual-LLM Fallback**          | Primary (OpenRouter) + Fallback provider + Local heuristic. Never leaves you without an answer.                                                      |

---

## 🏗 Architecture

```
┌─────────────┐     HTTP/WebSocket      ┌──────────────┐
│   Next.js   │ ◄─────────────────────► │   Fastify    │
│   (Port 3000)│                         │  (Port 4000) │
└─────────────┘                         └──────┬───────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
            ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
            │  Trust        │          │  Brain        │          │  Analytics    │
            │  Pipeline     │          │  Interface    │          │  Event Bus    │
            │  (Connectors) │          │  (LLM + RAG)  │          │  (TTFI, etc)  │
            └───────┬───────┘          └───────┬───────┘          └───────┬───────┘
                    │                          │                          │
                    └──────────────────────────┼──────────────────────────┘
                                               ▼
                                      ┌────────────────┐
                                      │  SQLite        │
                                      │  (per workspace)│
                                      └────────────────┘
```

### Monorepo Structure

```
business-os/
├── apps/
│   ├── server/          # Fastify API (Trust Pipeline, Brain, Analytics)
│   └── web/             # Next.js 14 + Tailwind v4 (Chat, Charts, Workspace UI)
├── packages/
│   ├── workspace/       # Workspace lifecycle (SQLite, locks, migrations)
│   ├── connector-sdk/   # Standardized connector interface
│   ├── brain-sdk/       # LLM integration (OpenRouter, fallback)
│   ├── context-engine/  # Context assembly for LLM
│   ├── shared/          # Zod schemas, types
│   ├── ui/              # Shared React components
│   ├── sdk/             # Client API bindings
│   └── visualization/   # ECharts components
├── docs/architecture/   # RFCs: Trust Pipeline, Domain Model, Architecture Audit
├── marketing/           # Full GTM: ICP, Positioning, Copy, Content, Launch
├── operations/          # Sprints, Reviews, Backlog, Releases
└── company/             # Constitution: Manifest, Context, Decisions (ADRs)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 24+** (required for native `node:sqlite`)
- **pnpm 11+**

### Install & Run

```bash
# Clone
git clone https://github.com/abluvsu/business-os.git
cd business-os

# Install dependencies
pnpm install

# Start both server (4000) and web (3000)
pnpm dev
```

Open http://localhost:3000 → Create Workspace → Connect Instagram/Gmail/Google Ads → Start chatting.

### Environment Variables

Create `apps/server/.env`:

```env
# Meta (Instagram)
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_REDIRECT_URI=http://localhost:4000/api/connectors/instagram/callback

# Google (Gmail + Google Ads)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/connectors/gmail/callback

# LLM (OpenRouter - free models available)
PRIMARY_AI_API_KEY=your_openrouter_key
PRIMARY_AI_BASE_URL=https://openrouter.ai/api/v1
PRIMARY_AI_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

---

## 📚 Documentation

| Document                                                      | Purpose                                                         |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| [System Specification](spec.md)                               | Architecture, schema, contracts, lifecycle                      |
| [Company Context](company/COMPANY_CONTEXT.md)                 | **Start here** — ICP, 8 principles, vocabulary, AI agent rules  |
| [Company Manifest](company/COMPANY_MANIFEST.md)               | Mission, V1 scope, principles, current sprint                   |
| [Decisions Register](company/DECISIONS.md)                    | All architectural decisions (ADRs) with rationale               |
| [Domain Model](docs/architecture/DOMAIN_MODEL.md)             | Canonical `BusinessEntity` + `TimeSeriesMetric`                 |
| [Trust Pipeline](docs/architecture/TRUST_PIPELINE.md)         | 6-stage ingestion, failure philosophy, connector design         |
| [Architecture Audit](docs/architecture/ARCHITECTURE_AUDIT.md) | 30 assumptions stress-tested, 100 failure scenarios, scale sims |
| [Sprint 000 Review](operations/SPRINT_000_REVIEW.md)          | What was built, verification, lessons, tech debt, risks         |

---

## 🛠 Development

### Commands

```bash
pnpm dev              # Start dev servers (parallel)
pnpm build            # Build all packages
pnpm typecheck        # TypeScript strict check
pnpm clean            # Clean all dist/.next folders

# Documentation validation (runs on pre-commit + CI)
pnpm validate:adrs    # Validate ADR format, compliance, cross-refs
pnpm validate:docs    # Check doc freshness, vocabulary, cross-refs
pnpm validate:context # Verify principles, banned words, glossary usage
pnpm validate:all     # Run all three
```

### Git Hooks (Husky)

- **pre-commit**: ADR validation + docs freshness + context compliance + Prettier + commitlint
- **commit-msg**: Enforces conventional commits (`feat:`, `fix:`, `adr:`, `decision:`, `sprint:`)

### Creating an ADR

```bash
# 1. Use the issue template
gh issue create --template adr.md

# 2. Write ADR following templates/ADR_TEMPLATE.md
# 3. Add to company/DECISIONS.md register
# 4. Commit with: git commit -m "adr: Native SQLite driver for zero-install friction"
```

---

## 🧪 Testing & Quality

- **TypeScript strict mode** across all packages
- **Markdownlint** for consistent documentation style
- **Commitlint** for conventional commits
- **Dependency Review** on every PR (high-severity blocks)
- **Security Scan** (TruffleHog for secrets)
- **Renovate** for automated dependency updates

---

## 🤝 Contributing

We follow the **Company Constitution** (`company/COMPANY_CONTEXT.md`). Every contribution must:

1. **Respect the 8 Principles** — Local First, Founder Control, Conversation First, etc.
2. **Follow the ADR Process** — Hard-to-reverse decisions need an ADR
3. **Use the Vocabulary** — Terms defined in §17 Glossary
4. **Write in Brand Voice** — Calm, clear, practical, no buzzwords
5. **Pass Validation** — `pnpm validate:all` must pass

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for details.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Node.js** team for native `node:sqlite` (zero native deps)
- **Drizzle ORM** for type-safe SQL
- **Fastify** for performant, typed HTTP
- **Next.js + Tailwind v4** for modern React DX
- **OpenRouter** for free LLM access

---

<p align="center">
  <strong>Built for solo founders who run marketing alone.</strong><br>
  <em>Your data. Your machine. Your decisions.</em>
</p>
