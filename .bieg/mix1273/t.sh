#!/usr/bin/env bash
# MIX-1273 r2: bieg celowany (npm ci, prettier, eslint zmienionych plikow, test llmsTxt, mutanty). Z korzenia repo.
set -u
OUT=.bieg/r/mix1273; mkdir -p "$OUT"
echo "HEAD=$(git rev-parse HEAD)"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/t-npm.log" 2>&1; echo "npm-ci rc=$?"
npx prettier --check scripts/lib/llms.js scripts/check-llms.mjs tests/seo/llmsTxt.test.ts 2>&1 | tail -n 5; echo "prettier rc=${PIPESTATUS[0]}"
npx eslint --max-warnings 0 scripts/lib/llms.js scripts/check-llms.mjs tests/seo/llmsTxt.test.ts 2>&1 | tail -n 20; echo "eslint rc=${PIPESTATUS[0]}"
npx vitest run tests/seo/llmsTxt.test.ts --maxWorkers=2 > "$OUT/t-vitest.log" 2>&1; echo "vitest rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/t-vitest.log" | grep -aE "Test Files|Tests |FAIL|AssertionError|Expected|Received" | head -n 30
bash .bieg/mix1273/mut.sh
