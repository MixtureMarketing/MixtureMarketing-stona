#!/usr/bin/env bash
# MIX-1651: pelna kontrola + mutanty. Sciezki wzgledne. Bez .npmrc (npm ci --legacy-peer-deps), zeby bieg szedl na stacje.
set -u
OUT=.bieg/r/m1651
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "$n rc=$?"; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step prettier npx prettier --check components/templates/case-study/CaseStudyHero.tsx components/features/portfolio/PortfolioGrid.tsx tests/components/portfolioImageProportions.test.tsx tests/components/caseStudyHeroLayout.test.tsx
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
# mutants: one file at a time, restore exactly that file
T="tests/components/portfolioImageProportions.test.tsx tests/components/caseStudyHeroLayout.test.tsx"
H=components/templates/case-study/CaseStudyHero.tsx
G=components/features/portfolio/PortfolioGrid.tsx
mut() { # name file sed-expr
  sed -i "$3" "$2"
  if git diff --quiet -- "$2"; then echo "MUT $1 NOOP"; return; fi
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$1.log" 2>&1; local rc=$?
  git checkout -- "$2"
  if [ $rc -ne 0 ]; then echo "MUT $1 zabity"; else echo "MUT $1 przezyl"; fi
}
mut M1 $H 's#aspect-\[16/9\] max-h#aspect-square sm:aspect-[4/3] md:aspect-[16/9] max-h#'
mut M2 $H 's#aspect-\[16/9\] max-h#aspect-[16/9] md:aspect-[4/3] max-h#'
mut M3 $G 's#relative aspect-\[4/3\] overflow#relative h-72 overflow#'
mut M4 $G 's#relative aspect-\[4/3\] overflow#relative aspect-[4/3] md:h-96 overflow#'
mut M5 $G 's#^ *width={800}$##'
mut M6 $H 's#aspect-\[16/9\] max-h#aspect-[4/3] max-h#'
git status --short
