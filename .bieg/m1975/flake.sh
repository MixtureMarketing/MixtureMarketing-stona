#!/usr/bin/env bash
# MIX-1975: czy czerwony test kalkulatora z full1 (ResultContact.combos, „wygląd=1, oś=pusta, terminy=1”)
# zależy od tej zmiany: plik 5× osobno, potem drugi pełny vitest. Linie FLAKE i VITEST.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
echo "HEAD=$(git rev-parse HEAD)"
npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1; echo "npm-ci rc=$?"
F=components/features/calculator/ResultContact.combos.test.tsx
for i in 1 2 3 4 5; do
  npx vitest run "$F" > .bieg/m1975/flake-$i.log 2>&1; rc=$?
  echo "FLAKE $i rc=$rc $(sed 's/\x1b\[[0-9;]*m//g' .bieg/m1975/flake-$i.log | grep -aE '^ *Tests ' | head -1)"
done
npx vitest run --maxWorkers=2 > .bieg/m1975/vitest2.log 2>&1; rc=$?
echo "VITEST rc=$rc"
sed 's/\x1b\[[0-9;]*m//g' .bieg/m1975/vitest2.log | grep -aE '^ *(Test Files|Tests) |^ *(FAIL|×) ' | head -12
