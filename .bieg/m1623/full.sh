#!/usr/bin/env bash
# MIX-1623: pelna kontrola na commitcie (npm ci, prettier na plikach zmiany, eslint, tsc, tsc functions, vitest run). Sciezki wzgledne, bez .npmrc.
set -u
OUT=.bieg/r/m1623full
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
CZERWONE=""
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local r=$?; echo "$n rc=$r"; [ $r -eq 0 ] || CZERWONE="$CZERWONE $n"; }
echo "git HEAD $(git rev-parse HEAD 2>/dev/null || echo brak)"
step npm-ci npm ci --no-audit --no-fund --legacy-peer-deps
step prettier npx prettier --check tests/components/AppCookieOrder.test.tsx
tail -n 5 "$OUT/prettier.log"
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
tail -n 15 "$OUT/eslint.log" | cut -c1-200
step tsc-root npx tsc --noEmit -p tsconfig.json
head -n 15 "$OUT/tsc-root.log"
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
head -n 15 "$OUT/tsc-functions.log"
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests |FAIL|✗|×" | head -n 30
echo "PELNA KONTROLA m1623: czerwone=[${CZERWONE# }]"
[ -z "$CZERWONE" ]
