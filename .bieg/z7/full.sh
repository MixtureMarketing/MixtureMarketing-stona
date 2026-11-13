#!/usr/bin/env bash
# Full check of the integration branch: typecheck, lint, vitest; then vitest on the base commit.
# Run from the repo root. Outputs go to .bieg/z7/. Relative paths only.
set -u
OUT=.bieg/z7
BASE=${BASE:-6fd1360}
: > "$OUT/summary.txt"
step() { # name, command...
  local n=$1; shift
  "$@" > "$OUT/$n.log" 2>&1; local rc=$?
  echo "$n rc=$rc" | tee -a "$OUT/summary.txt"
}
echo "HEAD=$(git rev-parse --short HEAD)" | tee -a "$OUT/summary.txt"
step npm-ci npm ci --no-audit --no-fund
step tsc-functions npx tsc -p functions/tsconfig.json
step tsc-root npx tsc -p tsconfig.json
step eslint npx eslint . --max-warnings 0
step vitest-head npx vitest run --maxWorkers=2
grep -E "Test Files|Tests " "$OUT/vitest-head.log" | tee -a "$OUT/summary.txt"
if [ "${SKIP_BASE:-0}" != 1 ]; then
  mkdir -p "$OUT/base"
  git archive "$BASE" | tar -x -C "$OUT/base"
  ln -sfn ../../../node_modules "$OUT/base/node_modules"
  ( cd "$OUT/base" && npx vitest run --maxWorkers=2 > ../vitest-base.log 2>&1; echo "vitest-base rc=$?" >> ../summary.txt )
  grep -E "Test Files|Tests " "$OUT/vitest-base.log" | tee -a "$OUT/summary.txt"
fi
echo DONE >> "$OUT/summary.txt"
