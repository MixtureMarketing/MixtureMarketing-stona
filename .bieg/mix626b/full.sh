#!/usr/bin/env bash
# Full check on the committed tree: vitest (whole suite), tsc (functions, root), eslint. Logs in .bieg/mix626b/.
# Run from the repo root through the lock. Relative paths only. One tsc at a time.
set -u
OUT=.bieg/mix626b
: > "$OUT/summary.txt"
step() { # name, command...
  local n=$1; shift
  "$@" > "$OUT/$n.log" 2>&1; local rc=$?
  echo "$n rc=$rc" | tee -a "$OUT/summary.txt"
}
echo "HEAD=$(git rev-parse --short HEAD)" | tee -a "$OUT/summary.txt"
step vitest npx vitest run --maxWorkers=2
grep -E "Test Files|Tests " "$OUT/vitest.log" | tee -a "$OUT/summary.txt"
step tsc-functions npx tsc -p functions/tsconfig.json
step tsc-root npx tsc -p tsconfig.json
step eslint npx eslint . --max-warnings 0
echo DONE >> "$OUT/summary.txt"
