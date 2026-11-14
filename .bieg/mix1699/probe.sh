#!/usr/bin/env bash
# MIX-1699: sonda powrotu (kopia .bieg/mix1675/r6-probe.sh). (a) ON: zwykle cofniecie i card-removed (375, 1280).
# (b) "/" przewiniete do 300, podwojne cofniecie, 8 przebiegow (8 roznych odstepow) na szerokosc i tryb: ON, OFF, BASE.
# Kod wyjscia 0 tylko gdy: budowy 0, probe-a ON rc 0, probe-b ON rc 0, ON 0 scrollTo do zapisanej pozycji na "/",
# max klatki ON na "/" <= max OFF + 4 px na kazdej szerokosci, OFF bez spoczynku spoza klas przegladarki.
# Regula OFF vs BASE: klasy spoczynku "top" (<= 4 px) i "kept" (300 +- 4); obie wersje maja ten sam kod "/" i te same
# nasluchy, wiec podzial top/kept to wyscig przegladarki (raportowany liczbami), "other" = blad.
# Z korzenia repo, swieze drzewo. Wynik tylko na stdout (log biegu).
set -u
OUT=.bieg/r/mix1699p; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
{ [ -e dist-on ] || [ -e dist-off ] || [ -e dist-base ]; } && { echo "dist-* istnieja: drzewo nie jest swieze, stop"; exit 2; }
FAILS=0
bad() { echo "FAILCHECK $*"; FAILS=$((FAILS + 1)); }
BASEFILES="components/common/ScrollToTop.tsx utils/caseStudyTransition.ts utils/viewTransitions.ts"
VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build-on.log" 2>&1; rc=$?; echo "build-on rc=$rc"; [ $rc -eq 0 ] || bad "build-on rc=$rc"; mv dist dist-on
VITE_MM_VIEW_TRANSITIONS= npm run build > "$OUT/build-off.log" 2>&1; rc=$?; echo "build-off rc=$rc"; [ $rc -eq 0 ] || bad "build-off rc=$rc"; mv dist dist-off
mkdir -p "$OUT/orig"
for f in $BASEFILES; do mkdir -p "$OUT/orig/$(dirname $f)"; cp "$f" "$OUT/orig/$f"; cp ".bieg/mix1675/base/$f" "$f"; done
VITE_MM_VIEW_TRANSITIONS= npm run build > "$OUT/build-base.log" 2>&1; rc=$?; echo "build-base rc=$rc"; [ $rc -eq 0 ] || bad "build-base rc=$rc"; mv dist dist-base
for f in $BASEFILES; do cp "$OUT/orig/$f" "$f"; cmp "$f" "$OUT/orig/$f" && echo "restored $f"; done
P=.bieg/mix1699/p/probe-x.mjs
for vp in 1280 375; do
  PROBE_VP=$vp PROBE_CASE=transition,card-removed node $P dist-on "$OUT/a-on-$vp" > "$OUT/a-on-$vp.txt" 2>&1; rc=$?
  echo "probe-a on $vp rc=$rc"; [ $rc -eq 0 ] || bad "probe-a on $vp rc=$rc"
  grep -aE '^(PROBE|FAIL|NUM)' "$OUT/a-on-$vp.txt" | cut -c1-200
done
GAPS=12,15,18,20,22,25,28,30
CASES=$(echo "$GAPS" | tr ',' '\n' | sed 's/^/double-back-/' | paste -sd,)
for m in on off base; do
  for vp in 1280 375; do
    if [ $m = on ]; then PM=; else PM=observe; fi
    PROBE_MODE=$PM PROBE_ROOTY=300 PROBE_VP=$vp PROBE_GAPS=$GAPS PROBE_CASE=$CASES \
      node $P dist-$m "$OUT/b-$m-$vp" > "$OUT/b-$m-$vp.txt" 2>&1; rc=$?
    echo "probe-b $m $vp rc=$rc"; [ $m = on ] && [ $rc -ne 0 ] && bad "probe-b on $vp rc=$rc"
    grep -aE '^(ROOTY|FAIL|PROBE)' "$OUT/b-$m-$vp.txt" | sort | uniq -c
    grep -aE '^NUM' "$OUT/b-$m-$vp.txt" | cut -c1-170
    grep -aE '^ROOTDBG' "$OUT/b-$m-$vp.txt" | cut -c1-2600
    NUMS=$(grep -aE '^NUM .*double-back' "$OUT/b-$m-$vp.txt")
    R=$(echo "$NUMS" | grep -aoE ' rest=[0-9]+' | cut -d= -f2 | sort -n | uniq -c | tr -s ' ' | tr '\n' ';')
    C=$(echo "$NUMS" | grep -aoE 'restoreCallsOnRoot=[0-9]+' | cut -d= -f2 | awk '{s+=$1} END {print s+0}')
    MX=$(echo "$NUMS" | grep -aoE 'rootFramesMaxY=[0-9]+' | cut -d= -f2 | sort -n | tail -n 1)
    CL=$(echo "$NUMS" | grep -aoE ' rest=[0-9]+' | cut -d= -f2 | awk '{ if ($1<=4) t++; else if ($1>=296 && $1<=304) k++; else o++ } END {printf "top=%d kept=%d other=%d", t, k, o}')
    N=$(echo "$NUMS" | grep -ac 'double-back')
    echo "SUMMARY $m $vp runs=$N rests=$R classes: $CL rootFramesMaxY_max=${MX:-none} restoreCallsOnRoot=$C"
    eval "MAX_${m}_${vp}=${MX:-99999}; RUNS_${m}_${vp}=$N; CALLS_${m}_${vp}=$C; OTHER_${m}_${vp}=$(echo "$CL" | grep -oE 'other=[0-9]+' | cut -d= -f2)"
  done
done
for vp in 1280 375; do
  eval "on=\$MAX_on_$vp; off=\$MAX_off_$vp; calls=\$CALLS_on_$vp; other=\$OTHER_off_$vp; otheron=\$OTHER_on_$vp"
  for m in on off base; do eval "n=\$RUNS_${m}_$vp"; [ "$n" -eq 8 ] || bad "$m $vp runs=$n (expected 8)"; done
  echo "COMPARE $vp: ON rootFramesMaxY_max=$on OFF rootFramesMaxY_max=$off (rule ON <= OFF + 4)"
  [ "$on" -le $((off + 4)) ] || bad "$vp ON max $on > OFF max $off + 4"
  [ "$calls" -eq 0 ] || bad "$vp ON restoreCallsOnRoot=$calls"
  [ "$other" -eq 0 ] || bad "$vp OFF rest outside browser classes: $other"
  # r2: ON rests in the same classes as OFF (top/kept); "other" = a change made by our code
  echo "CLASSES $vp: ON other=$otheron OFF other=$other (rule: both 0)"
  [ "$otheron" -eq 0 ] || bad "$vp ON rest outside browser classes: $otheron"
done
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | grep -v '^?? dist-' | wc -l)"
echo "PROBE-MIX1699 failchecks=$FAILS"
echo "### end"
[ "$FAILS" -eq 0 ]
