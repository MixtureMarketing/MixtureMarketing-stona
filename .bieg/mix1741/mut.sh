#!/usr/bin/env bash
# MIX-1741: mutants of the fix line (components/features/portfolio/PortfolioGrid.tsx, grid class) against
# tests/components/portfolioGridTransition.test.tsx. One mutant at a time, the file restored with git checkout after
# each. Usage: bash .bieg/mix1741/mut.sh (repo root, committed tree). Line per mutant: MUT <id> rc=<vitest rc> <zabity|przezyl>.
set -u
G=components/features/portfolio/PortfolioGrid.tsx
T=tests/components/portfolioGridTransition.test.tsx
OUT=.bieg/r/mix1741m; mkdir -p "$OUT"
git diff --quiet -- "$G" || { echo "$G has uncommitted changes: stop"; exit 2; }
for m in bug m2 m3 m5 nocv; do
  node .bieg/mix1741/variant.mjs "$m" > "$OUT/apply-$m.txt" 2>&1 || { echo "MUT $m not applied"; git checkout -- "$G"; continue; }
  npx vitest run "$T" --maxWorkers=2 > "$OUT/$m.log" 2>&1; rc=$?
  git checkout -- "$G"
  r=przezyl; [ $rc -ne 0 ] && r=zabity
  echo "MUT $m rc=$rc $r $(sed 's/\x1b\[[0-9;]*m//g' "$OUT/$m.log" | grep -aE '^ +(×|✗|FAIL) ' | head -n 2 | tr -s ' ' | cut -c1-200 | paste -sd'|')"
done
git diff --quiet -- "$G" && echo "restored $G"
