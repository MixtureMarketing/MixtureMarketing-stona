#!/usr/bin/env bash
# MIX-1317 full check (wzór .bieg/m1269/full.sh): npm ci; vitest related; eslint; prettier (pliki
# zmiany); tsc root + functions; vitest run; build bez przełącznika, z VITE_MM_PROCESS_TIMELINE=1
# i build bazy (integracja bc51ab2 = to drzewo z cofniętą łatką); porównanie HTML 6 podstron baza/off;
# próba w przeglądarce on/off; Lighthouse mobile baza vs on (3 przebiegi); mutanty.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1317/full
D=.bieg/m1317/dist-$(date +%s)
mkdir -p "$OUT" "$D"
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
CHANGED="components/common/ProcessTimeline.tsx components/features/design/BrandProcess.tsx components/features/web-development/CustomAppStart.tsx components/pages/AiSystemsApps.tsx components/pages/GoogleAds.tsx components/pages/MarketingSeo.tsx components/pages/SeoRzeszow.tsx config/flags.ts index.css tests/helpers/processPages.tsx tests/process/processTimeline.test.tsx tests/scripts/ciWorkflow.test.ts .github/workflows/ci.yml tests/fixtures/mix1317/process-flag-off.json"
TSX=$(echo $CHANGED | tr ' ' '\n' | grep -E '\.tsx?$' | tr '\n' ' ')
# shellcheck disable=SC2086
step related npx vitest related $TSX --run --maxWorkers=2
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
step build-off env VITE_MM_PROCESS_TIMELINE= npm run build
clean build-off | grep -aE 'Size|error|Error' | head -4 | sed 's/^/  build-off: /'
cp -r dist "$D/off"; restore_generated
step build-on env VITE_MM_PROCESS_TIMELINE=1 npm run build
clean build-on | grep -aE 'Size|error|Error' | head -4 | sed 's/^/  build-on: /'
cp -r dist "$D/on"; restore_generated
# Baza = to drzewo z cofniętą łatką zmian produktu (stacja nie ma historii; łatka = git diff bc51ab2..HEAD).
B=$D/base-src
mkdir -p "$B"
tar --exclude=./node_modules --exclude=./.bieg --exclude=./dist --exclude=./.git --exclude=./tests -cf - . | tar -x -C "$B"
git apply -R --directory="$B" .bieg/m1317/baza-odwrotnie.patch > "$OUT/baza-patch.log" 2>&1
echo "STEP baza-patch rc=$? flaga w bazie: $(grep -c VITE_MM_PROCESS_TIMELINE "$B/config/flags.ts") ProcessTimeline w bazie: $(ls "$B/components/common/ProcessTimeline.tsx" 2>/dev/null | wc -l)"
ln -s "$PWD/node_modules" "$B/node_modules"
( cd "$B" && env VITE_MM_PROCESS_TIMELINE= npm run build ) > "$OUT/build-base.log" 2>&1; brc=$?
echo "STEP build-base rc=$brc"; [ $brc -ne 0 ] && RC=1
echo "--- porównanie HTML: baza (bc51ab2) vs off (HEAD bez przełącznika)"
node .bieg/m1317/porownaj.mjs "$B/dist" "$D/off" > "$OUT/porownaj.log" 2>&1; prc=$?
head -20 "$OUT/porownaj.log"; echo "STEP porownaj rc=$prc"; [ $prc -ne 0 ] && RC=1
echo "--- informacyjnie: off vs on"
node .bieg/m1317/porownaj.mjs "$D/off" "$D/on" 2>&1 | tail -1
echo "--- rozmiar CSS (gzip) baza / off / on"
for x in "$B/dist" "$D/off" "$D/on"; do f=$(ls "$x"/assets/index-*.css | head -1); echo "  $x: $(gzip -9c "$f" | wc -c) B gzip, $(wc -c < "$f") B surowo"; done
echo "--- próba on/off"
step probe-off node .bieg/m1317/probe.mjs "$D/off" "$OUT" off 0
grep -a '^PROBE\|FAIL' "$OUT/probe-off.log" | head -20
step probe-on node .bieg/m1317/probe.mjs "$D/on" "$OUT" on 1
grep -a '^PROBE\|FAIL' "$OUT/probe-on.log" | head -40
grep -a '^WYNIK' "$OUT/probe-on.log" | cut -c1-14000
grep -a '^WYNIK' "$OUT/probe-off.log" | cut -c1-6000
sed -n '/^ZRZUT-START/,/^ZRZUT-KONIEC/p' "$OUT/probe-on.log"
echo "--- Lighthouse mobile baza vs on"
CHROME_PATH=$(node -e "import('puppeteer').then(async (p) => console.log(await p.default.executablePath()))")
export CHROME_PATH
LH=12.8.2
npx --yes "lighthouse@$LH" --version
(cd "$B" && exec node node_modules/vite/bin/vite.js preview --port 4417 --strictPort --host 127.0.0.1) > "$OUT/prev-base.log" 2>&1 &
P1=$!
rm -rf dist; cp -r "$D/on" dist
(exec node node_modules/vite/bin/vite.js preview --port 4418 --strictPort --host 127.0.0.1) > "$OUT/prev-on.log" 2>&1 &
P2=$!
for port in 4417 4418; do for _ in $(seq 1 60); do curl -fsS -o /dev/null "http://127.0.0.1:$port/" && break; sleep 1; done; done
mkdir -p "$OUT/lh/base" "$OUT/lh/on"
for p in /marketing/google-ads/ /marketing/seo/ /web-development/systemy-ai-aplikacje/ /web-development/custom-app/ /agencja-seo-rzeszow/ /design/branding/; do
  slug=$(echo "$p" | tr '/' '-' | sed 's/^-//;s/-$//')
  for n in 1 2 3; do
    for m in base on; do
      port=4417; [ $m = on ] && port=4418
      npx --yes "lighthouse@$LH" "http://127.0.0.1:$port$p" --output=json --output-path="$OUT/lh/$m/$slug-$n.json" --quiet \
        --only-categories=performance --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
        --max-wait-for-load=60000 2> "$OUT/lh/$m/$slug-$n.err"
      echo "lh $m $slug $n rc $?"
    done
  done
done
kill "$P1" "$P2" 2> /dev/null
node .bieg/m1317/lh.mjs "$OUT/lh" > "$OUT/lh.log" 2>&1; lrc=$?
cat "$OUT/lh.log"; echo "STEP lighthouse rc=$lrc"; [ $lrc -ne 0 ] && RC=1
rm -rf dist
restore_generated
echo "--- mutanty"
bash .bieg/m1317/mut.sh; mrc=$?
echo "STEP mutanty rc=$mrc"; [ $mrc -ne 0 ] && RC=1
restore_generated
echo "FULL RC=$RC"
exit $RC
