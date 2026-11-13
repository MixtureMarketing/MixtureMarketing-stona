#!/usr/bin/env bash
# MIX-1280: szybki bieg dwoch plikow testowych, wypisuje nazwy FAIL i AssertionError. Z korzenia repo.
set -u
npm ci --legacy-peer-deps --no-audit --no-fund > .bieg/r/npm-ci-short.log 2>&1; echo "npm-ci rc=$?"
npx vitest run --maxWorkers=2 tests/seo/aiSystemsArticle.test.tsx tests/routes.test.ts tests/seo/internalLinksTrailingSlash.test.ts tests/seo/orphanPages.test.ts tests/seo/sitemapLastmod.test.ts tests/seo/articleAuthorDates.test.tsx tests/components/articleInlineHtml.test.ts > .bieg/r/short.log 2>&1; echo "vitest rc=$?"
sed 's/\x1b\[[0-9;]*m//g' .bieg/r/short.log | grep -aE "FAIL|AssertionError|Error:|Test Files|Tests |expected" | head -30
