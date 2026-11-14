#!/usr/bin/env bash
# MIX-1665: bieg celowany (npm ci, prettier, eslint zmienionych, tsc, vitest related, check-llms, mutanty). Z korzenia repo.
set -u
OUT=.bieg/r/mix1665; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
F="scripts/lib/llms.js scripts/check-llms.mjs tests/seo/llmsTxt.test.ts"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) porcelain=$(git status --porcelain -- scripts tests | wc -l)"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/t-npm.log" 2>&1; echo "npm-ci rc=$?"
npx prettier --check $F > "$OUT/t-prettier.log" 2>&1; echo "prettier rc=$?"; tail -n 5 "$OUT/t-prettier.log"
npx eslint --max-warnings 0 $F > "$OUT/t-eslint.log" 2>&1; echo "eslint rc=$?"; tail -n 30 "$OUT/t-eslint.log"
npx tsc --noEmit -p tsconfig.json > "$OUT/t-tsc.log" 2>&1; echo "tsc-root rc=$?"; grep -E "error TS" "$OUT/t-tsc.log" | head -n 20
npx vitest related scripts/lib/llms.js tests/seo/llmsTxt.test.ts --run --maxWorkers=2 > "$OUT/t-vitest.log" 2>&1; echo "vitest-related rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/t-vitest.log" | grep -aoE "(✓|❯|×) [^ ]+\.test\.[a-z]+" | sort -u
sed 's/\x1b\[[0-9;]*m//g' "$OUT/t-vitest.log" | grep -aE "Test Files|Tests |FAIL|AssertionError|Expected|Received|^\s+[-+] " | head -n 80
node scripts/check-llms.mjs > "$OUT/t-real.log" 2>&1; echo "check-llms rc=$? $(tail -n 1 "$OUT/t-real.log")"
if [ "${MUT:-1}" = 1 ]; then bash .bieg/mix1665/mut.sh; fi
