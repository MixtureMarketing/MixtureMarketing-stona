#!/usr/bin/env bash
# MIX-1613 r2: testy dotkniete zmiana + formatowanie, eslint i tsc zmienionych plikow. Sciezki wzgledne.
set -u
OUT=.bieg/r/m1613
mkdir -p "$OUT"
echo "legacy-peer-deps=true" > .npmrc
npm ci --no-audit --no-fund > "$OUT/rel-ci.log" 2>&1; echo "npm-ci rc=$?"
F="hooks/cmsSnapshotSchema.ts hooks/useCmsDocument.ts services/cms/articleService.ts tests/hooks/cmsSnapshotShape.test.tsx tests/scripts/ciWorkflow.test.ts tests/scripts/ciDeployGuard.test.ts"
npx prettier --check $F > "$OUT/rel-prettier.log" 2>&1; echo "prettier rc=$?"; head -n 12 "$OUT/rel-prettier.log"
npx eslint $F --report-unused-disable-directives --max-warnings 0 > "$OUT/rel-eslint.log" 2>&1; echo "eslint rc=$?"; head -n 25 "$OUT/rel-eslint.log" | cut -c1-200
bash -n scripts/ci-deploy-guard.sh; echo "bash-n rc=$?"
npx shellcheck scripts/ci-deploy-guard.sh > "$OUT/rel-shellcheck.log" 2>&1; echo "shellcheck rc=$?"; head -n 12 "$OUT/rel-shellcheck.log"
npx tsc --noEmit -p tsconfig.json > "$OUT/rel-tsc.log" 2>&1; echo "tsc rc=$?"; head -n 15 "$OUT/rel-tsc.log"
npx vitest run --maxWorkers=2 tests/hooks tests/services tests/scripts tests/components/KnowledgeBaseSnapshot.test.tsx tests/components/PortfolioPageCms.test.tsx tests/components/cmsSnapshotCanonical.test.tsx tests/components/cmsSnapshot.test.tsx tests/components/IndustryHub.test.tsx > "$OUT/rel.log" 2>&1; echo "vitest rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/rel.log" | grep -aE "Test Files|Tests |FAIL|✗|×|AssertionError|Error:" | head -n 40
