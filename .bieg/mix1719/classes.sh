#!/usr/bin/env bash
# MIX-1719: human double back (case study -> list -> "/", history.back() 100-260 ms apart), "/" pre-scrolled to 300.
# Usage: bash .bieg/mix1719/classes.sh <width 1280|375>. From the repo root on a fresh tree; result on stdout.
# Builds: on (this tree), on1711 (this tree with the MIX-1711 back files from d73cc9f: the state before MIX-1719),
# off (flag off), base (.bieg/mix1675/base files, flag off). Probe .bieg/mix1719/probe-x.mjs, PROBE_REPEAT=8:
# gaps 100,130,160,200,260 x 8 runs for on, on1711, off, base; neg = ON + a deliberate scrollTo 451 on "/" after the
# double back, 8 runs at gap 160 (negative control, must be RED). Classes: .bieg/mix1719/classes.mjs (per gap).
# Exit 0 only when: builds 0, ON probe rc 0, ON GREEN at every gap, neg RED, on1711 RED at >= 1 gap >= 130
# (the instrument sees the MIX-1711 residual). on1711 per-gap result is printed for the report.
set -u
VP=${1:?usage: classes.sh <1280|375>}
case "$VP" in 1280|375) ;; *) echo "width $VP not allowed"; exit 2 ;; esac
OUT=.bieg/r/mix1719c-$VP; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) VP=$VP"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
for d in dist-on dist-on1711 dist-off dist-base; do [ -e "$d" ] && { echo "$d exists: tree not fresh, stop"; exit 2; }; done
FAILS=0
bad() { echo "FAILCHECK $*"; FAILS=$((FAILS + 1)); }
build() { local name=$1 flag=$2; VITE_MM_VIEW_TRANSITIONS=$flag npm run build > "$OUT/build-$name.log" 2>&1; local rc=$?; echo "build-$name rc=$rc"; [ $rc -eq 0 ] || bad "build-$name rc=$rc"; mv dist "dist-$name"; }
swap() { # swap <dir with files> <files...>: copy originals to $OUT/orig, put the given versions in place
  local src=$1; shift
  for f in "$@"; do mkdir -p "$OUT/orig/$(dirname "$f")"; cp "$f" "$OUT/orig/$f"; cp "$src/$f" "$f"; done
}
unswap() { for f in "$@"; do cp "$OUT/orig/$f" "$f"; cmp "$f" "$OUT/orig/$f" && echo "restored $f"; done; }
build on 1
OLD="utils/caseStudyBackSkip.ts utils/caseStudyBackTransition.ts"
mkdir -p "$OUT/d73cc9f/utils"
for f in $OLD; do git show "d73cc9f:$f" > "$OUT/d73cc9f/$f" || bad "git show d73cc9f:$f"; done
swap "$OUT/d73cc9f" $OLD
echo "on1711 diff vs d73cc9f: $(git diff --stat d73cc9f -- $OLD | tail -n 1)"
build on1711 1
unswap $OLD
build off ''
BASEFILES="components/common/ScrollToTop.tsx utils/caseStudyTransition.ts utils/viewTransitions.ts"
swap .bieg/mix1675/base $BASEFILES
build base ''
unswap $BASEFILES
P=.bieg/mix1719/probe-x.mjs
GAPS=100,130,160,200,260
names() { local out=; for g in $(echo "$1" | tr ',' ' '); do for i in 1 2 3 4 5 6 7 8; do out="$out,double-back-$g-r$i"; done; done; echo "${out#,}"; }
for m in on on1711 off base neg; do
  d=$m; INJ=; PM=observe; G=$GAPS
  [ $m = on ] && PM=
  [ $m = neg ] && { d=on; INJ=451; G=160; }
  PROBE_MODE=$PM PROBE_INJECT_Y=$INJ PROBE_ROOTY=300 PROBE_VP=$VP PROBE_GAPS=$G PROBE_REPEAT=8 PROBE_CASE=$(names $G) \
    node $P dist-$d "$OUT/b-$m" > "$OUT/b-$m.txt" 2>&1; rc=$?
  echo "probe $m $VP rc=$rc"; [ $m = on ] && [ $rc -ne 0 ] && bad "probe on $VP rc=$rc"
  grep -aE '^(FAIL|PROBE)' "$OUT/b-$m.txt" | sort | uniq -c | head -n 20
  grep -aE '^NUM .*double-back' "$OUT/b-$m.txt" | sed -E 's/ listeners=.*//; s/^/['"$m"'] /'
done
declare -A CL
for m in on on1711; do
  node .bieg/mix1719/classes.mjs $VP $m $GAPS "$OUT/b-$m.txt" "$OUT/b-off.txt" "$OUT/b-base.txt" > "$OUT/cl-$m.txt"; CL[$m]=$?
  cat "$OUT/cl-$m.txt"
done
node .bieg/mix1719/classes.mjs $VP neg 160 "$OUT/b-neg.txt" "$OUT/b-off.txt" "$OUT/b-base.txt"; CL[neg]=$?
RED1711=$(grep -aE "^REDGAPS $VP on1711:" "$OUT/cl-on1711.txt" | sed -E 's/.*\[(.*)\].*/\1/' | tr ',' '\n' | awk '$1 >= 130' | paste -sd,)
echo "RESULT $VP: ON rc=${CL[on]} (0 = GREEN), neg rc=${CL[neg]} (must be 1), on1711 rc=${CL[on1711]} red gaps >= 130: [${RED1711}]"
[ "${CL[on]}" -eq 0 ] || bad "$VP ON outside the OFF/base classes or a frame above OFF max + 4 at some gap"
[ "${CL[neg]}" -eq 1 ] || bad "$VP negative control not detected (rc=${CL[neg]})"
[ -n "$RED1711" ] || bad "$VP instrument does not see the MIX-1711 residual (on1711 green at every gap >= 130)"
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | grep -v '^?? dist-' | wc -l)"
echo "PROBE-MIX1719 $VP failchecks=$FAILS"
echo "### end"
[ "$FAILS" -eq 0 ]
