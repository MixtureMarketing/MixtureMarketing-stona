#!/usr/bin/env bash
# MIX-1758: jeden bieg w zamku (z korzenia repo, na zatwierdzonym drzewie): mutanty O7b, O7c (bez zagniezdzonego
# zamka), testy dotkniete zmiana (vitest related), tsc korzenia (obejmuje tests/**). rc 0 tylko gdy: oba mutanty
# zabite, related rc 0, tsc rc 0, drzewo czyste na koniec.
set -u
OUT=.bieg/r/mix1758z; mkdir -p "$OUT"
FAIL=0
echo "HEAD=$(git rev-parse HEAD)"
MUT_DIRECT=1 MUT_IDS="O7b O7c" bash .bieg/mix1758/mut.sh | tee "$OUT/mut.txt"
[ "$(grep -c '^MUT O7[bc] zabity' "$OUT/mut.txt")" -eq 2 ] || { echo "FAILCHECK mutanty O7b/O7c nie oba zabite"; FAIL=1; }
npx vitest related tests/utils/caseStudyBackBrowser.test.ts --run --maxWorkers=2 > "$OUT/related.log" 2>&1; rc=$?
echo "related rc=$rc $(sed 's/\x1b\[[0-9;]*m//g' "$OUT/related.log" | grep -aE '^ +(Test Files|Tests) ' | tr -s ' ' | paste -sd ';')"
[ $rc -eq 0 ] || FAIL=1
npx tsc --noEmit -p tsconfig.json > "$OUT/tsc.log" 2>&1; rc=$?
echo "tsc-root rc=$rc bledy=$(grep -c 'error TS' "$OUT/tsc.log")"
[ $rc -eq 0 ] || FAIL=1
P=$(git status --porcelain | grep -vc '^?? ')
echo "porcelain: $P"
[ "$P" -eq 0 ] || FAIL=1
echo "RESZTA-MIX1758 fail=$FAIL"
exit $FAIL
