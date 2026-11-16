#!/usr/bin/env bash
# MIX-1724: full check + mutants on the committed tree. Relative paths. npm ci --legacy-peer-deps (no .npmrc) so it can run in the cloud.
set -u
OUT=.bieg/mix1724/out; mkdir -p "$OUT"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "$n rc=$?"; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step prettier npx prettier --check components/features/portfolio/PortfolioGrid.tsx components/templates/case-study/CaseStudyHero.tsx tests/components/portfolioImageProportions.test.tsx tests/components/caseStudyHeroLayout.test.tsx
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
T="tests/components/portfolioImageProportions.test.tsx tests/components/caseStudyHeroLayout.test.tsx"
H=components/templates/case-study/CaseStudyHero.tsx
G=components/features/portfolio/PortfolioGrid.tsx
run_mut() { # name file
  if git diff --quiet -- "$2"; then echo "MUT $1 NOOP"; return; fi
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$1.log" 2>&1; local rc=$?
  git checkout -- "$2"
  if [ $rc -ne 0 ]; then echo "MUT $1 zabity"; else echo "MUT $1 przezyl"; fi
}
mut() { sed -i "$3" "$2"; run_mut "$1" "$2"; }   # name file sed-expr
last() { grep -n -- "$2" "$1" | tail -n 1 | cut -d: -f1; }   # line number of the LAST match
mutl() { sed -i "$3$4" "$2"; run_mut "$1" "$2"; }   # name file line sed-cmd
FRAME='s#relative aspect-\[16/9\] overflow#relative aspect-[16/9] @@ overflow#'
for x in flex-1 grow md:flex-1 '[block-size:240px]' 'md:[block-size:240px]' '[max-block-size:200px]' 'absolute inset-0' 'py-[28%]' self-stretch row-span-2; do
  n=W$(echo "$x" | tr -c 'a-z0-9\n' '_')
  mut "card$n" $G "${FRAME/@@/$x}"
done
mut hero-on-flex1 $H 's#aspect-\[16/9\] max-h-\[75vh\] mb-12#aspect-[16/9] max-h-[75vh] flex-1 mb-12#'
mutl hero-on-nofit $H "$(grep -n "\.fit('crop')" $H | head -n 1 | cut -d: -f1)" d
mutl hero-off-nofit $H "$(last $H "\.fit('crop')")" d
mutl hero-off-noheight $H "$(last $H "\.height(HERO_PHOTO.height)")" d
mutl hero-off-noheightattr $H "$(last $H "height={HERO_PHOTO.height}")" d
mutl hero-off-img-hauto $H "$(last $H 'className="w-full h-full object-cover"')" 's#h-full#h-auto#'
mutl hero-off-img-contain $H "$(last $H 'className="w-full h-full object-cover"')" 's#object-cover#object-contain#'
mut hero-off-frame43 $H 's#bg-gray-100 aspect-\[16/9\] max-h-\[75vh\]"$#bg-gray-100 aspect-[4/3] max-h-[75vh]"#'
mut hero-off-noaspect $H 's#bg-gray-100 aspect-\[16/9\] max-h-\[75vh\]"$#bg-gray-100 max-h-[75vh]"#'
mut hero-off-mdmaxh $H 's#bg-gray-100 aspect-\[16/9\] max-h-\[75vh\]"$#bg-gray-100 aspect-[16/9] max-h-[75vh] md:max-h-[50vh]"#'
mut card-img-contain $G 's#h-full object-cover transition#h-full object-contain transition#'
git status --short
echo "### end"
