#!/usr/bin/env bash
# MIX-1975: szybki bieg celowany: npm ci, prettier --write zmienionych (różnica w logu), eslint, tsc, vitest celowany.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
CHANGED="components/features/web-development/CustomAppProof.tsx data/content/services/web-development/custom-app.ts config/flags.ts tests/components/customAppProofPsychon.test.tsx tests/scripts/ciWorkflow.test.ts .bieg/m1975/probe.mjs"
npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1; echo "npm-ci rc=$?"
# shellcheck disable=SC2086
npx prettier --write $CHANGED > /dev/null 2>&1; echo "prettier-write rc=$?"
git diff -- $CHANGED
# shellcheck disable=SC2086
npx eslint $CHANGED --max-warnings 0 2>&1 | tail -20; echo "eslint rc=${PIPESTATUS[0]}"
npx tsc --noEmit -p tsconfig.json 2>&1 | grep 'error TS' | head; echo "tsc rc=${PIPESTATUS[0]}"
npx vitest run tests/components/customAppProofPsychon.test.tsx tests/scripts/ciWorkflow.test.ts tests/components/aiSection.test.tsx 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -aE '^ *(Test Files|Tests) |FAIL|×|Error|expected' | head -40
