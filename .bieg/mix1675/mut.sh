#!/usr/bin/env bash
# MIX-1675: mutanty powrotu z realizacji. Kazdy: jedna zmiana w jednym pliku, vitest celowany,
# przywrocenie tego pliku z kopii wzorcowej (chmura nie ma .git; po kazdym mutancie cmp z wzorcem, a mutant
# musi sie roznic od wzorca przed testem). Wymaga node_modules. Z korzenia repo.
set -u
OUT=.bieg/r/mix1675m; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
PR="$OUT/pristine"; mkdir -p "$PR"
for f in utils/caseStudyBack.ts utils/caseStudyRestore.ts utils/caseStudyBackTransition.ts utils/caseStudyBackBrowser.ts components/common/ScrollToTop.tsx; do mkdir -p "$PR/$(dirname $f)"; cp "$f" "$PR/$f"; done
T="tests/utils/caseStudyBack.test.ts tests/utils/caseStudyBackTransition.test.ts tests/utils/caseStudyBackBrowser.test.ts tests/components/scrollToTopBack.test.tsx tests/components/scrollToTopCaseStudy.test.tsx tests/components/caseStudyTransitions.test.tsx"
B=utils/caseStudyBack.ts; R=utils/caseStudyRestore.ts; X=utils/caseStudyBackTransition.ts; W=utils/caseStudyBackBrowser.ts; S=components/common/ScrollToTop.tsx
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
mut M11-no-wait-for-height "$R" 'if (!canReach(y, deps)) return;' ''
mut M12-hold-removed "$W" '    holdRecording();' ''
mut M13-active-ignored "$B" 'i.motion && !i.active && i.hero' 'i.motion && i.hero'
mut M14-drift-fix-removed "$X" 'if (Math.abs(win.scrollY - y) > SCROLL_TOLERANCE_PX) opts.restore(y);' ''
mut M15-drift-tolerance-zero "$X" 'export const SCROLL_TOLERANCE_PX = 4;' 'export const SCROLL_TOLERANCE_PX = -1;'
mut M16-flag-check-removed-in-plan "$B" "  if (!i.enabled) return { kind: 'none' };" ''
mut M17-flag-check-removed-in-restore-effect "$S" '    if (!isViewTransitionsEnabled()) return;' ''
mut M18-listeners-installed-when-off "$S" '(isViewTransitionsEnabled() ? installBackInterceptor() : undefined)' 'installBackInterceptor()'
mut M19-hold-before-plan-when-off "$W" "    if (plan.kind === 'none') return;" ''
mut V5-card-wait-3000 "$X" 'export const BACK_CARD_MAX_MS = 300;' 'export const BACK_CARD_MAX_MS = 3000;'
mut V6-hash-on-pop-restored "$S" 'if (prev === pathname || hash) return;' 'if (prev === pathname) return;'
V="if (r.bottom > 0 && r.top < win.innerHeight && r.width > 0) return parts;"
mut V9a-card-bounds-dropped "$W" "$V" 'return parts;'
mut V9b-card-above-ok "$W" "$V" 'if (r.top < win.innerHeight && r.width > 0) return parts;'
mut V9c-card-below-ok "$W" "$V" 'if (r.bottom > 0 && r.width > 0) return parts;'
mut V9d-card-zero-width-ok "$W" "$V" 'if (r.bottom > 0 && r.top < win.innerHeight) return parts;'
mut F1a-drift-only-after-ready "$X" 'void Promise.allSettled([transition.ready, transition.updateCallbackDone]).then(correctDrift);' 'transition.ready.then(correctDrift, () => undefined);'
mut F1b-drift-never-after-skip "$X" 'void Promise.allSettled([transition.ready, transition.updateCallbackDone]).then(correctDrift);' 'transition.ready.then(correctDrift).catch(() => undefined);'
# r4: jeden bilet pokolenia (bumpGeneration/backTicket). F2f/F2g/F2h/F2l/F3a-d usuniete razem z kodem (cancelRestore, pathRef, reczne przywracanie przy drugim cofnieciu); zastepuja je G*.
mut F2a-no-live-check-after-wait "$X" 'na innej stronie
      if (!opts.live()) {' 'na innej stronie
      if (false) {'
mut F2b-no-live-check-in-drift "$X" '      if (!opts.live()) return;' ''
mut F2c-search-ignored "$B" 'return `${listKey(loc.pathname)}\n${loc.search}`;' 'return listKey(loc.pathname);'
mut F2d-path-ignored "$B" 'return `${listKey(loc.pathname)}\n${loc.search}`;' 'return loc.search;'
mut F2e-always-on-list "$W" '      live,' '      live: () => true,'
mut F2i-restore-live-ignored-timer "$R" 'if (live()) scrollInstant(y, deps.win);' 'scrollInstant(y, deps.win);'
mut F2j-restore-live-ignored-layout "$R" 'if (!live()) return stop();' ''
mut F2k-scrolltotop-no-ticket "$S" 'startRestore(y, { guard: backTicket(() => locRef.current) });' 'startRestore(y);'
mut G1-transition-start-no-live-check "$X" 'nic nie robi
      if (!opts.live()) {' 'nic nie robi
      if (false) {'
mut G2-transition-wait-not-aborted "$X" 'waitUntil(opts.listReady, opts.cardMs ?? BACK_CARD_MAX_MS, opts.live)' 'waitUntil(opts.listReady, opts.cardMs ?? BACK_CARD_MAX_MS)'
mut G3-restore-layout-no-generation "$R" 'if (!live()) return stop();' 'if (deps.guard && !deps.guard()) return stop();'
mut G4-restore-timer-no-generation "$R" 'if (live()) scrollInstant(y, deps.win);' 'if (!deps.guard || deps.guard()) scrollInstant(y, deps.win);'
mut G5-wait-alive-ignored "$R" '      if (!alive()) return resolve(false);' ''
mut G6-popstate-no-bump "$W" '    bumpGeneration();
    const from = trackedPath;' '    const from = trackedPath;'
mut G7-ticket-no-generation "$B" 'return () => gen === generation && locationKey(read) === at;' 'return () => locationKey(read) === at;'
mut G7b-ticket-unknown-alive "$B" 'if (at === null) return () => false;' 'if (at === null) return () => true;'
mut G7c-ticket-search-type-unchecked "$B" " || typeof loc.search !== 'string') return null;" ') return null;'
mut G7d-ticket-relative-path-ok "$B" "    if (!loc.pathname.startsWith('/')) return null;" ''
mut G8-link-no-bump "$S" "    if (isViewTransitionsEnabled() && navType !== 'POP') bumpGeneration();" ''
mut G8b-only-push-bumps "$S" "navType !== 'POP') bumpGeneration();" "navType === 'PUSH') bumpGeneration();"
mut G8c-locref-not-updated "$S" '    locRef.current = { pathname, search };' ''
for f in utils/caseStudyBack.ts utils/caseStudyRestore.ts utils/caseStudyBackTransition.ts utils/caseStudyBackBrowser.ts components/common/ScrollToTop.tsx; do cmp "$f" "$PR/$f" || echo "NIEZGODNE z wzorcem: $f"; done
git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | head
echo "mutanty: $(grep -c zabity "$OUT/mutants.txt") zabite, $(grep -c PRZEZYL "$OUT/mutants.txt") przezylo, $(grep -c BLAD "$OUT/mutants.txt") bledne"
