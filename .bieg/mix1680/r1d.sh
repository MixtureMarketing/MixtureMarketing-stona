#!/usr/bin/env bash
# MIX-1680 r1d: llmsTxt po scaleniu z integracja i jeden mutant (straznik przyjmuje ukryte strony). Z korzenia repo.
set -u
OUT=.bieg/r/mix1680r1d; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm.log" 2>&1; echo "npm-ci rc=$?"
T=tests/seo/llmsTxt.test.ts
npx vitest run $T --maxWorkers=2 > "$OUT/base.log" 2>&1; echo "llmsTxt rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/base.log" | grep -aE 'Test Files|Tests '
F=scripts/lib/llms.js
cp "$F" "$OUT/orig.js"
node .bieg/mix1680/mutate.mjs "$F" 'const hidden = hiddenOk' 'const hidden = [] ; void hiddenOk' || echo "BLAD WZORCA"
npx vitest run $T --maxWorkers=2 > "$OUT/mut.log" 2>&1; echo "mutant-hidden-pusta rc=$?"
cp "$OUT/orig.js" "$F"; cmp -s "$OUT/orig.js" "$F" && echo cmp-ok || echo CMP-BLAD
sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut.log" | grep -aE 'Test Files|Tests '
grep -aE 'H06|H12' "$OUT/mut.log" | grep -a "FAIL\|×" | cut -c1-120 | sort -u | head
