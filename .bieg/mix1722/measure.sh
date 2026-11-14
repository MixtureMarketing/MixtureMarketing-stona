#!/usr/bin/env bash
# MIX-1722: build with view transitions on, measure card/hero ratio at 4 widths (.bieg/mix1722/measure.mjs).
# From the repo root on a fresh tree. Result on stdout. Exit 0 only when all 4 widths pass.
set -u
OUT=.bieg/mix1722/out; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
[ -e dist-m22 ] && { echo "dist-m22 exists: tree not fresh, stop"; exit 2; }
VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build.log" 2>&1; rc=$?; echo "build rc=$rc"
[ $rc -eq 0 ] || { tail -n 30 "$OUT/build.log"; exit 2; }
mv dist dist-m22
node .bieg/mix1722/measure.mjs dist-m22 "$OUT" 2>&1 | cut -c1-600; rc=${PIPESTATUS[0]}
echo "measure rc=$rc"
cat "$OUT/measure.json" 2>/dev/null | tr -d '\n ' | cut -c1-3000; echo
echo "### end"
exit $rc
