#!/usr/bin/env bash
# MIX-1280 b: pelna kontrola na zatwierdzonym drzewie (npm ci, eslint, prettier, tsc root, tsc functions, vitest run,
# build z flagami Preview, serwer podgladu + zrzuty/axe). Z korzenia repo, sciezki wzgledne. Wzor: .bieg/mix1665/full.sh.
set -u
OUT=.bieg/r/mix1280b; mkdir -p "$OUT" .bieg/mix1280b/out; : > "$OUT/summary.txt"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)" | tee -a "$OUT/summary.txt"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "$n rc=$rc" | tee -a "$OUT/summary.txt"; if [ $rc -ne 0 ]; then sed "s/\x1b\[[0-9;]*m//g" "$OUT/$n.log" | tail -n 40 | cut -c1-220 | tee -a "$OUT/summary.txt"; fi; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
step prettier npx prettier --check data/content/articles/ai-systems.ts components/articles/AiSystemsArticle.tsx components/articles/visuals/AiSystemsVisuals.tsx tests/seo/aiSystemsArticleVisuals.test.tsx
step tsc-root npx tsc --noEmit -p tsconfig.json
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests " | tee -a "$OUT/summary.txt"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE " FAIL |AssertionError" | head -n 20 | tee -a "$OUT/summary.txt"
VITE_MM_PREONBOARD_KEY= VITE_STRIPE_PUBLISHABLE_KEY= VITE_MM_MOBILE_MENU_B=1 VITE_MM_LIVE_PRICE_BAR=1 \
  VITE_MM_VIEW_TRANSITIONS=1 VITE_MM_TESTIMONIALS=1 VITE_MM_COOKIE_BANNER_STATIC=1 step build npm run build
node node_modules/vite/bin/vite.js preview --port 4401 --strictPort --host 127.0.0.1 > "$OUT/preview.log" 2>&1 &
PID=$!
for _ in $(seq 1 40); do curl -fsS -o /dev/null "http://127.0.0.1:4401/" && break; sleep 1; done
node .bieg/mix1280b/shots.mjs 4401 > "$OUT/shots.log" 2>&1; echo "shots rc=$?" | tee -a "$OUT/summary.txt"
kill "$PID" 2>/dev/null
grep -avE '^BIEG:PNG ' "$OUT/shots.log" | tee -a "$OUT/summary.txt"
grep -aE '^BIEG:PNG ' "$OUT/shots.log"
echo "porcelain: $(git status --porcelain | grep -v '^?? .bieg/' | wc -l)" | tee -a "$OUT/summary.txt"
