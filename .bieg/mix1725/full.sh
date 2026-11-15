#!/usr/bin/env bash
# MIX-1725: full check on the committed tree. Relative paths. npm ci --legacy-peer-deps (no .npmrc) so it can run in the cloud.
set -u
OUT=.bieg/mix1725/out; mkdir -p "$OUT"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "$n rc=$?"; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
tail -n 10 "$OUT/eslint.log" | cut -c1-200
step tsc-root npx tsc --noEmit -p tsconfig.json
head -n 10 "$OUT/tsc-root.log"
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
head -n 10 "$OUT/tsc-functions.log"
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests |FAIL" | head -n 30
step build npm run build
tail -n 4 "$OUT/build.log" | cut -c1-200
git status --short
echo "### end"
