#!/usr/bin/env bash
# MIX-1607: pelna kontrola (npm ci, prettier, eslint, tsc, tsc functions, vitest run, build), potem mutanty.
set -u
OUT=.bieg/r/m1607
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "STEP $n rc=$?"; }
echo "legacy-peer-deps=true" > .npmrc
echo "SHA $(git rev-parse HEAD)"
step npm-ci npm ci --no-audit --no-fund
step prettier npx prettier --check components/pages/KnowledgeBase.tsx tests/components/KnowledgeBaseDefer.test.tsx
tail -n 4 "$OUT/prettier.log" | cut -c1-200
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
echo "| mutant | zmieniona linia (sed) | wynik |"
bash .bieg/m1607/mut.sh
echo "=== KONIEC full.sh"
