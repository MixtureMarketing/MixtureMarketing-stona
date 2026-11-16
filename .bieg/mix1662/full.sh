#!/usr/bin/env bash
# MIX-1662: pelna kontrola (npm ci, eslint, prettier zmienionych, tsc root, tsc functions, vitest run, build, check-llms po buildzie). Z korzenia repo.
set -u
OUT=.bieg/r/mix1662f; mkdir -p "$OUT"; : > "$OUT/summary.txt"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)" | tee -a "$OUT/summary.txt"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "$n rc=$rc" | tee -a "$OUT/summary.txt"; if [ $rc -ne 0 ]; then sed "s/\x1b\[[0-9;]*m//g" "$OUT/$n.log" | tail -n 40 | tee -a "$OUT/summary.txt"; fi; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
step prettier npx prettier --check scripts/lib/llms.js scripts/check-llms.mjs tests/seo/llmsTxt.test.ts
step tsc-root npx tsc --noEmit -p tsconfig.json
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests " | tee -a "$OUT/summary.txt"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE " FAIL |AssertionError" | head -n 20 | tee -a "$OUT/summary.txt"
step build npm run build
step check-llms-built node scripts/check-llms.mjs
tail -n 6 "$OUT/check-llms-built.log" | tee -a "$OUT/summary.txt"
echo "porcelain: $(git status --porcelain | grep -v '^?? .bieg/' | wc -l)" | tee -a "$OUT/summary.txt"
