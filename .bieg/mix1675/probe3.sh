#!/usr/bin/env bash
# MIX-1675 r3: sonda przegladarkowa na 4 budowach. ON (przelacznik wlaczony: wszystkie przypadki, card-removed,
# double-back przy kilku odstepach), R2 (ON ze starymi 2 plikami z 067dbc3: dowod, ze sonda lapie F1 i F2),
# OFF (przelacznik wylaczony) i BASE (b95200e: 3 pliki z .bieg/mix1675/base/ na czas budowy) w trybie observe.
# Podmienione pliki wracaja z kopii i sa sprawdzane cmp. Z korzenia repo; swieże drzewo z commita (bez dist-*).
set -u
OUT=.bieg/r/mix1675p3; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
export PROBE_GAPS=${PROBE_GAPS:-20,40,60,90,130}
echo "PROBE_MODES=${PROBE_MODES:-all} PROBE_GAPS=$PROBE_GAPS"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
want() { case " ${PROBE_MODES:-on r2 off base} " in *" $1 "*) return 0;; esac; return 1; }

swap() { # swap <katalog-z-podmiana> <plik...>: kopia oryginalu, podmiana
  local dir=$1; shift
  for f in "$@"; do mkdir -p "$OUT/orig/$(dirname $f)"; cp "$f" "$OUT/orig/$f"; cp "$dir/$f" "$f"; done
}
unswap() {
  for f in "$@"; do cp "$OUT/orig/$f" "$f"; cmp "$f" "$OUT/orig/$f" && echo "restored $f"; done
}
BASEFILES="components/common/ScrollToTop.tsx utils/caseStudyTransition.ts utils/viewTransitions.ts"
R2FILES="utils/caseStudyBackTransition.ts utils/caseStudyBackBrowser.ts"
if want on; then VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build-on.log" 2>&1; echo "build-on rc=$?"; mv dist dist-on; fi
if want r2; then
  swap .bieg/mix1675/r2 $R2FILES
  VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build-r2.log" 2>&1; echo "build-r2 rc=$?"; mv dist dist-r2
  unswap $R2FILES
fi
if want off; then VITE_MM_VIEW_TRANSITIONS= npm run build > "$OUT/build-off.log" 2>&1; echo "build-off rc=$?"; mv dist dist-off; fi
if want base; then
  swap .bieg/mix1675/base $BASEFILES
  VITE_MM_VIEW_TRANSITIONS= npm run build > "$OUT/build-base.log" 2>&1; echo "build-base rc=$?"; mv dist dist-base
  unswap $BASEFILES
fi
for m in ${PROBE_MODES:-on r2 off base}; do
  mkdir -p "$OUT/$m"
  if [ $m = on ] || [ $m = r2 ]; then node scripts/probe-case-study-back.mjs dist-$m "$OUT/$m" > "$OUT/$m.txt" 2>&1; echo "probe-$m rc=$?"
  else PROBE_MODE=observe node scripts/probe-case-study-back.mjs dist-$m "$OUT/$m" > "$OUT/$m.txt" 2>&1; echo "probe-$m rc=$?"; fi
  echo "== $m"; grep -aE '^(NUM|PROBE|FAIL|TRACE)' "$OUT/$m.txt" | grep -avE 'reduced-motion|no-api' | sed -E 's/ listeners=\{[^}]*"popstate":([0-9]+)[^}]*\}/ popstate-listeners=\1/' | cut -c1-330
done
