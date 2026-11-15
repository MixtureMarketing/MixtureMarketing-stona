#!/usr/bin/env bash
# MIX-1732: full check + gate timing + mutants on the COMMITTED tree. Relative paths only; cloud-safe.
# Usage: bash .bieg/mix1732/gate.sh   (from the repo root; no .npmrc upload => npm ci --legacy-peer-deps)
set -u
OUT=.bieg/mix1732/out; mkdir -p "$OUT"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) status=$(git status --porcelain -- . ':!.bieg' | wc -l)"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "$n rc=$?"; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
CH="scripts/audit-proportions.mjs scripts/lib/proportions.mjs tests/scripts/proportionsGate.test.ts tests/components/portfolioImageProportions.test.tsx package.json .github/workflows/ci.yml"
step prettier npx prettier --check $CH
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
tail -n 8 "$OUT/eslint.log" | cut -c1-200
step tsc-root npx tsc --noEmit -p tsconfig.json
head -n 8 "$OUT/tsc-root.log" | cut -c1-200
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests |FAIL" | head -n 20
gate() { # name: runs the gate on dist, prints its time and rc
  local s=$(date +%s%N); node scripts/audit-proportions.mjs dist > "$OUT/audit-$1.log" 2>&1; local rc=$?
  echo "GATE $1 rc=$rc ms=$(( ($(date +%s%N) - s) / 1000000 ))"; cut -c1-220 "$OUT/audit-$1.log"; return $rc
}
# clean tree: switch ON (preview build) and OFF (production build), real npm run build
VITE_MM_VIEW_TRANSITIONS=1 step build-on npm run build; tail -n 3 "$OUT/build-on.log" | cut -c1-160
gate on
gate_on=$?
# fail-closed forms of the script itself: dist missing; a dist without cards (0 cards)
node scripts/audit-proportions.mjs no-such-dist > "$OUT/form-nodist.log" 2>&1; echo "FORM nodist rc=$? $(head -n 1 $OUT/form-nodist.log | cut -c1-160)"
mkdir -p "$OUT/stub"; echo '<!doctype html><title>x</title><div id=root></div>' > "$OUT/stub/index.html"
node scripts/audit-proportions.mjs "$OUT/stub" > "$OUT/form-stub.log" 2>&1; echo "FORM stub(0 cards) rc=$? $(grep -a FAIL "$OUT/form-stub.log" | head -n 2 | cut -c1-200 | tr '\n' '|')"
env -u VITE_MM_VIEW_TRANSITIONS step build-off npm run build; tail -n 3 "$OUT/build-off.log" | cut -c1-160
gate off
gate_off=$?
git status --porcelain -- . ':!.bieg' | cut -c1-100
git checkout -- public/sitemap.xml 2>/dev/null
[ -z "$(git status --porcelain -- . ':!.bieg')" ] || { echo "tree not clean before mutants: stop"; git status --porcelain -- . ':!.bieg'; exit 2; }

T="tests/components/portfolioImageProportions.test.tsx"
H=components/templates/case-study/CaseStudyHero.tsx
G=components/features/portfolio/PortfolioGrid.tsx
last() { grep -n -- "$2" "$1" | tail -n 1 | cut -d: -f1; }
first() { grep -n -- "$2" "$1" | head -n 1 | cut -d: -f1; }
# mutate <name> <file> <sed-expr>; unit run always, browser run when BROWSER=1 (OFF build with vite build only)
mutate() {
  local name=$1 file=$2 expr=$3
  sed -i "$expr" "$file"
  if git diff --quiet -- "$file"; then echo "MUT $name NOOP"; return; fi
  echo "MUT $name line: $(git diff -U0 -- "$file" | grep -a '^+[^+]' | head -n 1 | cut -c1-150)"
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$name-unit.log" 2>&1; local ru=$?
  local rb=-
  if [ "${BROWSER:-0}" = 1 ]; then
    npx vite build > "$OUT/mut-$name-build.log" 2>&1
    if [ $? -eq 0 ]; then node scripts/audit-proportions.mjs dist > "$OUT/mut-$name-audit.log" 2>&1; rb=$?; else rb=build-failed; fi
  fi
  git checkout -- "$file"
  local ul; ul=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name-unit.log" | grep -aE "AssertionError|Error:|FAIL" | head -n 1 | cut -c1-170)
  local bl=""; [ "$rb" != - ] && bl=$(grep -a '^FAIL' "$OUT/mut-$name-audit.log" 2>/dev/null | head -n 1 | cut -c1-170)
  local res="przezyl"; { [ $ru -ne 0 ] || { [ "$rb" != - ] && [ "$rb" != 0 ]; }; } && res="zabity"
  echo "MUT $name unit_rc=$ru browser_rc=$rb => $res | unit: $ul | browser: $bl"
}
HOFF=$(last $H "\.fit('crop')"); HON=$(first $H "\.fit('crop')")
BROWSER=1 mutate U1-hero-off-crop-top $H "${HOFF}s#\.fit('crop')#.fit('crop').crop('top')#"
mutate U6-hero-on-crop-top $H "${HON}s#\.fit('crop')#.fit('crop').crop('top')#"
BROWSER=1 mutate U2-hero-off-md-aspect43 $H 's#bg-gray-100 aspect-\[16/9\] max-h-\[75vh\]"$#bg-gray-100 aspect-[16/9] md:aspect-[4/3] max-h-[75vh]"#'
BROWSER=1 mutate U4-card-style-height $G 's#<div className="relative aspect-\[16/9\] overflow-hidden bg-gray-100">#<div className="relative aspect-[16/9] overflow-hidden bg-gray-100" style={{ height: 240 }}>#'
mutate U3-checker-startsWith $T 's#tokens.filter((t) => !allowed.includes(t))#tokens.filter((t) => !allowed.some((a) => t.startsWith(a)))#'
mutate U5-checker-endsWith $T 's#tokens.filter((t) => !allowed.includes(t))#tokens.filter((t) => !allowed.some((a) => t.endsWith(a)))#'
mutate X1-checker-includes $T 's#tokens.filter((t) => !allowed.includes(t))#tokens.filter((t) => !allowed.some((a) => t.includes(a)))#'
BROWSER=1 mutate NEG-hero-off-4x3 $H 's#bg-gray-100 aspect-\[16/9\] max-h-\[75vh\]"$#bg-gray-100 aspect-[4/3] max-h-[75vh]"#'
git status --porcelain -- . ':!.bieg'
echo "### end gate_on=$gate_on gate_off=$gate_off"
