#!/usr/bin/env bash
# MIX-1736: full check + W7/W8 mutants + production-build (switch OFF) measurement on the COMMITTED tree.
# Relative paths only; cloud-safe. Usage: bash .bieg/mix1736/gate.sh (repo root; npm ci --legacy-peer-deps)
set -u
OUT=.bieg/mix1736/out; mkdir -p "$OUT"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) status=$(git status --porcelain -- . ':!.bieg' | wc -l)"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; echo "$n rc=$?"; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
CH="scripts/audit-proportions.mjs scripts/lib/proportions.mjs tests/scripts/proportionsGate.test.ts .bieg/mix1736"
step prettier npx prettier --check scripts/audit-proportions.mjs scripts/lib/proportions.mjs tests/scripts/proportionsGate.test.ts
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
step tsc-root npx tsc --noEmit -p tsconfig.json
head -n 8 "$OUT/tsc-root.log" | cut -c1-200
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests |FAIL" | head -n 20
# K2: production build (switch OFF, env var unset) measured by the gate; the log must show layout=classic
( unset VITE_MM_VIEW_TRANSITIONS; step build-off npm run build )
tail -n 3 "$OUT/build-off.log" | cut -c1-160
node scripts/audit-proportions.mjs dist > "$OUT/audit-off.log" 2>&1; echo "GATE off rc=$?"; cut -c1-200 "$OUT/audit-off.log"
grep -aq "layout=classic" "$OUT/audit-off.log" && echo "ASSERT off layout=classic ok" || echo "ASSERT FAIL: off is not classic"
VITE_MM_VIEW_TRANSITIONS=1 step build-on npm run build
node scripts/audit-proportions.mjs dist > "$OUT/audit-on.log" 2>&1; echo "GATE on rc=$?"; grep -a "layout=" "$OUT/audit-on.log" | cut -c1-120
git checkout -- public/sitemap.xml 2>/dev/null
[ -z "$(git status --porcelain -- . ':!.bieg')" ] || { echo "tree not clean before mutants: stop"; git status --porcelain -- . ':!.bieg'; exit 2; }
T=tests/scripts/proportionsGate.test.ts
L=scripts/lib/proportions.mjs
S=scripts/audit-proportions.mjs
mutate() { # name file sed-expr ; unit run on the proportion test file, restore only that file
  local name=$1 file=$2 expr=$3
  sed -i "$expr" "$file"
  if git diff --quiet -- "$file"; then echo "MUT $name NOOP"; return; fi
  echo "MUT $name line: $(git diff -U0 -- "$file" | grep -a '^+[^+]' | head -n 1 | cut -c1-150)"
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$name.log" 2>&1; local ru=$?
  git checkout -- "$file"
  local ul; ul=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE "AssertionError|Error:|FAIL" | head -n 1 | cut -c1-170)
  local res="przezyl"; [ $ru -ne 0 ] && res="zabity"
  echo "MUT $name unit_rc=$ru => $res | $ul"
}
mutate W7-lib-unmeasured-rc0 $L 's#if (reasons.length) return unmeasured ? 2 : 1;#if (reasons.length) return unmeasured ? 0 : 1;#'
mutate W7-script-inline-exit $S 's#^process.exit(exitCode(reasons, rows, VPS.length));#process.exit(reasons.length ? (unmeasured ? 0 : 1) : 0);#'
mutate W8-lib-errors-ignored $L 's#if (Array.isArray(pageErrors) \&\& pageErrors.length)#if (false \&\& Array.isArray(pageErrors) \&\& pageErrors.length)#'
mutate W8-script-errors-ignored $S 's#^      applyPageErrors(row, pageErrors);#      if (false \&\& pageErrors.length) row.error = "x";#'
mutate O1-lib-pass-ignores-unmeasured $L 's#  return unmeasured ? 2 : 0;#  return 0;#'
mutate O2-lib-rowcount-gt $L 's#rows.length !== expectedCount#rows.length > expectedCount#'
mutate O3-lib-row-error-dropped $L 's#rows.some((r) => !r || r.error)#rows.some((r) => !r)#'
mutate O4-lib-criterion-fail-always-1 $L 's#return unmeasured ? 2 : 1;#return 1;#'
git status --porcelain -- . ':!.bieg'
echo "### end"
