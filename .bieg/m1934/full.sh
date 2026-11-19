#!/usr/bin/env bash
# MIX-1934 pełna kontrola (jeden bieg na stacji/chmurze, ścieżki względne): npm ci; eslint; prettier
# na zmienionych; tsc root i functions; vitest pełny; build produkcji jak CI (cel prod, klucz
# produkcyjny) + strażnik wgrania na dist; build Preview (cel preview, klucz testowy) + strażnik;
# formy ataku na prawdziwym buildzie (klucz testowy dla prod = build przerwany); mutanty na końcu.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1934/full; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
PROD=0x4AAAAAACYHLgkgk3FJUj06
TEST=1x00000000000000000000AA
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; return 0; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log"; }
CH="$(cat .bieg/m1934/zmienione.txt)"
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
git checkout -- public/sitemap.xml 2>/dev/null
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
clean eslint | grep -aE 'error|warning|^/' | head -20 | sed 's/^/  eslint: /'
# shellcheck disable=SC2086
step prettier npx prettier --check $(echo $CH | tr ' ' '\n' | grep -E '\.(ts|tsx|mjs|yml)$')
clean prettier | tail -2 | sed 's/^/  prettier: /'
step tsc-root npx tsc --noEmit -p tsconfig.json
echo "  tsc-root errors: $(grep -c 'error TS' "$OUT/tsc-root.log")"
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
echo "  tsc-functions errors: $(grep -c 'error TS' "$OUT/tsc-functions.log")"
step vitest npx vitest run --maxWorkers=2
clean vitest | grep -aE '^ *(Test Files|Tests) ' | sed 's/^/  vitest: /'
clean vitest | grep -aE '^ *(FAIL|×) ' | head -20 | sed 's/^/  vitest fail: /'

# Build produkcji jak w CI (cel prod), potem strażnik wgrania na tym dist.
step build env MM_DEPLOY_TARGET=prod VITE_TURNSTILE_SITE_KEY=$PROD npm run build
clean build | grep -aE 'Size|error|ODMOWA' | head -4 | sed 's/^/  build: /'
git checkout -- public/sitemap.xml 2>/dev/null
echo "  dist prod: pliki z kluczem produkcyjnym=$(grep -rl "$PROD" dist | wc -l), z kluczem testowym (1x/2x/3x)=$(grep -rlE '(^|[^0-9A-Za-z])[1-3][xX]0{20}[0-9A-Za-z]{2}' dist | wc -l), html=$(find dist -name '*.html' | wc -l)"
printf '{"success":true,"result":{"production_branch":"main"}}' > "$OUT/project-main.json"
printf '{"success":true,"result":{"production_branch":"dev"}}' > "$OUT/project-dev.json"
step guard-prod node scripts/ci-turnstile-guard.mjs deploy --target prod --branch main --project-json "$OUT/project-main.json" --dist dist
clean guard-prod | sed 's/^/  guard-prod: /'

# Build Preview (sam vite build do osobnego katalogu): klucz testowy w bundlu.
step build-preview env MM_DEPLOY_TARGET=preview VITE_TURNSTILE_SITE_KEY=$TEST npx vite build --outDir .bieg/m1934/dist-preview
echo "  dist preview: pliki z kluczem testowym=$(grep -rl "$TEST" .bieg/m1934/dist-preview | wc -l)"
step guard-preview node scripts/ci-turnstile-guard.mjs deploy --target preview --branch dev --project-json "$OUT/project-main.json" --dist .bieg/m1934/dist-preview
clean guard-preview | sed 's/^/  guard-preview: /'
# Formy ataku na prawdziwych artefaktach (oczekiwane rc 1):
step atak-preview-dist-do-prod node scripts/ci-turnstile-guard.mjs deploy --target prod --branch main --project-json "$OUT/project-main.json" --dist .bieg/m1934/dist-preview
clean atak-preview-dist-do-prod | sed 's/^/  atak-preview-dist-do-prod: /'
step atak-dev-do-production node scripts/ci-turnstile-guard.mjs deploy --target preview --branch dev --project-json "$OUT/project-dev.json" --dist .bieg/m1934/dist-preview
clean atak-dev-do-production | sed 's/^/  atak-dev-do-production: /'
step atak-build-prod-klucz-testowy env MM_DEPLOY_TARGET=prod VITE_TURNSTILE_SITE_KEY=$TEST npx vite build --outDir .bieg/m1934/dist-atak
clean atak-build-prod-klucz-testowy | grep -a 'ODMOWA' | head -1 | cut -c1-200 | sed 's/^/  atak-build: /'
step atak-build-pusty-klucz env MM_DEPLOY_TARGET=prod VITE_TURNSTILE_SITE_KEY= npx vite build --outDir .bieg/m1934/dist-atak
clean atak-build-pusty-klucz | grep -a 'ODMOWA' | head -1 | cut -c1-200 | sed 's/^/  atak-build-pusty: /'
git checkout -- public/sitemap.xml 2>/dev/null

bash .bieg/m1934/mut.sh
