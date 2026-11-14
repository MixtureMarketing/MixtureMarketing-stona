#!/usr/bin/env bash
# MIX-1675 r3: sonda przegladarkowa. ON (przelacznik wlaczony, wszystkie przypadki + card-removed + double-back),
# OFF (przelacznik wylaczony) i BASE (b95200e: 3 pliki z .bieg/mix1675/base/ podmienione na czas budowy,
# potem przywrocone i sprawdzone cmp) w trybie observe: same liczby, do porownania OFF == BASE. Z korzenia repo.
# Wymaga swiezego drzewa (bez dist-on/dist-off/dist-base): chmura synchronizuje z commita.
set -u
OUT=.bieg/r/mix1675p3; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build-on.log" 2>&1; echo "build-on rc=$?"; mv dist dist-on
VITE_MM_VIEW_TRANSITIONS= npm run build > "$OUT/build-off.log" 2>&1; echo "build-off rc=$?"; mv dist dist-off
BASEFILES="components/common/ScrollToTop.tsx utils/caseStudyTransition.ts utils/viewTransitions.ts"
mkdir -p "$OUT/orig"
for f in $BASEFILES; do mkdir -p "$OUT/orig/$(dirname $f)"; cp "$f" "$OUT/orig/$f"; cp ".bieg/mix1675/base/$f" "$f"; done
VITE_MM_VIEW_TRANSITIONS= npm run build > "$OUT/build-base.log" 2>&1; echo "build-base rc=$?"; mv dist dist-base
for f in $BASEFILES; do cp "$OUT/orig/$f" "$f"; cmp "$f" "$OUT/orig/$f" && echo "restored $f"; done
for m in on off base; do
  mkdir -p "$OUT/$m"
  if [ $m = on ]; then node scripts/probe-case-study-back.mjs dist-on "$OUT/$m" > "$OUT/$m.txt" 2>&1; echo "probe-on rc=$?"
  else PROBE_MODE=observe node scripts/probe-case-study-back.mjs dist-$m "$OUT/$m" > "$OUT/$m.txt" 2>&1; echo "probe-$m rc=$?"; fi
  echo "== $m"; grep -aE '^(NUM|PROBE|FAIL)' "$OUT/$m.txt" | cut -c1-600
done
