#!/usr/bin/env bash
# MIX-1273: full check (lint, tsc root, tsc functions, vitest run, check-llms, build), potem mutanty. Z korzenia repo, sciezki wzgledne.
set -u
OUT=.bieg/r/mix1273
mkdir -p "$OUT"
: > "$OUT/summary.txt"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD)" | tee -a "$OUT/summary.txt"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "$n rc=$?" | tee -a "$OUT/summary.txt"; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
step prettier npx prettier --check scripts/lib/llms.js scripts/check-llms.mjs tests/seo/llmsTxt.test.ts package.json
step tsc-root npx tsc --noEmit -p tsconfig.json
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests " | tee -a "$OUT/summary.txt"
step check-llms-committed node scripts/check-llms.mjs
cat "$OUT/check-llms-committed.log" >> "$OUT/summary.txt"
step build npm run build
tail -n 8 "$OUT/build.log" | tee -a "$OUT/summary.txt"
node scripts/check-llms.mjs > "$OUT/check-llms-built.log" 2>&1; echo "check-llms-built (sitemap po buildzie) rc=$?" | tee -a "$OUT/summary.txt"
cat "$OUT/check-llms-built.log" >> "$OUT/summary.txt"
git status --porcelain | grep -v '^?? .bieg/' | tee -a "$OUT/summary.txt"
git checkout -- public/sitemap.xml 2>/dev/null
bash .bieg/mix1273/mut.sh
echo DONE >> "$OUT/summary.txt"
