#!/usr/bin/env bash
# MIX-1745: BACK frames (.bieg/mix1745/frames.mjs) of two builds at 375 and 1280, compared (.bieg/mix1745/compare.mjs).
# Usage: bash .bieg/mix1745/frames.sh <expect: same|diff|any>
#   builds: old = this tree with the grid class of 3febcb0 (.bieg/mix1741/variant.mjs bug; the only app-code change
#           3febcb0..9067bc4), head = this tree. expect: head against old at both widths (same = compare rc 0).
# PNG frames and JSON land in .bieg/r/mix1745/ and are printed as "B64 <file> <chunk>" lines with
# "SHA256 <file> <hash>" (rebuild: .bieg/mix1745/wyciagnij.sh <log> <dir>).
# Exit 0 only when both builds are 0, every probe measured (rc 0) and every comparison meets expect (fail-closed).
set -u
EXPECT=${1:?expect same|diff|any}
case $EXPECT in same|diff|any) ;; *) echo "expect $EXPECT not allowed"; exit 2 ;; esac
WIDTHS=${FR_WIDTHS:-375 1280}   # FR_WIDTHS: subset of 375 412 1280 (412 = phone-like, DPR 2.625)
for w in $WIDTHS; do case $w in 375|412|1280) ;; *) echo "width $w not allowed"; exit 2 ;; esac; done
OUT=.bieg/r/mix1745; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) expect=$EXPECT"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
for d in dist dist-old dist-head; do [ -e "$d" ] && { echo "$d exists: tree not fresh, stop"; exit 2; }; done
FAILS=0
bad() { echo "FAILCHECK $*"; FAILS=$((FAILS + 1)); }
GRID=components/features/portfolio/PortfolioGrid.tsx
cp "$GRID" "$OUT/grid.orig"
for v in old head; do
  cp "$OUT/grid.orig" "$GRID"
  if [ $v = old ]; then node .bieg/mix1741/variant.mjs bug || bad "old: grid class not applied"; fi
  echo "build $v: $(grep -o '\[contain-intrinsic-size:[^]]*\]' "$GRID" | tr '\n' ' ')"
  VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build-$v.log" 2>&1; rc=$?; echo "build-$v rc=$rc"
  [ $rc -eq 0 ] || { bad "build-$v rc=$rc"; tail -n 20 "$OUT/build-$v.log"; continue; }
  mv dist "dist-$v"
done
cp "$OUT/grid.orig" "$GRID"
for vp in $WIDTHS; do
  for v in old head; do
    [ -d "dist-$v" ] || continue
    FR_VP=$vp FR_TAG=$v node .bieg/mix1745/frames.mjs "dist-$v" "$OUT" > "$OUT/fr-$v-$vp.txt" 2>&1; prc=$?
    grep -aE '^(CARD|RTSUM|STEP|REST|ERROR|FRAMES)' "$OUT/fr-$v-$vp.txt" | cut -c1-300
    grep -aE '^RT ' "$OUT/fr-$v-$vp.txt" | cut -c1-300 | head -n 120
    echo "probe $v $vp rc=$prc"; [ $prc -eq 0 ] || bad "probe $v $vp rc=$prc"
  done
  node .bieg/mix1745/compare.mjs "$OUT/frames-$vp-old.json" "$OUT/frames-$vp-head.json"; crc=$?
  echo "compare $vp rc=$crc expect=$EXPECT"
  case "$EXPECT:$crc" in same:0|diff:1|any:0|any:1) ;; *) bad "compare $vp rc=$crc expect=$EXPECT" ;; esac
done
for f in "$OUT"/frames/*.png "$OUT"/frames-*.json; do
  [ -f "$f" ] || continue
  b=$(basename "$f")
  echo "SHA256 $b $(sha256sum "$f" | cut -d' ' -f1) bytes=$(wc -c < "$f")"
  base64 -w 200 "$f" | sed "s/^/B64 $b /"
done
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | grep -v '^?? dist-' | wc -l)"
echo "FRAMES-MIX1745 failchecks=$FAILS"
echo "### end"
[ "$FAILS" -eq 0 ]
