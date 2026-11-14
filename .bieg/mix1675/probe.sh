#!/usr/bin/env bash
# MIX-1675: budowa z VITE_MM_VIEW_TRANSITIONS=1 i sonda przegladarkowa (375 i 1280 px). Z korzenia repo.
set -u
OUT=.bieg/r/mix1675p; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"
VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build.log" 2>&1; echo "build rc=$?"
node scripts/probe-case-study-back.mjs dist "$OUT" 2>&1 | cut -c1-1800 | tail -n 60; echo "probe rc=${PIPESTATUS[0]}"
