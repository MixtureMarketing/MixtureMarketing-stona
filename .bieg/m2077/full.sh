#!/usr/bin/env bash
# MIX-2077: jeden bieg na puli, z korzenia repo (wzór .bieg/m2054/full.sh): npm ci, prettier zmienionych,
# testy celowane, pełna kontrola (eslint, tsc root, tsc functions, vitest run, npm run build z
# przełącznikami jak build produkcji w ci.yml, MM_DEPLOY_TARGET=prod), sprawdzenie dist (/cennik/ w
# prerenderze, sitemap, llms.txt, brak 301 /cennik w dist/_redirects, linki href="/cennik/"), mutanty.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
D=.bieg/m2077
OUT=$D/full
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; return 0; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log"; }
tests_line() { clean "$1" | grep -aE '^ *(Test Files|Tests) ' | sed "s/^/  $1: /"; }
fails() { clean "$1" | grep -aE '^ *(FAIL|×) ' | head -20 | sed "s/^/  $1 fail: /"; }
restore_generated() { git checkout -- public/sitemap.xml public/llms.txt 2>/dev/null; git status --porcelain | grep -v '^?? ' | sed 's/^/  dirty: /'; }
CHANGED="tests/scripts/ciWorkflow.test.ts .github/workflows/ci.yml"

step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
restore_generated
# shellcheck disable=SC2086
step prettier npx prettier --check $CHANGED
clean prettier | tail -3 | sed 's/^/  prettier: /'
step related npx vitest run tests/scripts/ciWorkflow.test.ts tests/seo/cennikBuild.test.ts tests/seo/cennikPage.test.tsx tests/seo/cennikArticles.test.tsx tests/components/caseStudySimilarCta.test.tsx
tests_line related; fails related
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
clean eslint | grep -aE 'error|warning|problem|^/' | head -20 | sed 's/^/  eslint: /'
step tsc-root npx tsc --noEmit -p tsconfig.json
echo "  tsc-root errors: $(grep -c 'error TS' "$OUT/tsc-root.log")"
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
echo "  tsc-functions errors: $(grep -c 'error TS' "$OUT/tsc-functions.log")"
step vitest npx vitest run --maxWorkers=2
tests_line vitest; fails vitest
# Build produkcji jak w ci.yml po zmianie (cel prod; publiczny klucz strony Turnstile z ci.yml): stale 1 + VITE_MM_CENNIK=1, reszta tylko-Preview pusta.
step build env MM_DEPLOY_TARGET=prod VITE_TURNSTILE_SITE_KEY=0x4AAAAAACYHLgkgk3FJUj06 VITE_MM_CENNIK=1 VITE_MM_MOBILE_MENU_B=1 VITE_MM_VIEW_TRANSITIONS=1 \
  VITE_MM_AI_SECTION=1 VITE_MM_COOKIE_BANNER_STATIC=1 VITE_MM_POWIAZANE=1 VITE_MM_RZESZOW_SEKCJE=1 \
  VITE_MM_TESTIMONIALS=1 VITE_MM_PORTFOLIO_VIDEO=1 npm run build
clean build | grep -aE 'cennik:|Size|error|Error' | head -8 | sed 's/^/  build: /'
echo "DIST cennik/index.html: $( [ -s dist/cennik/index.html ] && echo jest || echo BRAK )"
echo "DIST cennik canonical/title: $(grep -aoE '<title>[^<]*</title>' dist/cennik/index.html 2>/dev/null | head -1)"
echo "DIST sitemap /cennik/: $(grep -c '/cennik/</loc>' dist/sitemap.xml 2>/dev/null)"
echo "DIST llms.txt /cennik/: $(grep -c '/cennik/' dist/llms.txt 2>/dev/null)"
echo "DIST _redirects reguly /cennik: $(grep -cE '^/cennik/? ' dist/_redirects 2>/dev/null)"
echo "REPO public/_redirects reguly /cennik: $(grep -cE '^/cennik/? ' public/_redirects)"
echo "DIST strony z href=\"/cennik/\": $(grep -rlF 'href="/cennik/"' dist --include=index.html | wc -l)"
grep -rlF 'href="/cennik/"' dist --include=index.html | head -5 | sed 's/^/  link: /'
restore_generated
step mutanty bash $D/mut.sh
clean mutanty
echo "KONIEC"
