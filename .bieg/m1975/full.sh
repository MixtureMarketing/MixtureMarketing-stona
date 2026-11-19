#!/usr/bin/env bash
# MIX-1975: jeden bieg na puli, z korzenia repo, ścieżki względne (wzór .bieg/m1815/full.sh):
# npm ci; testy celowane; pełna kontrola (eslint, prettier zmienionych, tsc root, tsc functions,
# vitest run, npm run build); budowy vite: on (flaga 1), off (flaga pusta), base (pliki z 8ab0502);
# probe 390/1366 (axe, CLS, linki, obrazy, HTML sekcji); porównanie HTML sekcji off = base;
# mutanty na końcu. Zrzuty sekcji wracają w logu jako base64 między SHOT-BEGIN/SHOT-END.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
D=.bieg/m1975
OUT=$D/full
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; return 0; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log"; }
tests_line() { clean "$1" | grep -aE '^ *(Test Files|Tests) ' | sed "s/^/  $1: /"; }
fails() { clean "$1" | grep -aE '^ *(FAIL|×) ' | head -20 | sed "s/^/  $1 fail: /"; }
restore_generated() { git checkout -- public/sitemap.xml public/llms.txt 2>/dev/null; git status --porcelain | grep -v '^?? ' | sed 's/^/  dirty: /'; }
CHANGED="components/features/web-development/CustomAppProof.tsx data/content/services/web-development/custom-app.ts config/flags.ts tests/components/customAppProofPsychon.test.tsx tests/scripts/ciWorkflow.test.ts"

step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
restore_generated
# shellcheck disable=SC2086
step related npx vitest related $CHANGED --run --maxWorkers=2
tests_line related; fails related
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
clean eslint | grep -aE 'error|warning|problem|^/' | head -20 | sed 's/^/  eslint: /'
# shellcheck disable=SC2086
step prettier npx prettier --check $CHANGED $D/probe.mjs
clean prettier | tail -4 | sed 's/^/  prettier: /'
step tsc-root npx tsc --noEmit -p tsconfig.json
echo "  tsc-root errors: $(grep -c 'error TS' "$OUT/tsc-root.log")"
grep -a 'error TS' "$OUT/tsc-root.log" | head -10 | sed 's/^/  tsc-root: /'
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
echo "  tsc-functions errors: $(grep -c 'error TS' "$OUT/tsc-functions.log")"
step vitest npx vitest run --maxWorkers=2
tests_line vitest; fails vitest
step build npm run build
clean build | grep -aE 'Size|error|Error' | head -6 | sed 's/^/  build: /'
restore_generated

# Budowy porównawcze (pełne flagi produkcji jak ci.yml, żeby strona wyglądała jak na produkcji).
PROD_ON="VITE_MM_MOBILE_MENU_B=1 VITE_MM_VIEW_TRANSITIONS=1 VITE_MM_AI_SECTION=1 VITE_MM_COOKIE_BANNER_STATIC=1 VITE_MM_POWIAZANE=1 VITE_MM_RZESZOW_SEKCJE=1 VITE_MM_TESTIMONIALS=1 VITE_MM_PORTFOLIO_VIDEO=1"
# shellcheck disable=SC2086
step build-on env $PROD_ON VITE_MM_CUSTOMAPP_PSYCHON=1 npx vite build --outDir "$D/dist-on"
restore_generated
# shellcheck disable=SC2086
step build-off env $PROD_ON VITE_MM_CUSTOMAPP_PSYCHON= npx vite build --outDir "$D/dist-off"
restore_generated
cp $D/base/CustomAppProof.tsx.base components/features/web-development/CustomAppProof.tsx
cp $D/base/custom-app.ts.base data/content/services/web-development/custom-app.ts
cp $D/base/flags.ts.base config/flags.ts
# shellcheck disable=SC2086
step build-base env $PROD_ON npx vite build --outDir "$D/dist-base"
git checkout -- components/features/web-development/CustomAppProof.tsx data/content/services/web-development/custom-app.ts config/flags.ts
restore_generated
echo "  dist-on webp: $(ls $D/dist-on/assets/custom-app/ 2>/dev/null | tr '\n' ' ')"
echo "  dist-on js z 'KorepetytorAI': $(grep -l 'KorepetytorAI' $D/dist-on/assets/*.js 2>/dev/null | wc -l) (treść danych w paczce; DOM mierzy probe)"

for t in on off base; do
  step "probe-$t" node $D/probe.mjs "$D/dist-$t" "$D/probe" "$t"
  grep -a '^PROBE' "$OUT/probe-$t.log" | cut -c1-1500
done
for w in 390 1366; do
  if cmp -s "$D/probe/off-$w.section.html" "$D/probe/base-$w.section.html"; then
    echo "SEKCJA off=base $w: identyczna ($(wc -c < "$D/probe/off-$w.section.html") B)"
  else
    echo "SEKCJA off=base $w: ROZNICA"; diff <(tr '>' '\n' < "$D/probe/base-$w.section.html") <(tr '>' '\n' < "$D/probe/off-$w.section.html") | head -20
  fi
done
for f in "$D"/probe/on-390.jpg "$D"/probe/on-1366.jpg "$D"/probe/off-1366.jpg; do
  [ -f "$f" ] || continue
  echo "SHOT-BEGIN $(basename "$f") $(wc -c < "$f")"; base64 -w0 "$f"; echo; echo "SHOT-END"
done

step mutanty bash $D/mut.sh
clean mutanty
echo "KONIEC"
