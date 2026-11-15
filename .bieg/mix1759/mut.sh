#!/usr/bin/env bash
# MIX-1759: mutants of the "no own transition after the browser's own back transition" condition, against the
# targeted unit tests; plus BASE = both files of 1ebc9f0 (.bieg/mix1759/base-1ebc9f0): the new tests must be RED there.
# Lines: MUT <id> applied=<0|1> vitest-rc=<rc> result=<zabity|przezyl|nie-zastosowany>. Baseline must be rc 0.
# Exit 0 only when the baseline is green, BASE is red and every mutant was applied and killed (fail-closed).
set -u
OUT=.bieg/r/mix1759m; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
T="tests/utils/caseStudyBack.test.ts tests/utils/caseStudyBackBrowser.test.ts tests/utils/caseStudyBackUa.test.ts"
BB=utils/caseStudyBackBrowser.ts
CB=utils/caseStudyBack.ts
UA=utils/caseStudyBackUa.ts
FAILS=0
vt() { npx vitest run $T --maxWorkers=2 > "$OUT/$1.log" 2>&1; local rc=$?; sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log" | grep -aE "Tests " | tail -n 1 | sed "s/^/$1: /"; return $rc; }
vt baseline; brc=$?; echo "BASELINE vitest-rc=$brc"; [ $brc -eq 0 ] || FAILS=$((FAILS + 1))
# BASE: the tree of 1ebc9f0 for both changed files
(cd .bieg/mix1759/base-1ebc9f0 && sha256sum -c --quiet SHA256SUMS) || { echo "BASE checksum failed"; FAILS=$((FAILS + 1)); }
cp "$BB" "$OUT/bb.orig"; cp "$CB" "$OUT/cb.orig"
cp .bieg/mix1759/base-1ebc9f0/caseStudyBackBrowser.ts "$BB"; cp .bieg/mix1759/base-1ebc9f0/caseStudyBack.ts "$CB"
vt base; rc=$?
sed 's/\x1b\[[0-9;]*m//g' "$OUT/base.log" | grep -aE "^ +(×|✗|FAIL)|FAIL " | head -n 12 | sed 's/^/base-fail: /'
if [ $rc -ne 0 ]; then echo "BASE 1ebc9f0 vitest-rc=$rc result=czerwony (expected)"; else echo "BASE 1ebc9f0 vitest-rc=0 result=zielony (tests do not see the bug)"; FAILS=$((FAILS + 1)); fi
cp "$OUT/bb.orig" "$BB"; cp "$OUT/cb.orig" "$CB"
cmp -s "$BB" "$OUT/bb.orig" && cmp -s "$CB" "$OUT/cb.orig" || { echo "RESTORE FAILED base"; FAILS=$((FAILS + 1)); }
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
mutant M1-loose-eq "$UA" 's/hasUAVisualTransition === true;/hasUAVisualTransition == true;/'
mutant M2-truthy "$UA" 's/return (e as PopStateEvent).hasUAVisualTransition === true;/return !!(e as PopStateEvent).hasUAVisualTransition;/'
mutant M3-const-false "$UA" 's/return (e as PopStateEvent).hasUAVisualTransition === true;/return false;/'
mutant M4-inverted-flag "$UA" 's/hasUAVisualTransition === true;/hasUAVisualTransition !== true;/'
mutant M5-no-condition "$CB" 's/ \&\& i.hero \&\& !i.uaTransition;/ \&\& i.hero;/'
mutant M6-inverted-condition "$CB" 's/ \&\& i.hero \&\& !i.uaTransition;/ \&\& i.hero \&\& i.uaTransition;/'
mutant M7-none-plan "$CB" "s/^  const ok = i.supported/  if (i.uaTransition) return { kind: 'none' };\n  const ok = i.supported/"
mutant M8-flag-not-wired "$BB" 's/^      uaTransition: ua,/      uaTransition: false,/'
mutant M9-hold-inverted "$BB" 's/^    if (ua) holdListRendered(win, doc);/    if (!ua) holdListRendered(win, doc);/'
mutant M10-no-hold "$BB" '/^    if (ua) holdListRendered(win, doc);/d'
mutant M11-hold-overwrites "$UA" '/^  if (root.hasAttribute(VT_ATTR)) return;/d'
mutant M12-remove-any-value "$UA" 's/^    if (root.getAttribute(VT_ATTR) === VT_UA_VALUE) root.removeAttribute(VT_ATTR);/    root.removeAttribute(VT_ATTR);/'
mutant M13-hold-too-short "$UA" 's/^export const UA_HOLD_MS = RESTORE_MAX_MS + 500;/export const UA_HOLD_MS = RESTORE_MAX_MS - 500;/'
# r2: the plain path (no browser transition) must stay the 1ebc9f0 path: the hold only behind `if (ua)` (O4 of verdict r1)
mutant M14-hold-always "$BB" 's/^    if (ua) holdListRendered(win, doc);/    holdListRendered(win, doc);/'
mutant M15-hold-on-restore "$BB" "s/^    if (ua) holdListRendered(win, doc);/    if (ua || plan.kind === 'restore') holdListRendered(win, doc);/"
mutant M16-hold-missing-field "$BB" 's/^    const ua = browserPlayedBack(e);/    const ua = (e as PopStateEvent).hasUAVisualTransition !== false;/'
mutant M17-plain-no-holdRecording "$BB" '/^    holdRecording();/d'
mutant M18-plain-no-manual "$BB" '/^    manualRestorationFor(win);/d'
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | wc -l)"
echo "MUT-MIX1759 failchecks=$FAILS"
echo "### end"
[ "$FAILS" -eq 0 ]
