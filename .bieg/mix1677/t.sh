#!/usr/bin/env bash
# MIX-1677: bieg celowany (npm ci, prettier, eslint, tsc, vitest pliku, mutanty po baseline). Z korzenia repo.
set -u
OUT=.bieg/r/mix1677; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
T=tests/seo/aiSystemsArticleVisuals.test.tsx
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) porcelain=$(git status --porcelain | grep -v '^?? .bieg/' | wc -l)"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/t-npm.log" 2>&1; echo "npm-ci rc=$?"
npx prettier --check $T > "$OUT/t-prettier.log" 2>&1; echo "prettier rc=$?"; if [ "${FIXFMT:-0}" = 1 ]; then npx prettier --write $T >/dev/null 2>&1; git diff -- $T; git checkout -- $T; fi
npx eslint --max-warnings 0 $T > "$OUT/t-eslint.log" 2>&1; echo "eslint rc=$?"; tail -n 30 "$OUT/t-eslint.log"
npx tsc --noEmit -p tsconfig.json > "$OUT/t-tsc.log" 2>&1; echo "tsc-root rc=$?"; grep -E "error TS" "$OUT/t-tsc.log" | head -n 20
npx vitest run $T --maxWorkers=2 > "$OUT/t-vitest.log" 2>&1; rc=$?; echo "vitest-baseline rc=$rc"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/t-vitest.log" | grep -aE -A25 "AssertionError" | head -n 80; sed 's/\x1b\[[0-9;]*m//g' "$OUT/t-vitest.log" | grep -aE 'Test Files|Tests '
if [ $rc -ne 0 ]; then echo "baseline NIE zielony, mutanty pominiete"; exit 1; fi
if [ "${MUT:-1}" = 1 ]; then bash .bieg/mix1677/mut.sh; fi
