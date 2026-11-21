#!/bin/bash
# MIX-1838: pelna kontrola + mutanty + build jak produkcja (7 przelacznikow = 1, wycena pusta). Uruchamiac z korzenia worktree.
echo "HEAD=$(git rev-parse HEAD) tracked_changes=$(git status --porcelain --untracked-files=no | wc -l) node=$(node -v)"
[ -d node_modules ] || { npm install --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1; echo "STEP install rc=$?"; git checkout -- package-lock.json 2>/dev/null; }
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production   # publiczne (package.json)
LOGD=node_modules/.mix1838-logi; mkdir -p "$LOGD"; rc=0
CI=.github/workflows/ci.yml
T=tests/scripts/ciWorkflow.test.ts
A=tests/components/aiSection.test.tsx
CEL="$T $A tests/scripts/proportionsGate.test.ts tests/seo/llmsTxt.test.ts"

n=0; for f in $T $A $CI; do npx prettier --check "$f" > /dev/null 2>&1 || { echo "PRETTIER blad: $f"; n=$((n+1)); }; done; echo "STEP prettier zle_pliki=$n"; [ $n -eq 0 ] || rc=1
npx tsc -p functions/tsconfig.json --noEmit > "$LOGD/tsc-f.log" 2>&1; r=$?; echo "STEP tsc-functions rc=$r errors=$(grep -c 'error TS' "$LOGD/tsc-f.log")"; [ $r -eq 0 ] || rc=1
npx tsc -p tsconfig.json --noEmit > "$LOGD/tsc.log" 2>&1; r=$?; echo "STEP tsc rc=$r errors=$(grep -c 'error TS' "$LOGD/tsc.log")"; grep 'error TS' "$LOGD/tsc.log" | head -5; [ $r -eq 0 ] || rc=1
npx eslint . --report-unused-disable-directives --max-warnings 0 > "$LOGD/eslint.log" 2>&1; r=$?; echo "STEP eslint rc=$r lines=$(wc -l < "$LOGD/eslint.log")"; head -20 "$LOGD/eslint.log"; [ $r -eq 0 ] || rc=1
npx vitest run $CEL > "$LOGD/cel.log" 2>&1; r=$?; echo "STEP vitest-celowane rc=$r"; grep -E "Tests |Test Files" "$LOGD/cel.log"; grep -E "FAIL|×" "$LOGD/cel.log" | head -10; [ $r -eq 0 ] || rc=1
npx vitest run --maxWorkers=2 > "$LOGD/vitest.log" 2>&1; r=$?; echo "STEP vitest rc=$r"; grep -E "Tests |Test Files" "$LOGD/vitest.log"; grep -E "FAIL|×" "$LOGD/vitest.log" | head -10; [ $r -eq 0 ] || rc=1

zabite=0; przezyly=0
mutant() { # id plik sed-wyrazenie test opis
  cp "$2" "$LOGD/kopia"; sed -i "$3" "$2"
  if cmp -s "$2" "$LOGD/kopia"; then echo "MUTANT $1 NIE_ZMIENIL_PLIKU ($5)"; przezyly=$((przezyly+1)); rc=1; git checkout -- "$2"; return; fi
  npx vitest run $4 > "$LOGD/m-$1.log" 2>&1; local r=$?
  if [ $r -ne 0 ]; then echo "MUTANT $1 zabity ($5) [$(grep -E 'Tests ' "$LOGD/m-$1.log" | head -1)]"; zabite=$((zabite+1)); else echo "MUTANT $1 PRZEZYL ($5)"; przezyly=$((przezyly+1)); rc=1; fi
  git checkout -- "$2"
}
for F in POWIAZANE COOKIE_BANNER_STATIC TESTIMONIALS RZESZOW_SEKCJE AI_SECTION; do
  mutant "t-$F" $T "/^  'VITE_MM_$F', \/\/ MIX-/d" "$T" "$F usuniety z WLACZONE_NA_PROD"
  mutant "c-$F" $CI "s#^          VITE_MM_$F: '1'#          VITE_MM_$F: \${{ steps.target.outputs.target == 'preview' \&\& '1' || '' }}#" "$T" "$F w ci.yml z powrotem tylko Preview"
done
for F in LIVE_PRICE_BAR CONFIG_PREVIEW CONFIG_LINK; do
  mutant "w-$F" $CI "s#^          VITE_MM_$F: .*#          VITE_MM_$F: '1'#" "$T" "$F = 1 na produkcji"
done
mutant m-ai-test $CI "s#^          VITE_MM_AI_SECTION: '1'#          VITE_MM_AI_SECTION: ''#" "$A" "AI_SECTION pusty (test aiSection)"
echo "STEP mutanty zabite=$zabite przezyly=$przezyly tracked_changes=$(git status --porcelain --untracked-files=no | wc -l)"

# Build jak produkcja: 7 przelacznikow = 1, wycena pusta.
for v in VITE_MM_CONFIG_LINK VITE_MM_CONFIG_PREVIEW VITE_MM_LIVE_PRICE_BAR; do unset $v; done
export VITE_MM_MOBILE_MENU_B=1 VITE_MM_VIEW_TRANSITIONS=1 VITE_MM_POWIAZANE=1 VITE_MM_COOKIE_BANNER_STATIC=1 VITE_MM_TESTIMONIALS=1 VITE_MM_RZESZOW_SEKCJE=1 VITE_MM_AI_SECTION=1
echo "ENV_BUILD $(env | grep -E '^VITE_MM_' | sort | tr '\n' ' ')"
npm run build > "$LOGD/build.log" 2>&1; r=$?; echo "STEP build rc=$r"; [ $r -eq 0 ] || { rc=1; tail -20 "$LOGD/build.log"; }
echo "BUILD prerender_ok=$(grep -c 'Prerendered & Optimized' "$LOGD/build.log") bledy_prerender=$(grep -ciE 'prerender.*(error|fail|blad)|error:' "$LOGD/build.log") html=$(find dist -name index.html | wc -l)"
ai=$(grep -c 'id="ai-systems"' dist/index.html); rz=$(grep -c 'data-testid="local-rzeszow"' dist/marketing/google-ads/index.html)
pw_all=$(grep -l 'data-powiazane' $(find dist -name index.html) 2>/dev/null | wc -l)
pw_port=$(grep -l 'data-powiazane' $(find dist/portfolio -mindepth 2 -name index.html 2>/dev/null) 2>/dev/null | wc -l)
port=$(find dist/portfolio -mindepth 2 -name index.html 2>/dev/null | wc -l)
echo "DIST ai_w_/=$ai rzeszow_w_google-ads=$rz powiazane_w_html_wszystkie=$pw_all powiazane_na_portfolio=$pw_port stron_portfolio=$port"
grep -l 'data-powiazane' $(find dist -name index.html) 2>/dev/null | head -5
[ "$ai" -gt 0 ] && [ "$rz" -gt 0 ] || rc=1
git checkout -- public/sitemap.xml 2>/dev/null
echo "koniec tracked_changes=$(git status --porcelain --untracked-files=no | wc -l) rc=$rc"
exit $rc
