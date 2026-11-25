#!/usr/bin/env bash
# MIX-1269 full check (wzór .bieg/m1938/full.sh): npm ci; vitest related; eslint; prettier (pliki
# zmiany); tsc root + functions; vitest run; build bez przełącznika i z VITE_MM_HOME_SEO=1; build bazy
# (3e208e2 = integracja przed MIX-1269; r3 też na tej bazie) i porównanie HTML; próba w przeglądarce on/off; mutanty.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1269/full
D=.bieg/m1269/dist-$(date +%s)
mkdir -p "$OUT" "$D"
BASE_SHA=3e208e2
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
RC=0
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; [ $rc -ne 0 ] && RC=1; return 0; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log"; }
tests_line() { clean "$1" | grep -aE '^ *(Test Files|Tests) ' | sed "s/^/  $1: /"; }
fails() { clean "$1" | grep -aE '^ *(FAIL|×) ' | head -20 | sed "s/^/  $1 fail: /"; }
restore_generated() { git checkout -- public/sitemap.xml 2>/dev/null; git status --porcelain | grep -v '^?? ' | sed 's/^/  dirty: /'; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
restore_generated
T="tests/seo/homeSeo.test.tsx tests/scripts/ciWorkflow.test.ts"
CHANGED="config/flags.ts data/content/pages/homeSeo.ts components/pages/Home.tsx components/sections/Hero.tsx components/sections/Services.tsx tests/seo/homeSeo.test.tsx tests/helpers/homeSeoPage.tsx tests/scripts/ciWorkflow.test.ts .github/workflows/ci.yml docs/tresci/MIX-1269.md"
# shellcheck disable=SC2086
step related npx vitest related config/flags.ts data/content/pages/homeSeo.ts components/pages/Home.tsx components/sections/Hero.tsx components/sections/Services.tsx $T --run --maxWorkers=2
tests_line related; fails related
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
clean eslint | grep -aE 'error|warning|problem|^/' | head -20 | sed 's/^/  eslint: /'
# shellcheck disable=SC2086
step prettier npx prettier --check $CHANGED
clean prettier | tail -3 | sed 's/^/  prettier: /'
step tsc-root npx tsc --noEmit -p tsconfig.json
echo "  tsc-root errors: $(grep -c 'error TS' "$OUT/tsc-root.log")"
grep -a 'error TS' "$OUT/tsc-root.log" | head -10 | sed 's/^/  tsc-root: /'
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
echo "  tsc-functions errors: $(grep -c 'error TS' "$OUT/tsc-functions.log")"
step vitest npx vitest run --maxWorkers=2
tests_line vitest; fails vitest
# Build bez przełącznika (jak produkcja) i z przełącznikiem (jak Preview).
step build-off env VITE_MM_HOME_SEO= npm run build
clean build-off | grep -aE 'Size|error|Error' | head -4 | sed 's/^/  build-off: /'
cp -r dist "$D/off"; restore_generated
step build-on env VITE_MM_HOME_SEO=1 npm run build
clean build-on | grep -aE 'Size|error|Error' | head -4 | sed 's/^/  build-on: /'
cp -r dist "$D/on"; restore_generated
# Build bazy (kod sprzed karty) w osobnym katalogu, te same zależności.
B=$D/base-src
mkdir -p "$B"
# Stacja nie ma historii (migawka), więc baza = to drzewo z cofniętą łatką zmian produktu
# (.bieg/m1269/baza-odwrotnie.patch = git diff $BASE_SHA..HEAD -- components config data .github).
tar --exclude=./node_modules --exclude=./.bieg --exclude=./dist --exclude=./.git --exclude=./tests -cf - . | tar -x -C "$B"
git apply -R --directory="$B" .bieg/m1269/baza-odwrotnie.patch > "$OUT/baza-patch.log" 2>&1; echo "STEP baza-patch rc=$?"
echo "  baza: łatka cofnięta, pliki flagi w bazie: $(grep -c VITE_MM_HOME_SEO "$B/config/flags.ts" "$B/.github/workflows/ci.yml" | tr '\n' ' ')"
ln -s "$PWD/node_modules" "$B/node_modules"
( cd "$B" && env VITE_MM_HOME_SEO= npm run build ) > "$OUT/build-base.log" 2>&1; echo "STEP build-base rc=$?"
echo "--- porównanie HTML: baza ($BASE_SHA) vs off (HEAD bez przełącznika)"
node .bieg/m1269/porownaj.mjs "$B/dist" "$D/off" > "$OUT/porownaj.log" 2>&1; prc=$?
cat "$OUT/porownaj.log" | head -20; echo "STEP porownaj rc=$prc"; [ $prc -ne 0 ] && RC=1
echo "--- informacyjnie: off vs on (te same artykuły CMS w obu? różnica tylko w index.html?)"
node .bieg/m1269/porownaj.mjs "$D/off" "$D/on" 2>&1 | head -8
echo "--- informacyjnie: off vs drugi build off (powtarzalność artykułów)"
step build-off2 env VITE_MM_HOME_SEO= npm run build
cp -r dist "$D/off2"; restore_generated
node .bieg/m1269/porownaj.mjs "$D/off" "$D/off2" 2>&1 | head -8
echo "--- próba on/off"
showp() { tail -1 "$OUT/$1.log" | cut -c1-4000; }
step probe-off node .bieg/m1269/probe.mjs "$D/off" "$OUT" off
head -1 "$OUT/probe-off.log"; showp probe-off
step probe-on node .bieg/m1269/probe.mjs "$D/on" "$OUT" on
head -1 "$OUT/probe-on.log"; showp probe-on
echo "--- mutanty"
bash .bieg/m1269/mut.sh
restore_generated
echo "FULL RC=$RC"
exit $RC
