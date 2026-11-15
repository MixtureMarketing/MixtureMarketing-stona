#!/usr/bin/env bash
# MIX-1745 round 2: BACK per condition (.bieg/mix1745/cond.mjs) for two builds, compared (.bieg/mix1745/condcmp.mjs).
# Usage: bash .bieg/mix1745/cond.sh <expect: same|diff|any>
#   builds: old = this tree with the grid class of 3febcb0 (.bieg/mix1741/variant.mjs bug), head = this tree.
#   env FR_WIDTHS (subset of 375 412 1280), CD_RUNS (backs per condition), CD_CONDS (csv, see cond.mjs).
# JSON printed as "B64 <file> <chunk>" with "SHA256 <file> <hash>" (rebuild: .bieg/mix1745/wyciagnij.sh <log> <dir>).
# Exit 0 only when both builds are 0, every probe measured (rc 0) and every comparison meets expect (fail-closed).
set -u
EXPECT=${1:?expect same|diff|any}
case $EXPECT in same|diff|any) ;; *) echo "expect $EXPECT not allowed"; exit 2 ;; esac
WIDTHS=${FR_WIDTHS:-375 1280}
for w in $WIDTHS; do case $w in 375|412|1280) ;; *) echo "width $w not allowed"; exit 2 ;; esac; done
OUT=.bieg/r/mix1745c; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) expect=$EXPECT widths=$WIDTHS runs=${CD_RUNS:-10} conds=${CD_CONDS:-all}"
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
    FR_VP=$vp FR_TAG=$v node .bieg/mix1745/cond.mjs "dist-$v" "$OUT" > "$OUT/c-$v-$vp.txt" 2>&1; prc=$?
    grep -aE '^(B|LOOK|ERROR|COND) ' "$OUT/c-$v-$vp.txt" | cut -c1-420
    echo "probe $v $vp rc=$prc"; [ $prc -eq 0 ] || bad "probe $v $vp rc=$prc"
  done
  node .bieg/mix1745/condcmp.mjs "$OUT/cond-$vp-old.json" "$OUT/cond-$vp-head.json"; crc=$?
  echo "compare $vp rc=$crc expect=$EXPECT"
  case "$EXPECT:$crc" in same:0|diff:1|any:0|any:1) ;; *) bad "compare $vp rc=$crc expect=$EXPECT" ;; esac
done
for f in "$OUT"/cond-*.json; do
  [ -f "$f" ] || continue
  b=$(basename "$f")
  echo "SHA256 $b $(sha256sum "$f" | cut -d' ' -f1) bytes=$(wc -c < "$f")"
  base64 -w 200 "$f" | sed "s/^/B64 $b /"
done
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | grep -v '^?? dist-' | wc -l)"
echo "COND-MIX1745 failchecks=$FAILS"
echo "### end"
[ "$FAILS" -eq 0 ]
