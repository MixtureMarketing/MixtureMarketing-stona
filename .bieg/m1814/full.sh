#!/usr/bin/env bash
# shellcheck disable=SC2126
# MIX-1814 (Z9), one run on the pool, from the repo root, relative paths only (wzór .bieg/m1813/full.sh,
# .bieg/m1799/full.sh): npm ci; affected tests; eslint, prettier, tsc root + functions, vitest run,
# build; local builds with the switches on/off and the 390 px probe (on: Google calendar frame after
# the click; off: nothing); mutants last. Screenshots come back as base64 between SHOT-BEGIN/SHOT-END.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1814/full
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; return 0; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log"; }
tests_line() { clean "$1" | grep -aE '^ *(Test Files|Tests) ' | sed "s/^/  $1: /"; }
fails() { clean "$1" | grep -aE '^ *(FAIL|×) |Error:|Expected|Received' | head -30 | sed "s/^/  $1 fail: /"; }
restore_generated() { git checkout -- public/sitemap.xml 2>/dev/null; git status --porcelain | grep -v '^?? ' | sed 's/^/  dirty: /'; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
restore_generated
CHANGED="components/features/calculator/livePrice.ts components/features/calculator/BookingEmbed.tsx components/features/calculator/CalculatorResult.tsx components/features/calculator/PublicCalculator.tsx hooks/usePublicCalculator.ts components/features/calculator/BookingEmbed.switch.test.tsx tests/scripts/ciWorkflow.test.ts .bieg/m1814/probe.mjs"
# shellcheck disable=SC2086
step related npx vitest related $CHANGED --run --maxWorkers=2
tests_line related
fails related
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
clean eslint | grep -aE 'error|warning|problem|^/' | head -20 | sed 's/^/  eslint: /'
# shellcheck disable=SC2086
step prettier npx prettier --check $CHANGED .github/workflows/ci.yml
clean prettier | tail -4 | sed 's/^/  prettier: /'
step tsc-root npx tsc --noEmit -p tsconfig.json
echo "  tsc-root errors: $(grep -c 'error TS' "$OUT/tsc-root.log")"
grep -a 'error TS' "$OUT/tsc-root.log" | head -10 | sed 's/^/  tsc-root: /'
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
echo "  tsc-functions errors: $(grep -c 'error TS' "$OUT/tsc-functions.log")"
step vitest npx vitest run --maxWorkers=2
tests_line vitest
fails vitest
step build npm run build
clean build | grep -aE 'Size|error' | head -4 | sed 's/^/  build: /'
restore_generated

D=.bieg/m1814
step build-on env VITE_MM_LEAD_CONFIG=1 VITE_MM_BOOKING_EMBED=1 npx vite build --outDir "$D/dist-on"
restore_generated
step build-off env VITE_MM_LEAD_CONFIG=1 VITE_MM_BOOKING_EMBED= npx vite build --outDir "$D/dist-off"
restore_generated
echo "  bundle on: files with 'Wybierz termin rozmowy'=$(grep -l 'Wybierz termin rozmowy' "$D"/dist-on/assets/*.js 2>/dev/null | wc -l); js bytes=$(cat "$D"/dist-on/assets/*.js | wc -c)"
echo "  bundle off: files with 'Wybierz termin rozmowy'=$(grep -l 'Wybierz termin rozmowy' "$D"/dist-off/assets/*.js 2>/dev/null | wc -l); js bytes=$(cat "$D"/dist-off/assets/*.js | wc -c)"
step probe-on node .bieg/m1814/probe.mjs "$D/dist-on" "$D/probe-on" on
grep -a '^PROBE\|^prod-safe\|PROD-SAFE' "$OUT/probe-on.log" | cut -c1-1500
grep -a 'pageerror' "$OUT/probe-on.log" | head -5
step probe-off node .bieg/m1814/probe.mjs "$D/dist-off" "$D/probe-off" off
grep -a '^PROBE\|^prod-safe\|PROD-SAFE' "$OUT/probe-off.log" | cut -c1-1500
grep -a 'pageerror' "$OUT/probe-off.log" | head -5
for f in "$D"/probe-on/shots/*.jpg "$D"/probe-off/shots/*-po.jpg; do
  [ -f "$f" ] || continue
  echo "SHOT-BEGIN $(basename "$f") $(wc -c < "$f")"
  base64 -w0 "$f"
  echo
  echo "SHOT-END"
done

bash .bieg/m1814/mut.sh; echo "STEP mutants rc=$?"
restore_generated
echo DONE
