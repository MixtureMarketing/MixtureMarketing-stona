#!/usr/bin/env bash
# MIX-1759 (copy of .bieg/mix1745/full.sh): full check (npm ci, eslint, prettier of the changed files, tsc root,
# tsc functions, vitest related, vitest run, build). From the repo root.
# Difference to the copy: exit 1 when ANY step has rc != 0 (the original returned 0 even with a red step).
set -u
OUT=.bieg/r/mix1759f; mkdir -p "$OUT"; : > "$OUT/summary.txt"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)" | tee -a "$OUT/summary.txt"
RED=0
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "$n rc=$rc" | tee -a "$OUT/summary.txt"; if [ $rc -ne 0 ]; then RED=$((RED + 1)); sed "s/\x1b\[[0-9;]*m//g" "$OUT/$n.log" | tail -n 40 | tee -a "$OUT/summary.txt"; fi; }
F=".bieg/mix1759/ua.mjs utils/caseStudyBack.ts utils/caseStudyBackBrowser.ts tests/utils/caseStudyBack.test.ts tests/utils/caseStudyBackBrowser.test.ts"
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
step prettier npx prettier --check $F
step tsc-root npx tsc --noEmit -p tsconfig.json
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
step related npx vitest related $F --run --maxWorkers=2
sed "s/\x1b\[[0-9;]*m//g" "$OUT/related.log" | grep -aE "Test Files|Tests " | sed "s/^/related: /" | tee -a "$OUT/summary.txt"
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests " | tee -a "$OUT/summary.txt"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE " FAIL |AssertionError" | head -n 20 | tee -a "$OUT/summary.txt"
step build npm run build
echo "porcelain: $(git status --porcelain | grep -v '^?? .bieg/' | wc -l)" | tee -a "$OUT/summary.txt"
echo "FULL-MIX1759 red-steps=$RED" | tee -a "$OUT/summary.txt"
[ "$RED" -eq 0 ]
