#!/usr/bin/env bash
# MIX-1268: pelna kontrola (prettier na plikach zmiany, eslint, tsc, tsc functions, vitest run,
# build z VITE_MM_POWIAZANE=1), liczenie bloku "Powiazane" w dist/ i mutanty. Sciezki wzgledne.
set -u
OUT=.bieg/r/m1268
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
CZERWONE=""
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local r=$?; echo "$n rc=$r"; [ $r -eq 0 ] || CZERWONE="$CZERWONE $n"; }
echo "git HEAD $(git rev-parse HEAD 2>/dev/null || echo brak)"
echo "legacy-peer-deps=true" > .npmrc
step npm-ci npm ci --no-audit --no-fund
mapfile -t F < .bieg/m1268/pliki.txt
step prettier npx prettier --check "${F[@]}"
tail -n 5 "$OUT/prettier.log"
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
tail -n 15 "$OUT/eslint.log" | cut -c1-200
step tsc-root npx tsc --noEmit -p tsconfig.json
head -n 15 "$OUT/tsc-root.log"
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
head -n 15 "$OUT/tsc-functions.log"
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests |FAIL|✗|×" | head -n 30
VITE_MM_POWIAZANE=1 step build npm run build
tail -n 8 "$OUT/build.log" | cut -c1-200
step policz node .bieg/m1268/policz-linki.mjs dist
cat "$OUT/policz.log"
git checkout -- .npmrc 2>/dev/null
echo "--- mutanty"
bash .bieg/m1268/mut.sh
git checkout -- .npmrc 2>/dev/null
echo "PELNA KONTROLA m1268: czerwone=[${CZERWONE# }]"
[ -z "$CZERWONE" ]
