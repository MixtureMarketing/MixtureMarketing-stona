#!/usr/bin/env bash
# MIX-1711: ENTER vs BACK smoothness (.bieg/mix1711/smooth.mjs) at 1280 and 375, 8 runs each, on this tree
# (build with VITE_MM_VIEW_TRANSITIONS=1). From the repo root on a fresh tree. Result on stdout (run log).
# Exit 0 only when both widths are measured and every MIX-1711 criterion is OK (smooth.mjs rc 0 at both).
set -u
OUT=.bieg/r/mix1711s; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
[ -e dist-sm ] && { echo "dist-sm exists: tree not fresh, stop"; exit 2; }
VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build.log" 2>&1; rc=$?; echo "build rc=$rc"
[ $rc -eq 0 ] || { tail -n 30 "$OUT/build.log"; exit 2; }
mv dist dist-sm
FAILS=0
for vp in 1280 375; do
  SMOOTH_VP=$vp node .bieg/mix1711/smooth.mjs dist-sm "$OUT" > "$OUT/smooth-$vp.txt" 2>&1; rc=$?
  echo "smooth $vp rc=$rc"; [ $rc -eq 0 ] || FAILS=$((FAILS + 1))
  grep -aE '^(RUN|TABLE|MEDIAN|CRIT|INFO|ERROR|SMOOTH)' "$OUT/smooth-$vp.txt" | cut -c1-260
done
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | grep -v '^?? dist-' | wc -l)"
echo "SMOOTH-MIX1711 failed widths=$FAILS"
echo "### end"
[ "$FAILS" -eq 0 ]
