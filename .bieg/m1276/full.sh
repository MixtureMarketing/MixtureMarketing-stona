#!/usr/bin/env bash
# MIX-1276: pelna kontrola (npm ci, prettier zmienionych, eslint ., tsc, tsc functions, vitest run, build), potem mutanty.
set -u
OUT=.bieg/r/m1276
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "STEP $n rc=$?"; }
echo "legacy-peer-deps=true" > .npmrc
echo "SHA $(git rev-parse HEAD)"
step npm-ci npm ci --no-audit --no-fund
F=$(git diff --name-only --diff-filter=AM e73e60d HEAD -- . ':!*.txt' ':!*.sh' ':!package-lock.json' | tr '\n' ' ')
echo "ZMIENIONE: $F"
step prettier npx prettier --check $F
tail -n 6 "$OUT/prettier.log" | cut -c1-200
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
tail -n 10 "$OUT/eslint.log" | cut -c1-200
step tsc-root npx tsc --noEmit -p tsconfig.json
head -n 10 "$OUT/tsc-root.log"
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
head -n 10 "$OUT/tsc-functions.log"
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests |FAIL" | head -n 20
step build npm run build
tail -n 4 "$OUT/build.log" | cut -c1-200
echo "=== MUTANTY"
bash scripts/mutants-m1276.sh "$OUT/mut"
echo "=== KONIEC full.sh"
