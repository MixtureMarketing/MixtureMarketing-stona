#!/usr/bin/env bash
# MIX-1675: testy dotkniete zmiana (npm ci + vitest celowany + tsc + eslint + prettier). Z korzenia repo.
set -u
OUT=.bieg/r/mix1675u; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"
npx vitest run --maxWorkers=2 tests/utils/caseStudyBack.test.ts tests/utils/caseStudyBackTransition.test.ts tests/utils/caseStudyBackBrowser.test.ts tests/components/scrollToTopBack.test.tsx tests/components/scrollToTopCaseStudy.test.tsx tests/components/caseStudyTransitions.test.tsx tests/utils/viewTransitions.test.ts > "$OUT/vitest.log" 2>&1; echo "vitest rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests |FAIL|AssertionError|Error:" | head -n 40
npx tsc --noEmit -p tsconfig.json > "$OUT/tsc.log" 2>&1; echo "tsc rc=$?"; grep -E "error TS" "$OUT/tsc.log" | cut -c1-200 | head -n 20
npx eslint utils components/common tests/utils tests/components scripts/probe-case-study-back.mjs --report-unused-disable-directives --max-warnings 0 > "$OUT/eslint.log" 2>&1; echo "eslint rc=$?"; tail -n 20 "$OUT/eslint.log"
F="components/common/ScrollToTop.tsx scripts/probe-case-study-back.mjs tests/components/scrollToTopBack.test.tsx tests/utils/caseStudyBack.test.ts tests/utils/caseStudyBackBrowser.test.ts tests/utils/caseStudyBackTransition.test.ts utils/caseStudyBack.ts utils/caseStudyBackBrowser.ts utils/caseStudyBackTransition.ts utils/caseStudyRestore.ts utils/caseStudyTransition.ts utils/viewTransitions.ts"
for f in $F; do npx prettier "$f" | diff -u "$f" - > "$OUT/p.diff" 2>&1 || { echo "PRETTIER DIFF $f"; head -n 40 "$OUT/p.diff"; }; done; echo "prettier done"
