#!/usr/bin/env bash
# MIX-1722 r2: the two files that failed in the full run, verbose failure text.
set -u
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1
npx vitest run --maxWorkers=2 tests/components/portfolioImageProportions.test.tsx tests/hooks/cmsSnapshotShape.test.tsx 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -aE "Test Files|Tests |FAIL|Error|expected|Received|class outside" | cut -c1-260 | head -40
echo "### end"
