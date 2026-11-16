#!/usr/bin/env bash
# MIX-1579: szybka kontrola zmienionych plików: eslint, tsc, vitest related. Ścieżki względne.
set -u
F="components/features/CookieBanner.tsx components/features/CookieFloatingButton.tsx config/flags.ts tests/components/CookieBannerStatic.test.tsx"
echo "legacy-peer-deps=true" > .npmrc
npm ci --no-audit --no-fund > /dev/null 2>&1; echo "npm ci rc $?"
npx eslint $F --max-warnings 0; echo "eslint rc $?"
npx tsc --noEmit -p tsconfig.json > tsc.out 2>&1; echo "tsc rc $?"; head -n 20 tsc.out
npx vitest related $F index.html --run --maxWorkers=2 > vr.out 2>&1; echo "vitest related rc $?"
sed 's/\x1b\[[0-9;]*m//g' vr.out | grep -aE "Test Files|Tests |FAIL|✗|×|AssertionError|Error:" | head -n 40
