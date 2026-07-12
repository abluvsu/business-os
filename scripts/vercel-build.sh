#!/bin/sh
# Vercel build script - called from apps/web/ directory
# Builds all workspace packages then the web app
cd ../..
pnpm --filter @business-os/shared build
pnpm --filter @business-os/workspace build
pnpm --filter @business-os/connector-sdk build
pnpm --filter @business-os/brain-sdk build
pnpm --filter @business-os/context-engine build
pnpm --filter @business-os/sdk build
pnpm --filter @business-os/ui build
pnpm --filter @business-os/visualization build
pnpm --filter business-os-web build
