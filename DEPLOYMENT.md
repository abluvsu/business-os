# BusinessOS Deployment Guide

## Architecture Overview

```
┌─────────────────┐     HTTPS      ┌─────────────────┐
│   Vercel        │ ◄─────────────► │   Render        │
│   (Next.js)     │   API Calls    │   (Fastify)     │
│   Port 443      │                │   Port 443      │
└─────────────────┘                └─────────────────┘
         │                                 │
         │                                 ▼
         │                         ┌─────────────────┐
         │                         │   SQLite DB     │
         │                         │   (Persistent   │
         │                         │    Disk on      │
         │                         │    Render)      │
         └────────────────────────►│                 │
                                   └─────────────────┘
```

---

## Prerequisites

- GitHub repository connected to Vercel & Render
- Clerk account (for auth)
- OpenRouter API key (for AI - free tier available)
- Meta Developer App (for Instagram)
- Google Cloud Project (for Gmail/Google Ads)
- Nango account (optional, for managed OAuth)

---

## 1. Deploy Server to Render

### Option A: Using render.yaml (Recommended)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo
5. Render will detect `render.yaml` and create both services
6. Add environment variables in Render dashboard (see below)

### Option B: Manual Service Creation

1. **Create Web Service**:
   - Name: `business-os-server`
   - Runtime: Node
   - Build Command: `cd apps/server && npm install && npm run build`
   - Start Command: `cd apps/server && npm start`
   - Health Check: `/health`
   - Plan: Starter ($7/mo) - includes persistent disk

2. **Add Persistent Disk** (for SQLite):
   - Settings → Disks → Add Disk
   - Name: `business-os-data`
   - Mount Path: `/var/data`
   - Size: 1 GB minimum

3. **Set Environment Variables** in Render Dashboard:

| Variable               | Value                                                                | Notes                                      |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| `NODE_ENV`             | `production`                                                         |                                            |
| `PORT`                 | `4000`                                                               |                                            |
| `OPENAI_API_KEY`       | `sk-...`                                                             | Or use `PRIMARY_AI_API_KEY` for OpenRouter |
| `PRIMARY_AI_API_KEY`   | `sk-or-...`                                                          | OpenRouter key (recommended, free models)  |
| `PRIMARY_AI_BASE_URL`  | `https://openrouter.ai/api/v1`                                       |                                            |
| `PRIMARY_AI_MODEL`     | `meta-llama/llama-3.1-8b-instruct:free`                              | Free model                                 |
| `META_APP_ID`          | `123456789`                                                          | From Meta Developer Console                |
| `META_APP_SECRET`      | `abcdef...`                                                          | From Meta Developer Console                |
| `META_REDIRECT_URI`    | `https://YOUR-SERVER.onrender.com/api/connectors/instagram/callback` | Update after deploy                        |
| `GOOGLE_CLIENT_ID`     | `xxx.apps.googleusercontent.com`                                     | From Google Cloud Console                  |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...`                                                         | From Google Cloud Console                  |
| `GOOGLE_REDIRECT_URI`  | `https://YOUR-SERVER.onrender.com/api/connectors/gmail/callback`     | Update after deploy                        |
| `CLERK_SECRET_KEY`     | `sk_test_...`                                                        | From Clerk Dashboard                       |
| `NANGO_SECRET_KEY`     | `key_test_...`                                                       | Optional, from Nango Cloud                 |

---

## 2. Deploy Web App to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. **Configure**:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `npm run build` (auto-detected)
   - Install Command: `npm install --legacy-peer-deps`

5. **Environment Variables** in Vercel:

| Variable                            | Value                              |
| ----------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` (from Clerk)         |
| `CLERK_SECRET_KEY`                  | `sk_test_...` (from Clerk)         |
| `NEXT_PUBLIC_API_URL`               | `https://YOUR-SERVER.onrender.com` |

6. Deploy → Get URL: `https://business-os-web.vercel.app`

---

## 3. Configure OAuth Redirect URIs

### Meta (Instagram/Facebook)

1. Go to [Meta Developer Console](https://developers.facebook.com/apps)
2. Select your app → **Settings** → **Basic**
3. Add **Valid OAuth Redirect URIs**:
   - `https://YOUR-SERVER.onrender.com/api/connectors/instagram/callback`
4. Save → Update `META_REDIRECT_URI` in Render

### Google (Gmail/Google Ads)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add **Authorized redirect URIs**:
   - `https://YOUR-SERVER.onrender.com/api/connectors/gmail/callback`
5. Save → Update `GOOGLE_REDIRECT_URI` in Render

### Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. **Configure** → **Domains**
4. Add your Vercel domain: `business-os-web.vercel.app`
5. Update **Allowed Redirect Origins** if needed

---

## 4. Verify Deployment

### Health Checks

```bash
# Server health
curl https://YOUR-SERVER.onrender.com/health

# Expected response:
# {
#   "workspace": "opened|closed",
#   "database": "connected|disconnected",
#   "version": "0.0.1",
#   "uptime": 123.45
# }

# Web app
open https://business-os-web.vercel.app
```

### Test Flow

1. Open Vercel URL → Sign in with Clerk
2. Complete Company Onboarding (name + optional website)
3. Create Workspace
4. Go to Connectors tab → Connect Instagram/Gmail/Google Ads
5. Ask AI a question in Analysis tab

---

## 5. Local Development with Production APIs

```bash
# Terminal 1 - Server
cd apps/server
cp .env.example .env
# Fill in production OAuth keys
npm run dev

# Terminal 2 - Web
cd apps/web
# Add to .env.local:
# NEXT_PUBLIC_API_URL=https://YOUR-SERVER.onrender.com
npm run dev
```

---

## 6. Environment Variable Reference

### Server (Render)

| Variable               | Required      | Description                                      |
| ---------------------- | ------------- | ------------------------------------------------ |
| `OPENAI_API_KEY`       | No*           | OpenAI key (alternative to OpenRouter)           |
| `PRIMARY_AI_API_KEY`   | Yes*          | OpenRouter API key (recommended)                 |
| `PRIMARY_AI_BASE_URL`  | No            | Default: `https://openrouter.ai/api/v1`          |
| `PRIMARY_AI_MODEL`     | No            | Default: `meta-llama/llama-3.1-8b-instruct:free` |
| `META_APP_ID`          | For Instagram | Meta App ID                                      |
| `META_APP_SECRET`      | For Instagram | Meta App Secret                                  |
| `META_REDIRECT_URI`    | For Instagram | Production callback URL                          |
| `GOOGLE_CLIENT_ID`     | For Gmail/Ads | Google OAuth Client ID                           |
| `GOOGLE_CLIENT_SECRET` | For Gmail/Ads | Google OAuth Secret                              |
| `GOOGLE_REDIRECT_URI`  | For Gmail/Ads | Production callback URL                          |
| `CLERK_SECRET_KEY`     | Yes           | Clerk secret key                                 |
| `NANGO_SECRET_KEY`     | No            | Nango Cloud secret key                           |

*At least one AI key required

### Web (Vercel)

| Variable                            | Required | Description                        |
| ----------------------------------- | -------- | ---------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk publishable key              |
| `CLERK_SECRET_KEY`                  | Yes      | Clerk secret key (for server-side) |
| `NEXT_PUBLIC_API_URL`               | Yes      | Render server URL                  |

---

## 7. Troubleshooting

### SQLite "Read-only file system" on Render

- Ensure persistent disk is mounted at `/var/data`
- Workspace path should be on the disk: `/var/data/workspaces/...`

### CORS Errors

- Server CORS is set to `origin: "*"` in `index.ts`
- Verify `NEXT_PUBLIC_API_URL` matches Render URL exactly

### OAuth "Redirect URI Mismatch"

- Copy exact URL from Render dashboard (includes `https://`)
- No trailing slashes
- Match exactly in Meta/Google consoles

### Clerk "Invalid Domain"

- Add Vercel domain in Clerk Dashboard → Domains
- Wait 1-2 minutes for propagation

### AI Not Responding

- Check Render logs for `Primary AI failed` / `Fallback AI failed`
- Verify OpenRouter key has credits (free tier: 50 req/day)
- Check `PRIMARY_AI_BASE_URL` is `https://openrouter.ai/api/v1`

---

## 8. Cost Estimate (Monthly)

| Service                      | Plan        | Cost           |
| ---------------------------- | ----------- | -------------- |
| Render Web Service           | Starter     | $7             |
| Render Persistent Disk (1GB) | -           | $0.10          |
| Vercel                       | Hobby       | Free           |
| Clerk                        | Free tier   | Free (10k MAU) |
| OpenRouter                   | Free models | Free           |
| **Total**                    |             | **~$7.10/mo**  |

---

## 9. Custom Domain (Optional)

### Vercel (Web)

1. Project → Settings → Domains
2. Add `app.yourdomain.com`
3. Configure DNS: CNAME → `cname.vercel-dns.com`

### Render (Server)

1. Service → Settings → Custom Domains
2. Add `api.yourdomain.com`
3. Configure DNS: CNAME → `your-service.onrender.com`
4. Update `NEXT_PUBLIC_API_URL` to `https://api.yourdomain.com`
5. Update OAuth redirect URIs to use custom domain

---

## 10. Monitoring

- **Render**: Logs tab in dashboard, Metrics (CPU, Memory, Disk)
- **Vercel**: Functions tab, Analytics
- **Clerk**: Dashboard → Users, Sessions
- **Health endpoint**: `https://api.yourdomain.com/health` (set up uptime monitor)
