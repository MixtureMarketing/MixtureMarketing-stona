#!/usr/bin/env bash
# MIX-1280: full check (lint, tsc root, tsc functions, vitest run, build), then mutants. Run from repo root; relative paths only.
set -u
OUT=.bieg/r/mix1280
mkdir -p "$OUT" .bieg/r
: > "$OUT/summary.txt"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD)" | tee -a "$OUT/summary.txt"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "$n rc=$?" | tee -a "$OUT/summary.txt"; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
step tsc-root npx tsc --noEmit -p tsconfig.json
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests " | tee -a "$OUT/summary.txt"
step build npm run build
tail -n 8 "$OUT/build.log" | tee -a "$OUT/summary.txt"
git status --porcelain | grep -v '^?? .bieg/' | tee -a "$OUT/summary.txt"
bash .bieg/mix1280/mut.sh
echo DONE >> "$OUT/summary.txt"
