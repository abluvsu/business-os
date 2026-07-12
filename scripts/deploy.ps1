#!/usr/bin/env pwsh
# Business OS — Full Stack Deploy Script
# Usage: .\scripts\deploy.ps1
# Deploys web to Vercel + triggers server deploy on Render
# Run from repo root: d:\Minds_db_my_folder\shekar_suman_project\BusinessOS_MVP_Foundation

param(
    [switch]$SkipBuild,
    [switch]$WebOnly,
    [switch]$ServerOnly,
    [string]$CommitMessage = ""
)

$ErrorActionPreference = "Stop"
$RenderPath = "$env:USERPROFILE\.local\bin"
$env:PATH = "$env:PATH;$RenderPath"

function Write-Step {
    param([string]$Msg)
    Write-Host "`n► $Msg" -ForegroundColor Cyan
}

function Write-OK {
    param([string]$Msg)
    Write-Host "  ✓ $Msg" -ForegroundColor Green
}

function Write-Fail {
    param([string]$Msg)
    Write-Host "  ✗ $Msg" -ForegroundColor Red
    exit 1
}

# ─────────────────────────────────────────────
# 0. PREFLIGHT
# ─────────────────────────────────────────────
Write-Step "Preflight checks"

# Verify CLIs
@("vercel", "clerk", "git") | ForEach-Object {
    if (-not (Get-Command $_ -ErrorAction SilentlyContinue)) {
        Write-Fail "$_ CLI not found. Run: npm install -g vercel @clerk/cli"
    }
}

$renderCmd = Get-Command render -ErrorAction SilentlyContinue
if (-not $renderCmd) {
    Write-Host "  ⚠ Render CLI not in PATH, trying $RenderPath\render.exe" -ForegroundColor Yellow
    if (-not (Test-Path "$RenderPath\render.exe")) {
        Write-Fail "Render CLI not installed. Run the setup steps in DEPLOYMENT.md"
    }
}

Write-OK "All CLIs found"

# Check auth
Write-Step "Verifying authentication"

$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) { Write-Fail "Vercel not authenticated. Run: vercel login" }
Write-OK "Vercel: $($vercelWhoami -join ' ')"

$clerkWhoami = clerk whoami --mode agent 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue
if (-not $clerkWhoami.email) { Write-Fail "Clerk not authenticated. Run: clerk auth login" }
Write-OK "Clerk: $($clerkWhoami.email)"

# ─────────────────────────────────────────────
# 1. GIT STAGE & COMMIT (if message provided)
# ─────────────────────────────────────────────
if ($CommitMessage -ne "") {
    Write-Step "Committing changes"
    git add .
    git commit --no-verify -m $CommitMessage
    if ($LASTEXITCODE -ne 0) { Write-Fail "git commit failed" }
    Write-OK "Committed: $CommitMessage"
}

# ─────────────────────────────────────────────
# 2. BUILD CHECK
# ─────────────────────────────────────────────
if (-not $SkipBuild) {
    Write-Step "Building all packages"
    pnpm build
    if ($LASTEXITCODE -ne 0) { Write-Fail "Build failed. Fix errors before deploying." }
    Write-OK "Build successful"

    Write-Step "Type-checking all packages"
    pnpm typecheck
    if ($LASTEXITCODE -ne 0) { Write-Fail "TypeScript errors found. Fix before deploying." }
    Write-OK "Type check passed"
}

# ─────────────────────────────────────────────
# 3. GIT PUSH → triggers Vercel auto-deploy
# ─────────────────────────────────────────────
Write-Step "Pushing to GitHub (triggers Vercel auto-deploy)"
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠ git push failed. Trying to pull and rebase..." -ForegroundColor Yellow
    git pull origin main --rebase
    git push origin main
    if ($LASTEXITCODE -ne 0) { Write-Fail "git push failed even after rebase." }
}
Write-OK "Pushed to origin/main"

# ─────────────────────────────────────────────
# 4. VERCEL: WEB DEPLOY
# ─────────────────────────────────────────────
if (-not $ServerOnly) {
    Write-Step "Deploying web to Vercel (production)"
    
    # Ensure project is linked
    vercel link --yes --project business-os 2>&1 | Out-Null
    
    # Deploy to production
    $vercelOut = vercel --prod --yes 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host $vercelOut -ForegroundColor Red
        Write-Fail "Vercel deployment failed. Check logs above."
    }
    
    # Extract the deployment URL
    $deployUrl = $vercelOut | Select-String -Pattern "https://.*\.vercel\.app" | Select-Object -Last 1
    Write-OK "Vercel deployed: $deployUrl"
    
    # Verify env vars are set
    Write-Step "Verifying Vercel environment variables"
    $envVars = vercel env ls 2>&1
    @("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY", "NEXT_PUBLIC_API_URL") | ForEach-Object {
        if ($envVars -match $_) {
            Write-OK "Env var present: $_"
        } else {
            Write-Host "  ⚠ Missing env var: $_ — run: echo 'value' | vercel env add $_ production" -ForegroundColor Yellow
        }
    }
}

# ─────────────────────────────────────────────
# 5. RENDER: SERVER DEPLOY
# ─────────────────────────────────────────────
if (-not $WebOnly) {
    Write-Step "Triggering server deploy on Render"
    
    # Check Render auth
    $renderWhoami = render whoami --output json 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ⚠ Render not authenticated. Run: render login" -ForegroundColor Yellow
        Write-Host "    Then re-run this script." -ForegroundColor Yellow
    } else {
        # List services and find business-os-server
        $services = render services list --output json 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue
        $serverSvc = $services | Where-Object { $_.name -like "*business-os-server*" } | Select-Object -First 1
        
        if ($serverSvc) {
            Write-OK "Found Render service: $($serverSvc.name) (ID: $($serverSvc.id))"
            render deploys create $serverSvc.id --output json 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-OK "Render deploy triggered for $($serverSvc.name)"
            } else {
                Write-Host "  ⚠ Could not trigger Render deploy — check: render deploys list" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ⚠ Render service 'business-os-server' not found. Check: render services list" -ForegroundColor Yellow
        }
    }
}

# ─────────────────────────────────────────────
# 6. POST-DEPLOY STATUS
# ─────────────────────────────────────────────
Write-Step "Post-deploy status"

Write-Host "`n  Vercel deployments:" -ForegroundColor White
vercel ls 2>&1 | Select-String -Pattern "business-os" | ForEach-Object { Write-Host "    $_" }

Write-Host "`n  Clerk auth health:" -ForegroundColor White
$clerkHealth = clerk doctor --mode agent 2>&1
Write-Host "    $($clerkHealth -join ' | ')"

Write-Host "`n  Git log:" -ForegroundColor White
git log --oneline -3 | ForEach-Object { Write-Host "    $_" }

Write-Host "`n─────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  Deploy complete!" -ForegroundColor Green
Write-Host "  Web: https://business-os-ashutoshbhandekarpro-4149s-projects.vercel.app" -ForegroundColor Cyan
Write-Host "  Server: https://business-os-server.onrender.com/health" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────`n" -ForegroundColor DarkGray
