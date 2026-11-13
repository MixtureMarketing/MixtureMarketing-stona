#!/usr/bin/env bash
# MIX-1412 r2 (after merging integracja e9d24c8), one run on the pool, from the repo root, relative paths only:
# npm ci; affected tests (vitest related); full check (eslint, tsc root, tsc functions, vitest run, build);
# probe 390/1024/1280/1366 on a local build with VITE_MM_LIVE_PRICE_BAR=1 (and off); mutants (mut.sh) last.
# Every result line goes to stdout (the pool returns the log), details to .bieg/m1412/r2/.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1412/r2
mkdir -p "$OUT"
# public, non-secret build variables (as .bieg/mix1272/full.sh)
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; return 0; }
tests_line() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log" | grep -aE '^ *(Test Files|Tests) ' | sed "s/^/  $1: /"; }

step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund

CHANGED=$(git diff --name-only e9d24c8 HEAD -- '*.ts' '*.tsx' | grep -v '^\.bieg/' | tr '\n' ' ')
echo "related files: $(echo $CHANGED | wc -w)"
# shellcheck disable=SC2086
step related npx vitest related $CHANGED --run --maxWorkers=2
tests_line related
sed 's/\x1b\[[0-9;]*m//g' "$OUT/related.log" | grep -aE '^ *(✓|❯|×|FAIL) ' | grep -v '✓' | head -20

step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
tail -n 3 "$OUT/eslint.log"
step tsc-root npx tsc --noEmit -p tsconfig.json
grep -c 'error TS' "$OUT/tsc-root.log" | sed 's/^/  tsc-root errors: /'
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
grep -c 'error TS' "$OUT/tsc-functions.log" | sed 's/^/  tsc-functions errors: /'
step vitest npx vitest run --maxWorkers=2
tests_line vitest
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE '^ *(FAIL|×) ' | head -20
step build npm run build
tail -n 4 "$OUT/build.log"

D=.bieg/m1412
step build-on env VITE_MM_LIVE_PRICE_BAR=1 npx vite build --outDir "$D/dist-on"
step probe-on node scripts/probe-live-price-bar.mjs "$D/dist-on" "$D/probe-on"
step build-off env -u VITE_MM_LIVE_PRICE_BAR npx vite build --outDir "$D/dist-off"
step probe-off node scripts/probe-live-price-bar.mjs "$D/dist-off" "$D/probe-off"
node .bieg/m1412/r2-probe-summary.mjs "$D/probe-on/probe.json" "$D/probe-off/probe.json"

bash .bieg/m1412/mut.sh
git status --porcelain | grep -v '^?? ' | sed 's/^/  dirty: /'
echo DONE
