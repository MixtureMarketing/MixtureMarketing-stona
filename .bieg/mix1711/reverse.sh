#!/usr/bin/env bash
# MIX-1711 r2: BACK = ENTER played backwards (.bieg/mix1711/reverse.mjs) at 1280 and 375 on this tree
# (build with VITE_MM_VIEW_TRANSITIONS=1). From the repo root on a fresh tree. Result on stdout (run log).
# Artifacts (strip PNG, video WebM, JSON) land in .bieg/mix1711/out/ and are also printed as "B64 <file> <chunk>"
# lines with "SHA256 <file> <hash>", so .bieg/mix1711/wyciagnij.sh <log> rebuilds them on the server.
# Exit 0 only when both widths are measured and pass (reverse.mjs rc 0 at both).
set -u
OUT=.bieg/mix1711/out; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
[ -e dist-rv ] && { echo "dist-rv exists: tree not fresh, stop"; exit 2; }
VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build.log" 2>&1; rc=$?; echo "build rc=$rc"
[ $rc -eq 0 ] || { tail -n 30 "$OUT/build.log"; exit 2; }
mv dist dist-rv
FAILS=0
for vp in 1280 375; do
  REV_VP=$vp node .bieg/mix1711/reverse.mjs dist-rv "$OUT" > "$OUT/reverse-$vp.txt" 2>&1; rc=$?
  echo "reverse $vp rc=$rc"; [ $rc -eq 0 ] || FAILS=$((FAILS + 1))
  grep -aE '^(REV|FAIL|STRIP|VIDEO|ERROR)' "$OUT/reverse-$vp.txt" | cut -c1-400
  grep -aE '^STEP' "$OUT/reverse-$vp.txt" | grep -a 'realizacja-zdjecie' | cut -c1-400
done
for f in strip-1280.png strip-375.png video-1280.webm video-375.webm reverse-1280.json reverse-375.json; do
  [ -f "$OUT/$f" ] || { echo "MISSING $f"; continue; }
  echo "SHA256 $f $(sha256sum "$OUT/$f" | cut -d' ' -f1) bytes=$(wc -c < "$OUT/$f")"
  base64 -w 200 "$OUT/$f" | sed "s/^/B64 $f /"
done
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | grep -v '^?? dist-' | wc -l)"
echo "REVERSE-MIX1711 failed widths=$FAILS"
echo "### end"
[ "$FAILS" -eq 0 ]
