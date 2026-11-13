#!/usr/bin/env bash
# MIX-1412 r2 (after merging integracja e9d24c8), one run on the pool, from the repo root, relative paths only:
# npm ci; affected tests (vitest related); full check (eslint, tsc root, tsc functions, vitest run, build);
# probe 390/1024/1280/1366 on a local build with VITE_MM_LIVE_PRICE_BAR=1; mutants (mut.sh, green baseline) last.
# Every result line goes to stdout (the pool returns the log), details to .bieg/m1412/r2/ on the pool machine.
# The pool runs a snapshot commit of HEAD (bieg-na-stacji: 1 commit without secret-looking files); the real SHA
# is the first line of the pool log (SHA=...). Generated files (build: public/sitemap.xml) are restored.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1412/r2
mkdir -p "$OUT"
# public, non-secret build variables (as .bieg/mix1272/full.sh)
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; return 0; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log"; }
tests_line() { clean "$1" | grep -aE '^ *(Test Files|Tests) ' | sed "s/^/  $1: /"; }
fails() { clean "$1" | grep -aE '^ *(FAIL|×) ' | head -20 | sed "s/^/  $1 fail: /"; }
restore_generated() { git checkout -- public/sitemap.xml 2>/dev/null; git status --porcelain | grep -v '^?? ' | sed 's/^/  dirty: /'; }

step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
restore_generated

# Files changed by MIX-1412 against integracja e9d24c8 (fixed list: the pool snapshot has no history).
CHANGED="components/features/calculator/CalculatorForm.tsx components/features/calculator/LivePriceBar.tsx components/features/calculator/PublicCalculator.tsx components/features/calculator/QuestionField.tsx components/pages/WycenaCalculator.tsx hooks/usePublicCalculator.ts services/pricePreviewService.ts components/features/calculator/livePrice.ts"
# shellcheck disable=SC2086
step related npx vitest related $CHANGED --run --maxWorkers=2
tests_line related
fails related

step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
clean eslint | grep -aE 'error|warning|problem|^/' | head -20 | sed 's/^/  eslint: /'
step tsc-root npx tsc --noEmit -p tsconfig.json
echo "  tsc-root errors: $(grep -c 'error TS' "$OUT/tsc-root.log")"
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
echo "  tsc-functions errors: $(grep -c 'error TS' "$OUT/tsc-functions.log")"
step vitest npx vitest run --maxWorkers=2
tests_line vitest
fails vitest
step build npm run build
clean build | grep -aE 'Size|error' | head -4 | sed 's/^/  build: /'
restore_generated

D=.bieg/m1412
step build-on env VITE_MM_LIVE_PRICE_BAR=1 npx vite build --outDir "$D/dist-on"
restore_generated
step probe-on node scripts/probe-live-price-bar.mjs "$D/dist-on" "$D/probe-on"
node .bieg/m1412/r2-probe-summary.mjs "$D/probe-on/probe.json"

bash .bieg/m1412/mut.sh
restore_generated
echo DONE
