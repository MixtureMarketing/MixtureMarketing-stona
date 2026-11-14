#!/usr/bin/env bash
# MIX-1675 r6: sonda. (a) ON: zwykle cofniecie i card-removed (375, 1280). (b) "/" przewiniete do 300, podwojne
# cofniecie 15/20/25 ms: ON, OFF i BASE (b95200e) maja ten sam spoczynek w kazdym biegu, ON 0 scrollTo do zapisanej
# pozycji na "/". Sonda weryfikatora r5 (wer1675r5/probe-x.mjs) w .bieg/mix1675/r6/. Z korzenia repo, swieze drzewo.
set -u
OUT=.bieg/r/mix1675r6p; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
[ -e dist-on ] || [ -e dist-off ] || [ -e dist-base ] && { echo "dist-* istnieja: drzewo nie jest swieze, stop"; exit 2; }
BASEFILES="components/common/ScrollToTop.tsx utils/caseStudyTransition.ts utils/viewTransitions.ts"
VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build-on.log" 2>&1; echo "build-on rc=$?"; mv dist dist-on
VITE_MM_VIEW_TRANSITIONS= npm run build > "$OUT/build-off.log" 2>&1; echo "build-off rc=$?"; mv dist dist-off
mkdir -p "$OUT/orig"
for f in $BASEFILES; do mkdir -p "$OUT/orig/$(dirname $f)"; cp "$f" "$OUT/orig/$f"; cp ".bieg/mix1675/base/$f" "$f"; done
VITE_MM_VIEW_TRANSITIONS= npm run build > "$OUT/build-base.log" 2>&1; echo "build-base rc=$?"; mv dist dist-base
for f in $BASEFILES; do cp "$OUT/orig/$f" "$f"; cmp "$f" "$OUT/orig/$f" && echo "restored $f"; done
P=.bieg/mix1675/r6/probe-x.mjs
for vp in 1280 375; do
  PROBE_VP=$vp PROBE_CASE=transition,card-removed node $P dist-on "$OUT/a-on-$vp" > "$OUT/a-on-$vp.txt" 2>&1; echo "probe-a on $vp rc=$?"
  grep -aE '^(PROBE|FAIL|NUM)' "$OUT/a-on-$vp.txt" | cut -c1-200
done
for m in on off base; do
  for vp in 1280 375; do
    if [ $m = on ]; then PM=; else PM=observe; fi
    PROBE_MODE=$PM PROBE_ROOTY=300 PROBE_VP=$vp PROBE_TRACE=1 PROBE_GAPS=20,20,20,20,20,20,15,25,15,25 PROBE_CASE=double-back-20,double-back-15,double-back-25 \
      node $P dist-$m "$OUT/b-$m-$vp" > "$OUT/b-$m-$vp.txt" 2>&1; echo "probe-b $m $vp rc=$?"
    grep -aE '^(ROOTY|NUM)' "$OUT/b-$m-$vp.txt" | cut -c1-160
    R=$(grep -aE '^NUM .*double-back' "$OUT/b-$m-$vp.txt" | grep -aoE ' rest=[0-9]+' | cut -d= -f2 | sort -n | uniq -c | tr -s ' ' | tr '\n' ';')
    C=$(grep -aE '^NUM .*double-back' "$OUT/b-$m-$vp.txt" | grep -aoE 'restoreCallsOnRoot=[0-9]+' | cut -d= -f2 | awk '{s+=$1} END {print s+0}')
    echo "SUMMARY $m $vp runs=$(grep -acE '^NUM .*double-back' "$OUT/b-$m-$vp.txt") rests=$R restoreCallsOnRoot=$C"
  done
done
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | grep -v '^?? dist-' | wc -l)"
echo "### end"
