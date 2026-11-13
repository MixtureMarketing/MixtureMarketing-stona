#!/usr/bin/env bash
# MIX-1268: testy celowane (pliki testow zmiany) + prettier/eslint na plikach zmiany. Sciezki wzgledne.
set -u
OUT=.bieg/r/m1268k
mkdir -p "$OUT"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local r=$?; echo "$n rc=$r"; return 0; }
[ -d node_modules ] || step npm-ci npm ci --no-audit --no-fund --legacy-peer-deps
mapfile -t F < .bieg/m1268/pliki.txt
step prettier npx prettier --check "${F[@]}"
tail -n 5 "$OUT/prettier.log"
mapfile -t L < <(grep -E '\.(ts|tsx|mjs)$' .bieg/m1268/pliki.txt)
step eslint npx eslint --max-warnings 0 "${L[@]}"
tail -n 10 "$OUT/eslint.log" | cut -c1-200
step vitest npx vitest run --maxWorkers=2 tests/utils/related.test.ts tests/components/Powiazane.test.tsx tests/components/powiazaneTemplates.test.tsx tests/hooks/cmsSnapshotShape.test.tsx
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests |FAIL|×" | head -n 20
exit 0
