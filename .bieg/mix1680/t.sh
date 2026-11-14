#!/usr/bin/env bash
# MIX-1680: bieg celowany (npm ci, prettier, eslint, tsc, vitest testow dotknietych zmiana). Z korzenia repo.
set -u
OUT=.bieg/r/mix1680t; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm.log" 2>&1; echo "npm-ci rc=$?"
CH="routes.js config/routes.tsx components/articles/AiSystemsArticle.tsx data/content/articles/ai-systems.ts services/cms/legacyArticles.ts scripts/lib/llms.js tests/seo/aiSystemsArticle.test.tsx tests/seo/aiSystemsArticleVisuals.test.tsx tests/seo/aiSystemsArticleListing.test.tsx tests/seo/articleAuthorDates.test.tsx"
npx prettier --check $CH > "$OUT/prettier.log" 2>&1; echo "prettier rc=$?"; tail -n 12 "$OUT/prettier.log"
if [ "${FIXFMT:-0}" = 1 ]; then npx prettier --write $CH >/dev/null 2>&1; git diff --stat; git diff > "$OUT/fmt.diff"; fi
npx eslint --max-warnings 0 $CH > "$OUT/eslint.log" 2>&1; echo "eslint rc=$?"; tail -n 30 "$OUT/eslint.log"
npx tsc --noEmit -p tsconfig.json > "$OUT/tsc.log" 2>&1; echo "tsc-root rc=$?"; grep -E "error TS" "$OUT/tsc.log" | head -n 20
npx vitest related $CH --run --maxWorkers=2 > "$OUT/vitest.log" 2>&1; rc=$?; echo "vitest-related rc=$rc"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE -B2 -A22 "AssertionError|Error:" | head -n 140
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE 'Test Files|Tests '
