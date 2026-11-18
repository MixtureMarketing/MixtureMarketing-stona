#!/usr/bin/env bash
# MIX-1815: szybki bieg celowany (npm ci, vitest wybranych plikow, eslint/prettier zmienionych, tsc).
set -u
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 2
npm ci --legacy-peer-deps --no-audit --no-fund > /tmp/m1815-npm.log 2>&1; echo "STEP npm-ci rc=$?"
F="components/features/calculator/ResultContact.resumed.test.tsx components/features/calculator/calculatorHandoff.ts components/features/calculator/calculatorHandoff.test.ts components/features/calculator/ResultContact.switch.test.tsx components/features/calculator/CalculatorResult.tsx components/features/calculator/PublicCalculator.tsx components/features/calculator/livePrice.ts components/features/calculator/useHideCookieOver.ts components/pages/ContactPage.tsx components/features/contact/InlineContactForm.tsx index.css"
npx vitest run components/features/calculator tests/components/InlineContactForm.test.tsx tests/hooks/useContactForm.test.tsx tests/seo/googleProfile.test.tsx tests/scripts/ciWorkflow.test.ts --maxWorkers=2 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -aE '^ *(Test Files|Tests) |FAIL|×|Error|expected|received|Unable' | head -60
echo "STEP vitest done"
# shellcheck disable=SC2086
npx eslint $F --max-warnings 0 2>&1 | tail -20; echo "STEP eslint rc=${PIPESTATUS[0]}"
# shellcheck disable=SC2086
npx prettier --check $F 2>&1 | tail -5
npx tsc --noEmit -p tsconfig.json 2>&1 | grep 'error TS' | head -10; echo "STEP tsc done"
