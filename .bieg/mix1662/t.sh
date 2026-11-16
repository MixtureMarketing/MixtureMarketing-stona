#!/usr/bin/env bash
# MIX-1662: bieg celowany (npm ci, prettier, eslint zmienionych, tsc, vitest related, check-llms, mutanty). Z korzenia repo.
set -u
OUT=.bieg/r/mix1662; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
F="scripts/lib/llms.js scripts/check-llms.mjs tests/seo/llmsTxt.test.ts"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/t-npm.log" 2>&1; echo "npm-ci rc=$?"
npx prettier --check $F 2>&1 | tail -n 5; echo "prettier rc=${PIPESTATUS[0]}"
npx eslint --max-warnings 0 $F 2>&1 | tail -n 30; echo "eslint rc=${PIPESTATUS[0]}"
npx tsc --noEmit -p tsconfig.json > "$OUT/t-tsc.log" 2>&1; echo "tsc-root rc=$?"; grep -E "error TS" "$OUT/t-tsc.log" | head -n 20
npx vitest related scripts/lib/llms.js tests/seo/llmsTxt.test.ts --run --maxWorkers=2 > "$OUT/t-vitest.log" 2>&1; echo "vitest-related rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/t-vitest.log" | grep -aE "Test Files|Tests |FAIL|AssertionError|Expected|Received|^\s+[-+] " | head -n 60
node scripts/check-llms.mjs; echo "check-llms rc=$?"
if [ "${MUT:-1}" = 1 ]; then bash .bieg/mix1662/mut.sh; fi
