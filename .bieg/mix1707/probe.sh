#!/usr/bin/env bash
# MIX-1707: probe of the back navigation (from .bieg/mix1699/probe.sh). Builds: on (this tree), on0 (same tree with
# BACK_CONFIRM_MS = 0, control: the confirmation window removed), off, base (.bieg/mix1675/base files).
# (a) normal back and card-removed back, ON and on0 (cost of the window: cbMs, firstFrameMs).
# (b) "/" pre-scrolled to 300, double back, 8 gaps per width and mode: on, on0, off, base, and neg = ON with a
#     deliberate scrollTo 451 on "/" after the double back (negative control, must be RED).
# Rest classes are DERIVED from the OFF and base runs of this same run (.bieg/mix1707/classes.mjs).
# Exit 0 only when: builds 0, probe-a ON rc 0, probe-b ON rc 0, ON classes GREEN at both widths, neg RED at both.
# From the repo root on a fresh tree. Result on stdout only (run log).
set -u
OUT=.bieg/r/mix1707p; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
for d in dist-on dist-on0 dist-off dist-base; do [ -e "$d" ] && { echo "$d exists: tree not fresh, stop"; exit 2; }; done
FAILS=0
bad() { echo "FAILCHECK $*"; FAILS=$((FAILS + 1)); }
build() { local name=$1 flag=$2; VITE_MM_VIEW_TRANSITIONS=$flag npm run build > "$OUT/build-$name.log" 2>&1; local rc=$?; echo "build-$name rc=$rc"; [ $rc -eq 0 ] || bad "build-$name rc=$rc"; mv dist "dist-$name"; }
build on 1
OPT=utils/caseStudyBackOptions.ts; cp "$OPT" "$OUT/opt.orig"
sed -i 's/^export const BACK_CONFIRM_MS = 250;$/export const BACK_CONFIRM_MS = 0;/' "$OPT"
grep -q '^export const BACK_CONFIRM_MS = 0;$' "$OPT" || bad "on0: BACK_CONFIRM_MS not replaced"
build on0 1
cp "$OUT/opt.orig" "$OPT"; cmp "$OPT" "$OUT/opt.orig" && echo "restored $OPT"
build off ''
BASEFILES="components/common/ScrollToTop.tsx utils/caseStudyTransition.ts utils/viewTransitions.ts"
mkdir -p "$OUT/orig"
for f in $BASEFILES; do mkdir -p "$OUT/orig/$(dirname $f)"; cp "$f" "$OUT/orig/$f"; cp ".bieg/mix1675/base/$f" "$f"; done
build base ''
for f in $BASEFILES; do cp "$OUT/orig/$f" "$f"; cmp "$f" "$OUT/orig/$f" && echo "restored $f"; done
P=.bieg/mix1707/p/probe-x.mjs
for m in on on0; do
  for vp in 1280 375; do
    PROBE_VP=$vp PROBE_CASE=transition,card-removed node $P dist-$m "$OUT/a-$m-$vp" > "$OUT/a-$m-$vp.txt" 2>&1; rc=$?
    echo "probe-a $m $vp rc=$rc"; [ $m = on ] && [ $rc -ne 0 ] && bad "probe-a on $vp rc=$rc"
    grep -aE '^(PROBE|FAIL)' "$OUT/a-$m-$vp.txt" | cut -c1-200
    grep -aE '^NUM' "$OUT/a-$m-$vp.txt" | sed -E 's/ scrollEvents total.*sameAsset=/ sameAsset=/; s/ listeners=.*//'
  done
done
GAPS=12,15,18,20,22,25,28,30
CASES=$(echo "$GAPS" | tr ',' '\n' | sed 's/^/double-back-/' | paste -sd,)
for m in on on0 off base neg; do
  for vp in 1280 375; do
    d=$m; INJ=; PM=observe
    [ $m = on ] && PM=
    [ $m = neg ] && { d=on; INJ=451; }
    PROBE_MODE=$PM PROBE_INJECT_Y=$INJ PROBE_ROOTY=300 PROBE_VP=$vp PROBE_GAPS=$GAPS PROBE_CASE=$CASES \
      node $P dist-$d "$OUT/b-$m-$vp" > "$OUT/b-$m-$vp.txt" 2>&1; rc=$?
    echo "probe-b $m $vp rc=$rc"; [ $m = on ] && [ $rc -ne 0 ] && bad "probe-b on $vp rc=$rc"
    grep -aE '^(ROOTY|FAIL|PROBE)' "$OUT/b-$m-$vp.txt" | sort | uniq -c
    grep -aE '^NUM .*double-back' "$OUT/b-$m-$vp.txt" | sed -E 's/ listeners=.*//'
    grep -aE '^ROOTDBG' "$OUT/b-$m-$vp.txt" | cut -c1-1200
  done
done
declare -A CL
for vp in 1280 375; do
  for m in on on0 neg; do
    node .bieg/mix1707/classes.mjs $vp $m "$OUT/b-$m-$vp.txt" "$OUT/b-off-$vp.txt" "$OUT/b-base-$vp.txt"; CL[$m]=$?
  done
  echo "RESULT $vp: ON classes rc=${CL[on]} (0 = GREEN), neg control rc=${CL[neg]} (must be 1), on0 control rc=${CL[on0]} (info)"
  [ "${CL[on]}" -eq 0 ] || bad "$vp ON outside the OFF/base classes or rootFramesMaxY > OFF + 4"
  [ "${CL[neg]}" -eq 1 ] || bad "$vp negative control not detected (rc=${CL[neg]})"
done
# instrument replay on the recorded r2 numbers (f431473, .bieg/mix1707/r2): OFF and base GREEN, ON RED expected
for vp in 1280 375; do
  for m in on off base; do
    node .bieg/mix1707/classes.mjs $vp r2-$m .bieg/mix1707/r2/$m-$vp.txt .bieg/mix1707/r2/off-$vp.txt .bieg/mix1707/r2/base-$vp.txt | grep -E '^CLASSES'
  done
done
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | grep -v '^?? dist-' | wc -l)"
echo "PROBE-MIX1707 failchecks=$FAILS"
echo "### end"
[ "$FAILS" -eq 0 ]
