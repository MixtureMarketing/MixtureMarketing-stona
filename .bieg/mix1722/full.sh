#!/usr/bin/env bash
# MIX-1722: full check + mutants. Relative paths. No .npmrc (npm ci --legacy-peer-deps) so the run can go to the cloud.
set -u
OUT=.bieg/mix1722/out; mkdir -p "$OUT"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "$n rc=$?"; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step prettier npx prettier --check components/features/portfolio/PortfolioGrid.tsx tests/components/portfolioImageProportions.test.tsx
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
tail -n 10 "$OUT/eslint.log" | cut -c1-200
step tsc-root npx tsc --noEmit -p tsconfig.json
head -n 10 "$OUT/tsc-root.log"
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
head -n 10 "$OUT/tsc-functions.log"
step vitest-related npx vitest related components/features/portfolio/PortfolioGrid.tsx tests/components/portfolioImageProportions.test.tsx --run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest-related.log" | grep -aE "Test Files|Tests |FAIL" | head -n 10
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests |FAIL" | head -n 30
step build npm run build
tail -n 4 "$OUT/build.log" | cut -c1-200
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
mut M1 $G 's#relative aspect-\[16/9\] overflow#relative aspect-[16/9] md:aspect-[4/3] overflow#'
mut M2 $G 's#relative aspect-\[16/9\] overflow#relative aspect-[4/3] overflow#'
mut M3 $G 's#relative aspect-\[16/9\] overflow#relative aspect-[16/9] lg:h-72 overflow#'
mut M4 $G 's#relative aspect-\[16/9\] overflow#relative h-56 overflow#'
mut M5 $G 's#height: 450#height: 600#'
mut M6 $H 's#aspect-\[16/9\] max-h-\[75vh\]#aspect-[16/9] md:max-h-[50vh] max-h-[75vh]#'
mut M7 $G "/\.fit('crop')/d"
mut M8 $G 's#aspect-\[16/9\] bg-gray-200#h-2/3 bg-gray-200#'
mut M9 $G 's#relative aspect-\[16/9\] overflow#relative aspect-[16/9] [aspect-ratio:4/3] overflow#'
git status --short
echo "### end"
