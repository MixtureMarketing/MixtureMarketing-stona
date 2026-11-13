#!/usr/bin/env bash
# MIX-1613: testy dotkniete zmiana + zrzuty/CI (celowane, <1 min), potem lint+tsc na plikach zmian.
set -u
OUT=.bieg/r/m1613
mkdir -p "$OUT"
echo "legacy-peer-deps=true" > .npmrc
npm ci --no-audit --no-fund > "$OUT/rel-ci.log" 2>&1; echo "npm-ci rc=$?"
npx vitest run --maxWorkers=2 tests/hooks tests/services tests/components/KnowledgeBaseSnapshot.test.tsx tests/components/PortfolioPageCms.test.tsx tests/components/cmsSnapshotCanonical.test.tsx tests/scripts/ciWorkflow.test.ts > "$OUT/rel.log" 2>&1; echo "vitest rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/rel.log" | grep -aE "Test Files|Tests |FAIL|✗|×" | head -n 30
npx tsc --noEmit -p tsconfig.json > "$OUT/rel-tsc.log" 2>&1; echo "tsc rc=$?"; head -n 15 "$OUT/rel-tsc.log"
