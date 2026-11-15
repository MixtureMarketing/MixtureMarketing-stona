#!/usr/bin/env bash
# MIX-1724: browser measure of card and hero ratio + crop box, switch ON, switch OFF, and a negative control
# (OFF build with a 4/3 hero frame must fail). From the repo root of a fresh tree; relative paths only.
# Exit 0 only when ON and OFF pass at 4 widths and the negative control fails (rc 1).
set -u
OUT=.bieg/mix1724/out; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
[ -e dist-m24on ] || [ -e dist-m24off ] || [ -e dist-m24neg ] && { echo "dist-m24* exists: tree not fresh, stop"; exit 2; }
build() { # name switch-value
  if [ -n "$2" ]; then VITE_MM_VIEW_TRANSITIONS=$2 npm run build > "$OUT/build-$1.log" 2>&1; else env -u VITE_MM_VIEW_TRANSITIONS npm run build > "$OUT/build-$1.log" 2>&1; fi
  local rc=$?; echo "build $1 rc=$rc"
  [ $rc -eq 0 ] || { tail -n 30 "$OUT/build-$1.log"; return 2; }
  mv dist "dist-m24$1"
}
meas() { # name mode
  node .bieg/mix1724/measure.mjs "dist-m24$1" "$OUT" "$2" 2>&1 | cut -c1-700; local rc=${PIPESTATUS[0]}
  echo "measure $1 rc=$rc"; return $rc
}
build on 1 || exit 2
meas on on; rc_on=$?
build off "" || exit 2
meas off off; rc_off=$?
cat "$OUT/measure-on.json" "$OUT/measure-off.json" 2>/dev/null | tr -d '\n ' | cut -c1-6000; echo
# negative control: OFF hero frame 4/3 -> measure must say NIE (rc 1)
H=components/templates/case-study/CaseStudyHero.tsx
sed -i 's#bg-gray-100 aspect-\[16/9\] max-h-\[75vh\]"$#bg-gray-100 aspect-[4/3] max-h-[75vh]"#' "$H"
if git diff --quiet -- "$H"; then echo "NEG NOOP"; rc_neg=3; else
  build neg "" ; rb=$?
  git checkout -- "$H"
  if [ $rb -eq 0 ]; then meas neg off; rc_neg=$?; else rc_neg=2; fi
fi
echo "RESULT on=$rc_on off=$rc_off neg=$rc_neg (neg must be 1)"
echo "### end"
[ $rc_on -eq 0 ] && [ $rc_off -eq 0 ] && [ $rc_neg -eq 1 ]
