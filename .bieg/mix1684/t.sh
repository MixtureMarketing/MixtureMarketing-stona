#!/usr/bin/env bash
# MIX-1684: bieg celowany (npm ci, prettier, eslint zmienionych, tsc, vitest related, probe + harness form ataku,
# check-llms na pliku z repo) i mutanty z vitest (VITEST=1 mut.sh, najpierw bieg bazowy). Z korzenia repo.
set -u
OUT=.bieg/r/mix1684; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
F="scripts/lib/llms.js scripts/check-llms.mjs tests/seo/llmsTxt.test.ts"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) porcelain=$(git status --porcelain -- scripts tests | wc -l)"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/t-npm.log" 2>&1; echo "npm-ci rc=$?"
npx prettier --check $F > "$OUT/t-prettier.log" 2>&1; echo "prettier rc=$?"; tail -n 5 "$OUT/t-prettier.log"
npx eslint --max-warnings 0 $F > "$OUT/t-eslint.log" 2>&1; echo "eslint rc=$?"; tail -n 30 "$OUT/t-eslint.log"
npx tsc --noEmit -p tsconfig.json > "$OUT/t-tsc.log" 2>&1; echo "tsc-root rc=$?"; grep -E "error TS" "$OUT/t-tsc.log" | head -n 20
npx vitest related scripts/lib/llms.js tests/seo/llmsTxt.test.ts --run --maxWorkers=2 > "$OUT/t-vitest.log" 2>&1; echo "vitest-related rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/t-vitest.log" | grep -aoE "(✓|❯|×) [^ ]+\.test\.[a-z]+" | sort -u
sed 's/\x1b\[[0-9;]*m//g' "$OUT/t-vitest.log" | grep -aE "Test Files|Tests |FAIL|AssertionError|Expected|Received|^\s+[-+] " | head -n 80
node .bieg/mix1684/probe.mjs . > "$OUT/t-probe.log" 2>&1; echo "probe rc=$? $(tail -n 1 "$OUT/t-probe.log")"
for F in .bieg/mix1670/formy-v1662.txt .bieg/mix1684/formy-v1670.txt; do node .bieg/mix1684/attack.mjs . "$F" > "$OUT/t-attack.log" 2>&1; echo "attack $F rc=$?"; grep -E "TOTAL" "$OUT/t-attack.log" | cut -c1-300; done
EXTRA_HIDDEN=/modern-cloud-platform/,/offline-profile-flow/ node .bieg/mix1684/attack.mjs . .bieg/mix1684/formy-v1670-b.txt > "$OUT/t-attack-b.log" 2>&1; echo "attack-b rc=$?"; grep -E "TOTAL" "$OUT/t-attack-b.log" | cut -c1-300
node scripts/check-llms.mjs > "$OUT/t-real.log" 2>&1; echo "check-llms rc=$? $(tail -n 1 "$OUT/t-real.log")"
if [ "${MUT:-1}" = 1 ]; then VITEST=1 bash .bieg/mix1684/mut.sh; fi
