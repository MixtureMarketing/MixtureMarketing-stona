#!/usr/bin/env bash
# MIX-1934 szybki bieg: npm ci, prettier --write na zmienionych (diff wraca w logu), testy celowane,
# eslint, tsc root i functions. Ścieżki względne, z katalogu repo.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1934/szybki; mkdir -p "$OUT"
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; return 0; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log"; }
CH="$(cat .bieg/m1934/zmienione.txt)"
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
git checkout -- public/sitemap.xml 2>/dev/null
# shellcheck disable=SC2086
step prettier npx prettier --write $(echo $CH | tr ' ' '\n' | grep -E '\.(ts|tsx|mjs|yml)$')
echo "PRETTIER-DIFF-BEGIN"; git diff; echo "PRETTIER-DIFF-END"
step vitest-t npx vitest run functions/api/estimation/turnstileTestMode.test.ts tests/scripts/turnstileKeyGuard.test.ts tests/scripts/ciWorkflow.test.ts functions/api/contact-submit.test.ts functions/api/contact-submit.token.test.ts functions/api/estimation/public-quote.z2.test.ts --maxWorkers=2
clean vitest-t | grep -aE '^ *(Test Files|Tests) |^ *(FAIL|×) |AssertionError|Error:' | head -60
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
clean eslint | grep -aE 'error|warning|^/' | head -30
step tsc-root npx tsc --noEmit -p tsconfig.json
grep -a 'error TS' "$OUT/tsc-root.log" | head -20
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
grep -a 'error TS' "$OUT/tsc-functions.log" | head -20
