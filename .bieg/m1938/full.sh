#!/usr/bin/env bash
# MIX-1938 full check (wzór .bieg/m1902/full.sh): npm ci; strażnik auditTime; vitest related;
# eslint; prettier; tsc root + functions; vitest run; build; mutanty m1938 + m1790 + m1816.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1938/full
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
RC=0
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; [ $rc -ne 0 ] && RC=1; return 0; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log"; }
tests_line() { clean "$1" | grep -aE '^ *(Test Files|Tests) ' | sed "s/^/  $1: /"; }
fails() { clean "$1" | grep -aE '^ *(FAIL|×) ' | head -20 | sed "s/^/  $1 fail: /"; }
restore_generated() { git checkout -- public/sitemap.xml 2>/dev/null; git status --porcelain | grep -v '^?? ' | sed 's/^/  dirty: /'; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
restore_generated
T=tests/content/auditTime.test.ts
step guard npx vitest run $T
tests_line guard; fails guard
step related npx vitest related $T --run --maxWorkers=2
tests_line related; fails related
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
clean eslint | grep -aE 'error|warning|problem|^/' | head -20 | sed 's/^/  eslint: /'
step prettier npx prettier --check $T
clean prettier | tail -3 | sed 's/^/  prettier: /'
step shellcheck-syntax bash -n .bieg/m1938/mut.sh .bieg/m1790/mut.sh .bieg/m1816/mut.sh
step tsc-root npx tsc --noEmit -p tsconfig.json
echo "  tsc-root errors: $(grep -c 'error TS' "$OUT/tsc-root.log")"
grep -a 'error TS' "$OUT/tsc-root.log" | head -10 | sed 's/^/  tsc-root: /'
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
echo "  tsc-functions errors: $(grep -c 'error TS' "$OUT/tsc-functions.log")"
step vitest npx vitest run --maxWorkers=2
tests_line vitest; fails vitest
step build npm run build
clean build | grep -aE 'Size|error' | head -4 | sed 's/^/  build: /'
restore_generated
echo "--- mutanty MIX-1938 (formy F1-F9 i strażnik)"
bash .bieg/m1938/mut.sh > "$OUT/mut-m1938.log" 2>&1; mrc=$?; cat "$OUT/mut-m1938.log"; echo "MUT m1938 rc=$mrc"; [ $mrc -ne 0 ] && RC=1; grep -qE 'PRZEZYL|NIEJASNY| NOMATCH$' "$OUT/mut-m1938.log" && { echo "MUT m1938: mutant przezyl/niejasny/nomatch"; RC=1; }
echo "--- mutanty MIX-1790 (kotwica M17 po poprawce)"
bash .bieg/m1790/mut.sh > "$OUT/mut-m1790.log" 2>&1; mrc=$?; cat "$OUT/mut-m1790.log"; echo "MUT m1790 rc=$mrc"; [ $mrc -ne 0 ] && RC=1; grep -qE 'PRZEZYL|NIEJASNY| NOMATCH$' "$OUT/mut-m1790.log" && { echo "MUT m1790: mutant przezyl/niejasny/nomatch"; RC=1; }
echo "--- mutanty MIX-1816 (kotwica F2 po poprawce)"
bash .bieg/m1816/mut.sh > "$OUT/mut-m1816.log" 2>&1; mrc=$?; cat "$OUT/mut-m1816.log"; echo "MUT m1816 rc=$mrc"; [ $mrc -ne 0 ] && RC=1; grep -qE 'PRZEZYL|NIEJASNY| NOMATCH$' "$OUT/mut-m1816.log" && { echo "MUT m1816: mutant przezyl/niejasny/nomatch"; RC=1; }
echo "FULL RC=$RC"
exit $RC
