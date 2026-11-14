#!/usr/bin/env bash
# diagnostyka MIX-1273: szczegoly bledow eslint / prettier / vitest (stdout = log biegu)
set -u
npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1; echo "npm-ci rc=$?"
echo "=== prettier"; npx prettier --check scripts/lib/llms.js scripts/check-llms.mjs tests/seo/llmsTxt.test.ts package.json 2>&1 | tail -n 20
echo "=== eslint"; npx eslint . --report-unused-disable-directives --max-warnings 0 2>&1 | tail -n 40
echo "=== vitest"; npx vitest run --maxWorkers=2 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -aE "FAIL|AssertionError|Error:|expected|Test Files|Tests " | head -n 30
