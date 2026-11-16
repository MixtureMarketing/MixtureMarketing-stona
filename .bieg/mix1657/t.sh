#!/usr/bin/env bash
# MIX-1657: bieg celowany (npm ci, prettier, eslint zmienionych, tsc, vitest llmsTxt + ciWorkflow, check-llms, mutanty). Z korzenia repo.
set -u
OUT=.bieg/r/mix1657; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
F="scripts/lib/llms.js scripts/check-llms.mjs tests/seo/llmsTxt.test.ts"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/t-npm.log" 2>&1; echo "npm-ci rc=$?"
npx prettier --check $F .github/workflows/ci.yml 2>&1 | tail -n 5; echo "prettier rc=${PIPESTATUS[0]}"
npx eslint --max-warnings 0 $F 2>&1 | tail -n 30; echo "eslint rc=${PIPESTATUS[0]}"
npx tsc --noEmit -p tsconfig.json > "$OUT/t-tsc.log" 2>&1; echo "tsc-root rc=$?"; grep -E "error TS" "$OUT/t-tsc.log" | head -n 20
npx vitest run tests/seo/llmsTxt.test.ts tests/scripts/ciWorkflow.test.ts --maxWorkers=2 > "$OUT/t-vitest.log" 2>&1; echo "vitest rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/t-vitest.log" | grep -aE "Test Files|Tests |FAIL|AssertionError|Expected|Received|^\s+[-+] " | head -n 60
node scripts/check-llms.mjs; echo "check-llms rc=$?"
if [ "${MUT:-1}" = 1 ]; then bash .bieg/mix1657/mut.sh; fi
