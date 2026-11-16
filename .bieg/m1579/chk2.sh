#!/usr/bin/env bash
# MIX-1579: test nowego pliku + mutant M4 (po dodaniu testu prototypu). Ścieżki względne.
set -u
echo "legacy-peer-deps=true" > .npmrc
npm ci --no-audit --no-fund > /dev/null 2>&1; echo "npm ci rc $?"
npx eslint tests/components/CookieBannerStatic.test.tsx --max-warnings 0; echo "eslint rc $?"
npx tsc --noEmit -p tsconfig.json > tsc2.out 2>&1; echo "tsc rc $?"; head -n 10 tsc2.out
npx vitest run tests/components/CookieBannerStatic.test.tsx tests/components/CookieBanner.test.tsx tests/components/CookieBannerZaraz.test.tsx --maxWorkers=2 > v2.out 2>&1; echo "vitest rc $?"
sed 's/\x1b\[[0-9;]*m//g' v2.out | grep -aE "Test Files|Tests |FAIL" | head -n 20
ONLY=M4 bash .bieg/m1579/mut.sh
