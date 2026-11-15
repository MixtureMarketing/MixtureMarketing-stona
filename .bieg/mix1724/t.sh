#!/usr/bin/env bash
# MIX-1724: install deps, run the affected tests. Relative paths.
set -u
OUT=.bieg/mix1724/out; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
npx vitest related components/templates/case-study/CaseStudyHero.tsx tests/components/portfolioImageProportions.test.tsx --run --maxWorkers=2 > "$OUT/related.log" 2>&1; echo "related rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/related.log" | grep -aE "Test Files|Tests |FAIL|Error|expected" | cut -c1-240 | head -30
git status --short
echo "### end"
