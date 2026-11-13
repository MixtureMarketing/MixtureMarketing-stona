#!/usr/bin/env bash
# MIX-1272: full check (lint, tsc root, tsc functions, vitest run), then mutants. Run from repo root; relative paths only.
set -u
OUT=.bieg/r/mix1272
mkdir -p "$OUT"
: > "$OUT/summary.txt"
echo "HEAD=$(git rev-parse HEAD)" | tee -a "$OUT/summary.txt"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "$n rc=$?" | tee -a "$OUT/summary.txt"; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
step tsc-root npx tsc --noEmit -p tsconfig.json
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
step vitest npx vitest run --maxWorkers=2
grep -E "Test Files|Tests " "$OUT/vitest.log" | tee -a "$OUT/summary.txt"
bash .bieg/mix1272/mut.sh
echo DONE >> "$OUT/summary.txt"
