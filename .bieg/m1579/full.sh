#!/usr/bin/env bash
# MIX-1579: pełna kontrola (lint, tsc, tsc functions, vitest run, build), potem mutanty. Ścieżki względne.
set -u
OUT=.bieg/r/m1579
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "$n rc=$?"; }
echo "legacy-peer-deps=true" > .npmrc
step npm-ci npm ci --no-audit --no-fund
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
tail -n 15 "$OUT/eslint.log" | cut -c1-200
step tsc-root npx tsc --noEmit -p tsconfig.json
head -n 15 "$OUT/tsc-root.log"
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
head -n 15 "$OUT/tsc-functions.log"
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests |FAIL" | head -n 30
step build npm run build
tail -n 8 "$OUT/build.log" | cut -c1-200
echo "| mutant | plik | wynik |"
bash .bieg/m1579/mut.sh
