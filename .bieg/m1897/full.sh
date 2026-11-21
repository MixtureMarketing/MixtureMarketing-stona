#!/usr/bin/env bash
# MIX-1897 full check on the pool, from the repo root, relative paths only (wzór .bieg/m1892/full.sh,
# .bieg/m1814/full.sh): npm ci; vitest related; eslint; prettier; tsc root + functions; vitest run;
# build; 8 local builds (VITE_MM_CALC_NEW_UI x VITE_MM_NEW_CLIENT_TIMELINE x VITE_MM_BOOKING_EMBED,
# VITE_MM_LEAD_CONFIG=1) probed at 390 and 1366 px; one probe mutant (booking after the timeline in
# the new look must FAIL u1-t1-b1); unit mutants (mut.sh) last. Screenshots of b1 builds as base64.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1897/full
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; return 0; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log"; }
tests_line() { clean "$1" | grep -aE '^ *(Test Files|Tests) ' | sed "s/^/  $1: /"; }
fails() { clean "$1" | grep -aE '^ *(FAIL|×) |AssertionError|Expected|Received' | head -30 | sed "s/^/  $1 fail: /"; }
restore_generated() { git checkout -- public/sitemap.xml 2>/dev/null; git status --porcelain | grep -v '^?? ' | sed 's/^/  dirty: /'; }

step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
restore_generated
D=components/features/calculator
CHANGED="$D/CalculatorResult.tsx $D/PublicCalculator.tsx $D/BookingTimeline.combos.test.tsx $D/BookingEmbed.tsx $D/livePrice.ts hooks/usePublicCalculator.ts tests/scripts/ciWorkflow.test.ts"
# shellcheck disable=SC2086
step related npx vitest related $CHANGED --run --maxWorkers=2
tests_line related
fails related
step combos npx vitest run $D/BookingTimeline.combos.test.tsx $D/BookingEmbed.switch.test.tsx $D/NewClientTimeline.newUi.test.tsx tests/scripts/ciWorkflow.test.ts --maxWorkers=2
tests_line combos
fails combos
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
clean eslint | grep -aE 'error|warning|problem|^/' | head -20 | sed 's/^/  eslint: /'
# shellcheck disable=SC2086
step prettier npx prettier --check $CHANGED .github/workflows/ci.yml .bieg/m1897/probe.mjs
clean prettier | tail -3 | sed 's/^/  prettier: /'
# shellcheck disable=SC2086
npx prettier --write $CHANGED .bieg/m1897/probe.mjs > /dev/null 2>&1
# shellcheck disable=SC2086
git diff -- $CHANGED | sed 's/^/  prettier-diff: /' | head -60
# shellcheck disable=SC2086
git checkout -- $CHANGED
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

B=.bieg/m1897
yn() { [ "$1" = 1 ] && echo 1 || echo ''; }
for u in 0 1; do for t in 0 1; do for b in 0 1; do
  n="u$u-t$t-b$b"
  step "build-$n" env VITE_MM_LEAD_CONFIG=1 VITE_MM_CALC_NEW_UI="$(yn $u)" VITE_MM_NEW_CLIENT_TIMELINE="$(yn $t)" VITE_MM_BOOKING_EMBED="$(yn $b)" npx vite build --outDir "$B/dist-$n"
  restore_generated
  step "probe-$n" node .bieg/m1897/probe.mjs "$B/dist-$n" "$B/probe-$n" "$u" "$t" "$b"
  grep -a '^PROBE .* fails=' "$OUT/probe-$n.log" | cut -c1-800
  grep -a 'pageerror' "$OUT/probe-$n.log" | head -3 | cut -c1-300
done; done; done
grep -ah '^PROBE .*\[' "$OUT"/probe-u1-t1-b1.log "$OUT"/probe-u0-t1-b1.log | cut -c1-1500

# Probe negative leg: new look with booking after the timeline must FAIL u1-t1-b1.
R=$D/CalculatorResult.tsx
FROM='      {booking}
      {timeline}
' TO='      {timeline}
      {booking}
' node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");if(!s.includes(process.env.FROM)){process.exit(3)}fs.writeFileSync(f,s.replace(process.env.FROM,process.env.TO))' "$R" && {
  step build-pm1 env VITE_MM_LEAD_CONFIG=1 VITE_MM_CALC_NEW_UI=1 VITE_MM_NEW_CLIENT_TIMELINE=1 VITE_MM_BOOKING_EMBED=1 npx vite build --outDir "$B/dist-pm1"
  git checkout -- "$R"
  restore_generated
  step probe-pm1 node .bieg/m1897/probe.mjs "$B/dist-pm1" "$B/probe-pm1" 1 1 1
  grep -a '^PROBE .* fails=' "$OUT/probe-pm1.log" | cut -c1-600
} || echo "probe-pm1 NOMATCH"
git diff --quiet -- "$R" || echo "WARN $R dirty after pm1"

for f in "$B"/probe-u*-t1-b1/shots/*.jpg; do
  [ -f "$f" ] || continue
  echo "SHOT-BEGIN $(basename "$f") $(wc -c < "$f")"
  base64 -w0 "$f"
  echo
  echo "SHOT-END"
done

bash .bieg/m1897/mut.sh; echo "STEP mutants rc=$?"
restore_generated
echo DONE
