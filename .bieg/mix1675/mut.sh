#!/usr/bin/env bash
# MIX-1675: mutanty powrotu z realizacji. Kazdy: jedna zmiana w jednym pliku, vitest celowany,
# przywrocenie tego pliku (git checkout -- <plik>). Wymaga node_modules (npm ci wczesniej). Z korzenia repo.
set -u
OUT=.bieg/r/mix1675m; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
T="tests/utils/caseStudyBack.test.ts tests/utils/caseStudyBackTransition.test.ts tests/utils/caseStudyBackBrowser.test.ts tests/components/scrollToTopBack.test.tsx tests/components/scrollToTopCaseStudy.test.tsx tests/components/caseStudyTransitions.test.tsx"
B=utils/caseStudyBack.ts; R=utils/caseStudyRestore.ts; X=utils/caseStudyBackTransition.ts; W=utils/caseStudyBackBrowser.ts; S=components/common/ScrollToTop.tsx
mut() {
  local name=$1 f=$2 from=$3 to=$4
  node .bieg/mix1657/mutate.mjs "$f" "$from" "$to" || { echo "mutant $name: BLAD WZORCA" | tee -a "$OUT/mutants.txt"; return; }
  npx vitest run $T --maxWorkers=2 > "$OUT/mut-$name.log" 2>&1
  local rc=$?
  git checkout -- "$f"
  local t; t=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
  local k; k=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ FAIL ' | head -n 1 | cut -c1-150)
  if [ $rc -ne 0 ]; then echo "mutant $name: zabity (rc=$rc;$t) $k" | tee -a "$OUT/mutants.txt"; else echo "mutant $name: PRZEZYL ($t)" | tee -a "$OUT/mutants.txt"; fi
}
mut M1-no-restore "$B" '  return saved;' '  return null;'
mut M2-smooth-restore "$R" "win.scrollTo({ top: y, left: 0, behavior: 'instant' });" "win.scrollTo({ top: y, left: 0, behavior: 'smooth' });"
mut M3-names-kept-after "$X" '    named.forEach(clearName);' '    void 0;'
mut M4-hero-names-kept "$X" '      clearName(hero.image);' '      void 0;'
mut M5-fallback-motion-skipped "$B" 'i.supported && i.motion && !i.active' 'i.supported && !i.active'
mut M6-fallback-api-skipped "$B" 'i.supported && i.motion' 'i.motion'
mut M7-card-missing-not-skipped "$X" '      if (!card) {' '      if (false) {'
mut M8-pop-only-removed "$B" "  if (navType !== 'POP') return null;" ''
mut M9-case-study-position-recorded "$B" 'holding || !pathname || isCaseStudyRoute(pathname)' 'holding || !pathname'
mut M10-top-after-restore "$S" 'pathChanged && restoredFor.current !== pathname' 'pathChanged'
mut M11-no-wait-for-height "$R" 'if (finished || !canReach(y, deps)) return;' 'if (finished) return;'
mut M12-hold-removed "$W" '    holdRecording();' ''
mut M13-active-ignored "$B" 'i.motion && !i.active && i.hero' 'i.motion && i.hero'
mut M14-drift-fix-removed "$X" 'if (Math.abs(win.scrollY - y) > SCROLL_TOLERANCE_PX) opts.restore(y);' ''
mut M15-drift-tolerance-zero "$X" 'export const SCROLL_TOLERANCE_PX = 4;' 'export const SCROLL_TOLERANCE_PX = -1;'
mut M16-flag-check-removed-in-plan "$B" "  if (!i.enabled) return { kind: 'none' };" ''
mut M17-flag-check-removed-in-restore-effect "$S" '    if (!isViewTransitionsEnabled()) return;' ''
mut M18-listeners-installed-when-off "$S" '(isViewTransitionsEnabled() ? installBackInterceptor() : undefined)' 'installBackInterceptor()'
mut M19-hold-before-plan-when-off "$W" "    if (plan.kind === 'none') return;" ''
git status --porcelain | grep -v '^?? .bieg/' | head
echo "mutanty: $(grep -c zabity "$OUT/mutants.txt") zabite, $(grep -c PRZEZYL "$OUT/mutants.txt") przezylo, $(grep -c BLAD "$OUT/mutants.txt") bledne"
