#!/usr/bin/env bash
# MIX-1745: mutants of the "back starts from the header at the top" fix, against the targeted unit tests.
# Usage: bash .bieg/mix1745/mut.sh   (from the repo root; each mutant changes one file, which is restored from a copy)
# Lines: MUT <id> applied=<0|1> vitest-rc=<rc> result=<zabity|przezyl|nie-zastosowany>. Baseline must be rc 0.
# Exit 0 only when the baseline is green and every mutant was applied and killed (fail-closed).
set -u
OUT=.bieg/r/mix1745m; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
T="tests/utils/caseStudyToTop.test.ts tests/utils/caseStudyBackBrowser.test.ts"
BB=utils/caseStudyBackBrowser.ts
RS=utils/caseStudyRootScroll.ts
FAILS=0
vt() { npx vitest run $T --maxWorkers=2 > "$OUT/$1.log" 2>&1; local rc=$?; sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log" | grep -aE "Tests " | tail -n 1 | sed "s/^/$1: /"; return $rc; }
vt baseline; brc=$?; echo "BASELINE vitest-rc=$brc"; [ $brc -eq 0 ] || FAILS=$((FAILS + 1))
# mutant <id> <file> <sed program>
mutant() {
  local id=$1 f=$2 prog=$3
  cp "$f" "$OUT/$id.orig"
  sed -i "$prog" "$f"
  if cmp -s "$f" "$OUT/$id.orig"; then
    echo "MUT $id applied=0 result=nie-zastosowany"; FAILS=$((FAILS + 1))
  else
    vt "$id"; local rc=$?
    if [ $rc -ne 0 ]; then echo "MUT $id applied=1 vitest-rc=$rc result=zabity"
    else echo "MUT $id applied=1 vitest-rc=0 result=przezyl"; FAILS=$((FAILS + 1)); fi
  fi
  cp "$OUT/$id.orig" "$f"
  cmp -s "$f" "$OUT/$id.orig" || { echo "RESTORE FAILED $f"; FAILS=$((FAILS + 1)); }
}
# M1: no call (the tree of 9067bc4)
mutant M1-no-call "$BB" '/^    caseStudyToTop(win);/d'
# M2: call after the transition started (after the old snapshot)
mutant M2-after-start "$BB" '/^    caseStudyToTop(win);/d; s/^    void runCaseStudyBackTransition({$/    queueMicrotask(() => caseStudyToTop(win));\n    void runCaseStudyBackTransition({/'
# M3: threshold far down (only very long scrolls)
mutant M3-threshold "$RS" 's/win.scrollY > 0)/win.scrollY > 1500)/'
# M4: smooth instead of instant (the page would still move during the snapshot)
mutant M4-smooth "$RS" "s/top: 0, left: win.scrollX, behavior: 'instant'/top: 0, left: win.scrollX, behavior: 'smooth'/"
# M5: also on the plain restore path (no transition): call before the plan check
mutant M5-restore-path "$BB" "/^    caseStudyToTop(win);/d; s/^    if (plan.kind !== 'transition' || !hero) return;/    caseStudyToTop(win);\n    if (plan.kind !== 'transition' || !hero) return;/"
# M6: no try/catch (a throwing scrollTo escapes and stops the back)
mutant M6-no-catch "$RS" '/^export function caseStudyToTop/,/^}/{s/^  try {$/  {/; s/^  } catch {$/  } if (0) {/}'
# M7: horizontal position reset to 0
mutant M7-left-0 "$RS" "s/top: 0, left: win.scrollX, behavior/top: 0, left: 0, behavior/"
# M8: target not the top
mutant M8-top-100 "$RS" "s/scrollTo({ top: 0, left: win.scrollX/scrollTo({ top: 100, left: win.scrollX/"
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | wc -l)"
echo "MUT-MIX1745 failchecks=$FAILS"
echo "### end"
[ "$FAILS" -eq 0 ]
