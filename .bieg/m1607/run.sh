#!/usr/bin/env bash
# MIX-1607 r2: A/B Lighthouse (BASE 06c7062 / HEAD) z flaga banera, nowy test, rozbicie HTML. Sciezki wzgledne.
set -u
mkdir -p .bieg/r
bash .bieg/m1607/measure.sh 3 BASE HEAD 2>&1
echo "=== HTMLSIZE HEAD"; node .bieg/m1607/htmlsize.mjs dist/baza-wiedzy/index.html
echo "=== TEST AppCookieOrder"; npx vitest run tests/components/AppCookieOrder.test.tsx --maxWorkers=2 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -aE "Test Files|Tests |FAIL|Error" | head -n 8
echo "=== KONIEC run.sh"
