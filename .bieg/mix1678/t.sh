#!/usr/bin/env bash
# MIX-1678: bieg celowany (npm ci, prettier, eslint, tsc, vitest related, mutanty). Z korzenia repo.
set -u
OUT=.bieg/r/mix1678; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
F="components/features/marketing/GoogleAdsCalculator.tsx tests/components/GoogleAdsCalculator.test.tsx"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) porcelain=$(git status --porcelain -- components tests | wc -l)"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/t-npm.log" 2>&1; echo "npm-ci rc=$?"
npx prettier --check $F > "$OUT/t-prettier.log" 2>&1; echo "prettier rc=$?"; tail -n 5 "$OUT/t-prettier.log"
npx eslint --max-warnings 0 $F > "$OUT/t-eslint.log" 2>&1; echo "eslint rc=$?"; tail -n 30 "$OUT/t-eslint.log"
npx tsc --noEmit -p tsconfig.json > "$OUT/t-tsc.log" 2>&1; echo "tsc-root rc=$?"; grep -E "error TS" "$OUT/t-tsc.log" | head -n 20
npx vitest related components/features/marketing/GoogleAdsCalculator.tsx tests/components/GoogleAdsCalculator.test.tsx --run --maxWorkers=2 > "$OUT/t-vitest.log" 2>&1; echo "vitest-related rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/t-vitest.log" | grep -aoE "(✓|❯|×) [^ ]+\.test\.[a-z]+" | sort -u
sed 's/\x1b\[[0-9;]*m//g' "$OUT/t-vitest.log" | grep -aE "Test Files|Tests |FAIL|AssertionError|Expected|Received" | head -n 40
if [ "${MUT:-1}" = 1 ]; then bash .bieg/mix1678/mut.sh; fi
