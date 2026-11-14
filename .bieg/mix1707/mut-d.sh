#!/usr/bin/env bash
# MIX-1707 r2: only the D mutants (new conditions of r2), unit level; same mut() as mut.sh.
set -u
OUT=.bieg/r/mix1707d; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
PR="$OUT/pristine"; mkdir -p "$PR"
for f in utils/caseStudyBack.ts utils/caseStudyGeneration.ts utils/caseStudyRestore.ts utils/caseStudyBackTransition.ts utils/caseStudyBackOptions.ts utils/caseStudyBackBrowser.ts utils/caseStudyBackSkip.ts components/common/ScrollToTop.tsx; do mkdir -p "$PR/$(dirname $f)"; cp "$f" "$PR/$f"; done
T="tests/utils/caseStudyBackBrowser.test.ts tests/utils/caseStudyBackTransition.test.ts"
O=utils/caseStudyBackOptions.ts; K=utils/caseStudyBackSkip.ts
mut() {
  local name=$1 f=$2 from=$3 to=$4
  cmp -s "$f" "$PR/$f" || { echo "mutant $name: BLAD, plik nie jest wzorcem przed mutantem" | tee -a "$OUT/mutants.txt"; return; }
  node .bieg/mix1657/mutate.mjs "$f" "$from" "$to" || { echo "mutant $name: BLAD WZORCA" | tee -a "$OUT/mutants.txt"; return; }
  cmp -s "$f" "$PR/$f" && { echo "mutant $name: BLAD, mutant rowny wzorcowi" | tee -a "$OUT/mutants.txt"; return; }
  npx vitest run $T --maxWorkers=2 > "$OUT/mut-$name.log" 2>&1
  local rc=$?
  cp "$PR/$f" "$f"; cmp -s "$f" "$PR/$f" || echo "mutant $name: BLAD PRZYWROCENIA" | tee -a "$OUT/mutants.txt"
  local t; t=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
  local k; k=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ FAIL ' | head -n 1 | cut -c1-150)
  if [ $rc -ne 0 ]; then echo "mutant $name: zabity (rc=$rc;$t) $k" | tee -a "$OUT/mutants.txt"; else echo "mutant $name: PRZEZYL ($t)" | tee -a "$OUT/mutants.txt"; fi
}
# baseline: celowane testy na wzorcu musza byc zielone, inaczej mutanty nic nie mowia
npx vitest run $T --maxWorkers=2 > "$OUT/baseline.log" 2>&1; BRC=$?
echo "baseline rc=$BRC $(sed 's/\x1b\[[0-9;]*m//g' "$OUT/baseline.log" | grep -aE '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ';')"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/baseline.log" | grep -aE '^ FAIL |AssertionError|^ +× ' | head -n 30
[ $BRC -eq 0 ] || { echo "BASELINE RED: mutanty pominiete"; exit 3; }
# MIX-1707 r2: the router gets an unclaimed popstate only after the skipped callback released paint
mut D1-no-defer "$K" '  e.stopImmediatePropagation();
  const gen' '  const gen'
mut D2-no-generation-check "$K" '    if (currentGeneration() === gen) handToRouter();' '    handToRouter();'
mut D3-generation-inverted "$K" '    if (currentGeneration() === gen) handToRouter();' '    if (currentGeneration() !== gen) handToRouter();'
mut D4-no-release-cap "$K" '      const timer = setTimeout(resolve, releaseMs);' '      const timer = setTimeout(() => undefined, releaseMs);'
mut D5-release-cap-0 "$O" 'export const BACK_RELEASE_MAX_MS = 100;' 'export const BACK_RELEASE_MAX_MS = 0;'
mut D6-release-on-success-only "$K" '      t.updateCallbackDone.then(done, done);' '      t.updateCallbackDone.then(done);'
mut D7-no-transition-deferred "$K" '  if (released === null) return false;' '  if (released === null) {
    e.stopImmediatePropagation();
    return false;
  }'
mut D8-hand-over-twice "$K" '    if (currentGeneration() === gen) handToRouter();' '    if (currentGeneration() === gen) handToRouter();
    handToRouter();'
for f in utils/caseStudyBackOptions.ts utils/caseStudyBackSkip.ts; do cmp "$f" "$PR/$f" || echo "NIEZGODNE z wzorcem: $f"; done
echo "mutanty: $(grep -c zabity "$OUT/mutants.txt") zabite, $(grep -c PRZEZYL "$OUT/mutants.txt") przezylo, $(grep -c BLAD "$OUT/mutants.txt") bledne"
