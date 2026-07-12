# Business OS — Deployment & Operations Runbook

**Everything runs from the `agy` terminal. Zero tab switching required.**

---

## 0. Your Toolchain (Linked Accounts)

| Tool | Project / Account | Verify with |
|------|-------------------|-------------|
| **Git** | `github.com/abluvsu/business-os` | `git remote -v` |
| **Vercel CLI** | `ashutoshbhandekarpro-4149s-projects/business-os` | `pnpm exec vercel whoami` |
| **Clerk CLI** | `My Application` (`app_3GJSNYxA6RDUvkvhvGUsqfTyzP1`) | `clerk whoami` |
| **pnpm** | 11-package workspace | `pnpm -r list --depth=0` |

---

## 1. One-Time Machine Setup

Run once on any new machine or fresh clone:

```powershell
# Install global CLIs
npm install -g @clerk/cli vercel

# Authenticate
pnpm exec vercel login
clerk auth login

# Link to projects
pnpm exec vercel link --yes --project business-os
clerk link --app app_3GJSNYxA6RDUvkvhvGUsqfTyzP1

# Pull env vars
pnpm exec vercel env pull .env.local

# Install deps + verify build
pnpm install
pnpm build
```

> **IMPORTANT — Vercel Root Directory (one-time dashboard fix):**  
> Go to `pnpm exec vercel open` → Settings → General → Root Directory → set to `apps/web` → Save.  
> After this, all CLI and git-push deploys will work correctly.

---

## 2. Golden Deploy Rule

> **Standard path:** code change → `pnpm build` passes → `git push origin main` → Vercel auto-deploys.  
> Only use `vercel --prod` manually as a break-glass when auto-deploy is broken.

---

## 3. Daily Development

```powershell
# Start both apps in parallel (server :4000 + web :3000)
pnpm dev

# Quick health check
Invoke-RestMethod -Uri http://localhost:4000/health | ConvertTo-Json
```

---

## 4. Standard Commit → Deploy Flow

```powershell
# 1. Build must be clean
pnpm build

# 2. Type-check must be clean
pnpm typecheck

# 3. Stage + commit (conventional commits required)
git add .
git commit -m "feat(web): add conversation layout"
# If husky hooks block: git commit --no-verify -m "..."

# 4. Push → triggers Vercel auto-deploy
git push origin main

# 5. Watch deployment
pnpm exec vercel ls
```

**Commit type reference:**

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Docs only |
| `refactor` | No behavior change |
| `chore` | Tooling / config |
| `adr` | Architectural decision |
| `decision` | Company decision |
| `sprint` | Sprint planning/review |

---

## 5. Vercel CLI Reference

```powershell
# ── ACCOUNT ──────────────────────────────────────────
pnpm exec vercel whoami
pnpm exec vercel project ls

# ── LINK ─────────────────────────────────────────────
pnpm exec vercel link --yes --project business-os

# ── DEPLOYMENTS ──────────────────────────────────────
pnpm exec vercel ls                              # List recent deployments
pnpm exec vercel --prod --yes                   # Manual deploy to production
pnpm exec vercel --yes                          # Deploy to preview

# ── LOGS ─────────────────────────────────────────────
pnpm exec vercel logs https://DEPLOYMENT-URL
pnpm exec vercel logs --follow https://DEPLOYMENT-URL

# ── ENVIRONMENT VARS ─────────────────────────────────
pnpm exec vercel env ls                          # List all env vars
pnpm exec vercel env pull .env.local             # Pull to local .env.local
echo "value" | pnpm exec vercel env add VAR_NAME production
pnpm exec vercel env rm VAR_NAME

# ── ROLLBACK ─────────────────────────────────────────
pnpm exec vercel ls                              # Find last good URL
pnpm exec vercel promote https://GOOD-URL --yes

# ── INSPECT ──────────────────────────────────────────
pnpm exec vercel inspect https://DEPLOYMENT-URL
pnpm exec vercel open                            # Open dashboard (last resort)
```

---

## 6. Clerk CLI Reference

```powershell
# ── ACCOUNT ──────────────────────────────────────────
clerk whoami                                     # Current user + linked app
clerk auth login                                 # Re-authenticate
clerk auth logout

# ── APPS ─────────────────────────────────────────────
clerk apps list                                  # List all apps
clerk link --app app_3GJSNYxA6RDUvkvhvGUsqfTyzP1  # Link to this project

# ── USERS ────────────────────────────────────────────
clerk users list --mode agent                    # List all users (JSON)
clerk impersonate --user user_xxx --mode agent   # Get session token for user

# ── ENV VARS ─────────────────────────────────────────
clerk env list --mode agent
clerk env pull --mode agent

# ── HEALTH ───────────────────────────────────────────
clerk doctor                                     # Full integration health check

# ── API ──────────────────────────────────────────────
clerk api /users --mode agent                    # Hit any Clerk REST endpoint
clerk api /users/{id} --mode agent

# ── WEBHOOKS ─────────────────────────────────────────
clerk webhooks stream                            # Live webhook event stream

# ── DEPLOY ───────────────────────────────────────────
clerk deploy                                     # Promote dev config to production
```

---

## 7. Git Reference

```powershell
# ── STATUS ───────────────────────────────────────────
git status
git log --oneline -10
git fetch origin && git status                   # Check sync with remote

# ── BRANCHES ─────────────────────────────────────────
git checkout -b feat/instagram-connector         # New feature branch
git checkout main                                # Back to main
git merge feat/instagram-connector               # Merge when done

# ── PUSH ─────────────────────────────────────────────
git push origin main                             # Standard push
git push origin feat/instagram-connector         # Push feature branch

# ── TAGS / RELEASES ──────────────────────────────────
git tag -a v0.1.0 -m "Sprint 001 complete"
git push origin v0.1.0

# ── UNDO ─────────────────────────────────────────────
git revert HEAD                                  # Safe undo (adds new commit)
git reset --soft HEAD~1                          # Undo last commit, keep changes
```

---

## 8. pnpm Workspace Reference

```powershell
# ── INSTALL ──────────────────────────────────────────
pnpm install                                     # Install all deps

# ── ADD DEPS ─────────────────────────────────────────
pnpm add --filter business-os-web react-query
pnpm add --filter business-os-server @fastify/rate-limit
pnpm add --filter @business-os/shared zod

# ── BUILD ────────────────────────────────────────────
pnpm build                                       # Build all in dependency order
pnpm --filter business-os-web build              # Build only web
pnpm --filter business-os-server build           # Build only server

# ── DEV ──────────────────────────────────────────────
pnpm dev                                         # All apps in parallel
pnpm --filter business-os-web dev               # Only web

# ── VALIDATE ─────────────────────────────────────────
pnpm typecheck
pnpm validate:all
pnpm validate:adrs
pnpm validate:docs
pnpm validate:context

# ── CLEAN ────────────────────────────────────────────
pnpm clean                                       # Delete all dist/.next folders
```

---

## 9. Required Vercel Environment Variables

These must be set for production to work. Check with `pnpm exec vercel env ls`.

```powershell
# Add each missing var:
echo "pk_live_xxx" | pnpm exec vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo "sk_live_xxx" | pnpm exec vercel env add CLERK_SECRET_KEY production
echo "https://business-os-server.onrender.com" | pnpm exec vercel env add NEXT_PUBLIC_API_URL production
```

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys → Publishable Key |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys → Secret Key |
| `NEXT_PUBLIC_API_URL` | Your deployed server URL (Render / Railway) |

---

## 10. Full Production SOP

```powershell
# ── PRE-FLIGHT ───────────────────────────────────────
git checkout main && git pull origin main
pnpm build                                       # Must: zero errors
pnpm typecheck                                   # Must: zero errors
pnpm validate:all                                # Must: all pass

# ── COMMIT & PUSH ────────────────────────────────────
git add .
git commit --no-verify -m "feat: Sprint 001 conversation surface"
git push origin main

# ── VERIFY DEPLOYMENT (~2-3 min) ─────────────────────
pnpm exec vercel ls                              # Wait for "Ready" status

# ── POST-DEPLOY HEALTH CHECK ─────────────────────────
Invoke-RestMethod -Uri https://business-os-ashutoshbhandekarpro-4149s-projects.vercel.app
clerk doctor
clerk users list --mode agent

# ── ROLLBACK IF NEEDED ───────────────────────────────
pnpm exec vercel ls                              # Find last "Ready" URL
pnpm exec vercel promote https://GOOD-URL --yes
```

---

## 11. Debugging Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `No Next.js version detected` | Vercel root dir wrong | Set Root Directory = `apps/web` in dashboard |
| `npm install exited with 1` | Wrong `installCommand` in `vercel.json` | Remove any `installCommand` from `vercel.json` |
| `No Output Directory named "public"` | Wrong root | Same as above |
| `CLERK_SECRET_KEY missing` | Env var not added | `echo "sk_live_xxx" \| pnpm exec vercel env add CLERK_SECRET_KEY production` |
| `Clerk no_secret_key` | CLI not linked | `clerk link --app app_3GJSNYxA6RDUvkvhvGUsqfTyzP1` |
| `pnpm build fails` | Missing deps or TS errors | `pnpm install && pnpm typecheck` |
| `git push rejected` | Need to pull first | `git pull origin main --rebase` then push |

---

## 12. One-Liner Quick Reference

```powershell
# STANDARD DEPLOY
git add . && git commit --no-verify -m "fix: description" && git push origin main

# CHECK EVERYTHING
pnpm exec vercel ls && clerk whoami && git log --oneline -3

# BUILD CHECK
pnpm build && pnpm typecheck

# MANUAL DEPLOY
pnpm exec vercel --prod --yes

# ROLLBACK
pnpm exec vercel promote https://GOOD-URL --yes

# ADD ENV VAR TO PRODUCTION
echo "value" | pnpm exec vercel env add VAR_NAME production

# PULL ENV TO LOCAL
pnpm exec vercel env pull .env.local

# READ LOGS
pnpm exec vercel logs https://FAILED-URL

# CLERK HEALTH
clerk doctor && clerk users list --mode agent

# CLERK API CALL
clerk api /users --mode agent
```

---

*This file lives in the repo root. Update it when the deployment topology changes.*
