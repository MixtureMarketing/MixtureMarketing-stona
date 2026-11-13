#!/usr/bin/env bash
# MIX-1276: szybka kontrola przed commitem (prettier, eslint zmienionych, tsc, test sekcji).
set -u
echo "SHA $(git rev-parse HEAD)"
echo "legacy-peer-deps=true" > .npmrc
npm ci --no-audit --no-fund > /dev/null 2>&1; echo "npm-ci rc=$?"
F="config/flags.ts components/sections/AiSystemsTeaser.tsx components/features/web-development/AiSystemsContextLink.tsx data/content/services/web-development/ai-section.ts components/pages/Home.tsx components/pages/CustomWebApp.tsx tests/components/aiSection.test.tsx tests/helpers/aiSectionPages.tsx"
npx prettier --check $F docs/tresci/MIX-1276.md 2>&1 | tail -n 12
npx prettier --write $F > /dev/null 2>&1; git diff --stat | cat; git diff -- $F | head -n 150
npx eslint $F --report-unused-disable-directives --max-warnings 0 2>&1 | tail -n 15; echo "eslint rc=${PIPESTATUS[0]}"
npx tsc --noEmit -p tsconfig.json 2>&1 | head -n 15; echo "tsc rc=${PIPESTATUS[0]}"
npx vitest run tests/components/aiSection.test.tsx tests/seo/aiSystemsPage.test.tsx tests/scripts/ciWorkflow.test.ts --maxWorkers=2 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -aE "✓|✗|×|FAIL|Test Files|Tests |Error|expected|received" | head -n 60
