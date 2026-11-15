#!/usr/bin/env bash
# MIX-1759: UA-transition leg (.bieg/mix1759/ua.mjs) at 375 and 1280. From the repo root on a fresh tree.
# Builds: head (this tree), base (this tree with utils/caseStudyBack.ts and utils/caseStudyBackBrowser.ts of 1ebc9f0,
# committed under .bieg/mix1759/base-1ebc9f0 with SHA256SUMS). Legs per width (UA_RUNS backs each, default 10):
#   head ua=1 expect none (no own view transition after a browser transition, lands at the card),
#   head ua=0 expect some (control: the probe sees our transition; behaviour as 1ebc9f0),
#   base ua=1 expect some (1ebc9f0 starts its transition on top of the browser one: the leg is RED on the old code).
# Exit 0 only when both builds are 0 and every leg returns 0 (fail-closed: probe rc 2 = not measured = failure).
set -u
RUNS=${UA_RUNS:-10}
case $RUNS in [1-9]|[1-3][0-9]) ;; *) echo "UA_RUNS $RUNS not allowed"; exit 2 ;; esac
WIDTHS=${UA_WIDTHS:-375 1280}
for w in $WIDTHS; do case $w in 375|1280) ;; *) echo "width $w not allowed"; exit 2 ;; esac; done
OUT=.bieg/r/mix1759u; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) runs=$RUNS widths=$WIDTHS"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
for d in dist dist-uahead dist-uabase; do [ -e "$d" ] && { echo "$d exists: tree not fresh, stop"; exit 2; }; done
FAILS=0
bad() { echo "FAILCHECK $*"; FAILS=$((FAILS + 1)); }
FILES="utils/caseStudyBack.ts utils/caseStudyBackBrowser.ts"
BASE=.bieg/mix1759/base-1ebc9f0
(cd $BASE && sha256sum -c --quiet SHA256SUMS) || bad "base-1ebc9f0 checksum"
mkdir -p "$OUT/orig/utils"; for f in $FILES; do cp "$f" "$OUT/orig/$f"; done
for v in head base; do
  for f in $FILES; do cp "$OUT/orig/$f" "$f"; done
  if [ $v = base ]; then
    for f in $FILES; do cp "$BASE/$(basename "$f")" "$f"; cmp -s "$f" "$OUT/orig/$f" && bad "base: $f equals this tree"; done
  fi
  echo "variant $v uaTransition lines: $(grep -c uaTransition utils/caseStudyBack.ts utils/caseStudyBackBrowser.ts | paste -sd' ')"
  VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build-$v.log" 2>&1; rc=$?; echo "build-$v rc=$rc"
  [ $rc -eq 0 ] || { bad "build-$v rc=$rc"; tail -n 20 "$OUT/build-$v.log"; continue; }
  mv dist "dist-ua$v"
done
for f in $FILES; do cp "$OUT/orig/$f" "$f"; cmp -s "$f" "$OUT/orig/$f" && echo "restored $f"; done
for vp in $WIDTHS; do
  CL=0; [ "$vp" = 1280 ] && CL=18   # as .bieg/mix1741/footer.sh: the 1280 list made as tall as at 375
  for leg in head:1:none head:0:some base:1:some; do
    IFS=: read -r v ua ex <<< "$leg"
    [ -d "dist-ua$v" ] || { bad "$v $vp ua=$ua: no build"; continue; }
    FOOT_CLONES=$CL FOOT_VP=$vp FOOT_CASE=back FOOT_RUNS=$RUNS FOOT_TAG=$v UA_FLAG=$ua UA_EXPECT=$ex \
      node .bieg/mix1759/ua.mjs "dist-ua$v" "$OUT" > "$OUT/u-$v-$vp-$ua.txt" 2>&1; prc=$?
    grep -aE '^(CARDS|RUN|SUMMARY|ERROR)' "$OUT/u-$v-$vp-$ua.txt" | sed -E 's/ gridBefore=.* minY=/ minY=/' | cut -c1-260
    echo "LEG $v $vp ua=$ua expect=$ex rc=$prc"
    [ $prc -eq 0 ] || bad "$v $vp ua=$ua expect=$ex rc=$prc"
  done
done
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | grep -v '^?? dist-' | wc -l)"
echo "UA-MIX1759 failchecks=$FAILS"
echo "### end"
[ "$FAILS" -eq 0 ]
