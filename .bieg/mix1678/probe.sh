#!/usr/bin/env bash
# MIX-1678: zrzuty przed/po + pomiary kafelkow + axe. Budowa vite (bez prerenderu) dwa razy: wersja przed (kopia
# .bieg/mix1678/GoogleAdsCalculator.before.tsx = c57bf6a) i po (HEAD), potem dwa serwery podgladu. Z korzenia repo.
set -u
OUT=.bieg/r/mix1678p; mkdir -p "$OUT" .bieg/mix1678/out; : > "$OUT/summary.txt"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
F=components/features/marketing/GoogleAdsCalculator.tsx
echo "HEAD=$(git rev-parse HEAD)" | tee -a "$OUT/summary.txt"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?" | tee -a "$OUT/summary.txt"
cp "$F" "$OUT/after.tsx"
npx vite build --outDir .bieg/r/dist-after > "$OUT/build-after.log" 2>&1; echo "build-after rc=$?" | tee -a "$OUT/summary.txt"
cp .bieg/mix1678/GoogleAdsCalculator.before.tsx "$F"
npx vite build --outDir .bieg/r/dist-before > "$OUT/build-before.log" 2>&1; echo "build-before rc=$?" | tee -a "$OUT/summary.txt"
cp "$OUT/after.tsx" "$F"
node node_modules/vite/bin/vite.js preview --outDir .bieg/r/dist-after --port 4412 --strictPort --host 127.0.0.1 > "$OUT/preview-after.log" 2>&1 &
P1=$!
node node_modules/vite/bin/vite.js preview --outDir .bieg/r/dist-before --port 4411 --strictPort --host 127.0.0.1 > "$OUT/preview-before.log" 2>&1 &
P2=$!
for p in 4411 4412; do for _ in $(seq 1 40); do curl -fsS -o /dev/null "http://127.0.0.1:$p/" && break; sleep 1; done; done
node .bieg/mix1678/shots.mjs 4412 4411 > "$OUT/shots.log" 2>&1; echo "shots rc=$?" | tee -a "$OUT/summary.txt"
kill "$P1" "$P2" 2>/dev/null
grep -avE '^BIEG:PNG ' "$OUT/shots.log" | cut -c1-600 | tee -a "$OUT/summary.txt"
grep -aE '^BIEG:PNG ' "$OUT/shots.log"
echo "porcelain: $(git status --porcelain | grep -v '^?? .bieg/' | wc -l)" | tee -a "$OUT/summary.txt"
