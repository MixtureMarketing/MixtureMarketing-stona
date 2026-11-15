#!/usr/bin/env bash
# MIX-1724: the 4 files red in the full run, on HEAD and on base 9064ba5 (HEAD tree with to-base.patch applied), 2 runs each.
set -u
OUT=.bieg/mix1724/out; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
F="components/portal/admin/estimation/pdf/render.test.ts components/portal/admin/estimation/wizard/e2e-f1b.test.tsx tests/components/mobileMenuB.test.tsx tests/components/PreonboardModal.test.tsx"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
run() { # tag
  for i in 1 2; do
    npx vitest run --maxWorkers=2 $F > "$OUT/four-$1-$i.log" 2>&1; echo "FOUR $1 run$i rc=$?"
    sed 's/\x1b\[[0-9;]*m//g' "$OUT/four-$1-$i.log" | grep -aE "Test Files|Tests |FAIL" | sort -u | head -n 12 | cut -c1-220
  done
}
run head
git apply .bieg/mix1724/to-base.patch && echo "base tree applied (9064ba5 for components, tests)" || { echo "apply failed"; exit 2; }
run base
echo "### end"
