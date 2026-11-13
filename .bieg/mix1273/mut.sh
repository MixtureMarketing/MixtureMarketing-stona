#!/usr/bin/env bash
# MIX-1273: mutanty scripts/lib/llms.js; kazdy: zmiana jednej linii, vitest tests/seo/llmsTxt.test.ts, przywrocenie pliku.
set -u
OUT=.bieg/r/mix1273; F=scripts/lib/llms.js
mut() {
  local name=$1 from=$2 to=$3
  node .bieg/mix1273/mutate.mjs "$F" "$from" "$to" || { echo "mutant $name: BLAD WZORCA" | tee -a "$OUT/mutants.txt"; return; }
  npx vitest run tests/seo/llmsTxt.test.ts > "$OUT/mut-$name.log" 2>&1
  rc=$?
  git checkout -- "$F"
  if [ $rc -ne 0 ]; then echo "mutant $name: zabity (rc=$rc)" | tee -a "$OUT/mutants.txt"; else echo "mutant $name: PRZEZYL" | tee -a "$OUT/mutants.txt"; fi
}
: > "$OUT/mutants.txt"
mut M1-notInSitemap-off '.filter((u) => !sitemap.has(u) && !machine.has(u))' '.filter(() => false)'
mut M2-hidden-off 'llms.filter((u) => hidden.has(u))' '[]'
mut M3-missingKey-off '.filter((u) => !llmsSet.has(u));' '.filter(() => false);'
mut M4-empty-llms-open 'if (llms.length === 0) problems.push' 'if (false) problems.push'
mut M5-empty-sitemap-open 'if (sitemap.size === 0) problems.push' 'if (false) problems.push'
mut M6-allowlist-empty "MACHINE_ALLOW = ['/sitemap.xml']" 'MACHINE_ALLOW = []'
mut M7-ok-ignores-hidden 'hiddenListed.length === 0' 'true'
mut M8-keyNotInSitemap-off 'keyNotInSitemap.length === 0 &&' 'true &&'
git status --porcelain -- "$F"
