#!/usr/bin/env bash
# MIX-1815: szybki bieg celowany (npm ci, vitest wybranych plikow, eslint/prettier zmienionych, tsc).
set -u
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 2
npm ci --legacy-peer-deps --no-audit --no-fund > /tmp/m1815-npm.log 2>&1; echo "STEP npm-ci rc=$?"
C=components/features/calculator
F="$C/ResultContact.resumed.test.tsx $C/ResultContact.combos.test.tsx $C/flagInherit.mix1898.test.ts $C/calculatorHandoff.ts $C/calculatorHandoff.test.ts $C/ResultContact.switch.test.tsx $C/CalculatorResult.tsx $C/PublicCalculator.tsx $C/livePrice.ts $C/useHideCookieOver.ts components/pages/ContactPage.tsx components/features/contact/InlineContactForm.tsx tests/scripts/ciWorkflow.test.ts index.css"
npx vitest run components/features/calculator tests/components/InlineContactForm.test.tsx tests/hooks/useContactForm.test.tsx tests/scripts/ciWorkflow.test.ts --maxWorkers=2 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -aE '^ *(Test Files|Tests) |FAIL|×|Error|expected|received|Unable|❯ .*test\.tsx?:[0-9]+' | head -80
echo "STEP vitest done"
# shellcheck disable=SC2086
npx eslint $(echo $F | tr ' ' '\n' | grep -v '\.css$') --max-warnings 0 2>&1 | tail -20; echo "STEP eslint rc=${PIPESTATUS[0]}"
# shellcheck disable=SC2086
npx prettier --check $F 2>&1 | tail -5
npx tsc --noEmit -p tsconfig.json 2>&1 | grep 'error TS' | head -10; echo "STEP tsc done"
