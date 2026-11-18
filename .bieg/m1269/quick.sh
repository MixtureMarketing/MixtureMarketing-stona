#!/usr/bin/env bash
# MIX-1269: szybki bieg testów karty (przed pełną kontrolą).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1; echo "npm-ci rc=$?"
npx vitest run tests/seo/homeSeo.test.tsx tests/scripts/ciWorkflow.test.ts tests/components/aiSection.test.tsx 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -aE "Test Files|Tests |FAIL|×|Expected|Received|AssertionError|Error:|^\s+[-+] " | head -60
