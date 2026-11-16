#!/usr/bin/env bash
# MIX-1790 (Z6 z MIX-1377), one run on the pool, from the repo root, relative paths only
# (wzór .bieg/m1412/r2.sh): npm ci; affected tests (vitest related); full check (eslint, tsc root,
# tsc functions, vitest run, build); local builds with both switches on and with both off; probe
# 390/1024/1366 (on) and 390 (off); mutants (mut.sh, green baseline) last. Result lines go to stdout
# (the pool returns the log), details to .bieg/m1790/full/ on the pool machine. The screenshots come
# back inside the log as base64 between SHOT-BEGIN/SHOT-END lines (decoded on the server).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1790/full
mkdir -p "$OUT"
# public, non-secret build variables (as .bieg/m1412/r2.sh)
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; return 0; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log"; }
tests_line() { clean "$1" | grep -aE '^ *(Test Files|Tests) ' | sed "s/^/  $1: /"; }
fails() { clean "$1" | grep -aE '^ *(FAIL|×) ' | head -20 | sed "s/^/  $1 fail: /"; }
restore_generated() { git checkout -- public/sitemap.xml 2>/dev/null; git status --porcelain | grep -v '^?? ' | sed 's/^/  dirty: /'; }

step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
restore_generated

# Files changed by MIX-1790 against integracja 56578cc (fixed list: the pool snapshot has no history).
CHANGED="components/features/calculator/CalculatorForm.tsx components/features/calculator/ConfigPreview.switch.test.tsx components/features/calculator/ConfigPreview.test.tsx components/features/calculator/ConfigPreview.tsx components/features/calculator/PublicCalculator.tsx components/features/calculator/configSketches.tsx components/features/calculator/livePrice.ts functions/api/estimation/public-preview.scope.test.ts functions/api/estimation/public-preview.ts hooks/useLivePriceRange.ts lib/estimation/publicQuote.ts lib/estimation/publicScope.test.ts lib/estimation/publicScope.ts services/pricePreviewService.scope.test.ts services/pricePreviewService.ts"
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

D=.bieg/m1790
step build-on env VITE_MM_CONFIG_PREVIEW=1 VITE_MM_LIVE_PRICE_BAR=1 npx vite build --outDir "$D/dist-on"
restore_generated
step build-off env VITE_MM_CONFIG_PREVIEW= VITE_MM_LIVE_PRICE_BAR= npx vite build --outDir "$D/dist-off"
restore_generated
# K2: the switch-off bundle has no sketch text; the switch-on one has it (inlined by Vite, same file set).
on_hits=$(grep -l 'Szkic: ' "$D"/dist-on/assets/*.js 2>/dev/null | wc -l)
echo "  bundle on: files with sketch label=$on_hits; js bytes=$(cat "$D"/dist-on/assets/*.js | wc -c)"
echo "  bundle off: js bytes=$(cat "$D"/dist-off/assets/*.js | wc -c)"

step probe-on node .bieg/m1790/probe.mjs "$D/dist-on" "$D/probe-on" on
grep -a '^PROBE' "$OUT/probe-on.log"
grep -a 'pageerror' "$OUT/probe-on.log" | head -5
step probe-off node .bieg/m1790/probe.mjs "$D/dist-off" "$D/probe-off" off
grep -a '^PROBE' "$OUT/probe-off.log"
for f in "$D"/probe-on/shots/*.jpg; do
  [ -f "$f" ] || continue
  echo "SHOT-BEGIN $(basename "$f") $(wc -c < "$f")"
  base64 -w0 "$f"
  echo
  echo "SHOT-END"
done

bash .bieg/m1790/mut.sh
restore_generated
echo DONE
