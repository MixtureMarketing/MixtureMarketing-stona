#!/usr/bin/env bash
# MIX-1675 r6: mutanty powrotu z realizacji. Kazdy: jedna zmiana w jednym pliku, vitest celowany,
# przywrocenie tego pliku z kopii wzorcowej (chmura nie ma .git; po kazdym mutancie cmp z wzorcem, a mutant
# musi sie roznic od wzorca przed testem). Wymaga node_modules. Z korzenia repo.
set -u
OUT=.bieg/r/mix1675m6; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
PR="$OUT/pristine"; mkdir -p "$PR"
for f in utils/caseStudyBack.ts utils/caseStudyGeneration.ts utils/caseStudyRestore.ts utils/caseStudyBackTransition.ts utils/caseStudyBackBrowser.ts components/common/ScrollToTop.tsx; do mkdir -p "$PR/$(dirname $f)"; cp "$f" "$PR/$f"; done
T="tests/utils/caseStudyBack.test.ts tests/utils/caseStudyBackTransition.test.ts tests/utils/caseStudyBackBrowser.test.ts tests/components/scrollToTopBack.test.tsx tests/components/scrollToTopCaseStudy.test.tsx tests/components/caseStudyTransitions.test.tsx"
B=utils/caseStudyBack.ts; G=utils/caseStudyGeneration.ts; R=utils/caseStudyRestore.ts; X=utils/caseStudyBackTransition.ts; W=utils/caseStudyBackBrowser.ts; S=components/common/ScrollToTop.tsx
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
mut F2a-no-live-check-after-wait "$X" 'na innej stronie
      if (!opts.live()) {' 'na innej stronie
      if (false) {'
mut F2b-no-live-check-in-drift "$X" '      if (!opts.live()) return;' ''
mut F2c-search-ignored "$G" 'return `${listKey(loc.pathname)}\n${loc.search}`;' 'return listKey(loc.pathname);'
mut F2d-path-ignored "$G" 'return `${listKey(loc.pathname)}\n${loc.search}`;' 'return loc.search;'
mut F2e-always-on-list "$W" 'live: backTicket(() => win.location),' 'live: () => true,'
mut F2i-restore-live-ignored-timer "$R" 'if (live()) scrollInstant(y, deps.win);' 'scrollInstant(y, deps.win);'
mut F2j-restore-live-ignored-layout "$R" 'if (!live()) return stop();' ''
mut G1-transition-start-no-live-check "$X" 'nic nie robi
      if (!opts.live()) {' 'nic nie robi
      if (false) {'
mut G2-transition-wait-not-aborted "$X" 'waitUntil(opts.listReady, opts.cardMs ?? BACK_CARD_MAX_MS, opts.live)' 'waitUntil(opts.listReady, opts.cardMs ?? BACK_CARD_MAX_MS)'
mut G3-restore-layout-no-generation "$R" 'if (!live()) return stop();' 'if (deps.guard && !deps.guard()) return stop();'
mut G4-restore-timer-no-generation "$R" 'if (live()) scrollInstant(y, deps.win);' 'if (!deps.guard || deps.guard()) scrollInstant(y, deps.win);'
mut G5-wait-alive-ignored "$R" '      if (!alive()) return resolve(false);' ''
mut G7c-ticket-search-type-unchecked "$G" " || typeof loc.search !== 'string') return null;" ') return null;'
mut G7d-ticket-relative-path-ok "$G" "    if (!loc.pathname.startsWith('/')) return null;" ''
mut G8c-locref-not-updated "$S" '    locRef.current = { pathname, search };' ''
# r6 (allowlista: przywrocenie tylko po jednym cofnieciu dokladnie na liste zrodlowa). Zastepuja: F2k (wywolanie
# zmienione) -> R7/R8, G6 (bump przeniesiony do claimBack) -> G6r, G7/G7b (bilet przepisany) -> R11/R12/R13,
# G8/G8b (efekt klucza przepisany) -> G8r/G8br.
mut F2kr-scrolltotop-no-guard "$S" 'startRestore(y, { guard: live });' 'startRestore(y);'
mut G6r-popstate-no-bump "$G" '  generation += 1;
  const at = locationKey(() => target);' '  const at = locationKey(() => target);'
mut G8r-link-no-bump "$S" "    bumpGeneration();
    if (navType === 'PUSH') armSource(from);" "    if (navType === 'PUSH') armSource(from);"
mut G8br-only-push-bumps "$S" "    if (!isViewTransitionsEnabled() || navType === 'POP') return;
    bumpGeneration();" "    if (!isViewTransitionsEnabled() || navType !== 'PUSH') return;
    bumpGeneration();"
mut R1-claim-any-target "$G" 'at !== null && at === source && !target?.hash' 'at !== null && source !== null && !target?.hash'
mut R2-source-not-consumed "$G" '  source = null;
  if (claim === null) revertManualRestoration();' '  if (claim === null) revertManualRestoration();'
mut R3-hash-accepted "$G" 'at === source && !target?.hash' 'at === source'
mut R4-push-not-armed "$S" "    if (navType === 'PUSH') armSource(from);" ''
mut R5-replace-arms "$S" "    if (navType === 'PUSH') armSource(from);" '    armSource(from);'
mut R6-arm-current-not-previous "$S" "armSource(from);" 'armSource({ pathname, search });'
mut R7-scrolltotop-no-claim-check "$S" '    if (!live()) return;
    restoredFor.current = pathname;' '    restoredFor.current = pathname;'
mut R8-unclaimed-pop-handled "$W" '    if (!claimBack(win.location)) return;' '    claimBack(win.location);'
mut R9-no-revert-on-unclaimed "$G" '  if (claim === null) revertManualRestoration();' ''
mut R10-no-user-input-listener "$S" '  useLayoutEffect(() => (isViewTransitionsEnabled() ? listenUserInput(window) : undefined), []);' ''
mut R11-dropclaim-noop "$G" 'export function dropClaim(): void {
  claim = null;' 'export function dropClaim(): void {
  void 0;'
mut R12-ticket-ignores-drop "$G" 'return () => claim === c && c.gen === generation' 'return () => c.gen === generation'
mut R13-ticket-no-generation "$G" 'return () => claim === c && c.gen === generation && ' 'return () => claim === c && '
mut R14-ticket-start-no-generation "$G" 'if (c === null || c.gen !== generation || locationKey' 'if (c === null || locationKey'
mut R15-revert-writes-always "$B" 'if (win.history.scrollRestoration !== previous) win.history.scrollRestoration = previous;' 'win.history.scrollRestoration = previous;'
mut R16-new-window-no-revert "$B" "export function manualRestorationFor(win: Window, ms = MANUAL_RESTORATION_MS): void {
  revertManualRestoration();" "export function manualRestorationFor(win: Window, ms = MANUAL_RESTORATION_MS): void {"
mut R17-revert-keeps-timer "$B" '      win.clearTimeout(timer);' ''
mut R18-input-listener-wrong-target "$G" 'win.addEventListener(t, dropClaim, { capture: true, passive: true })' 'win.document.body?.addEventListener(t, dropClaim, { capture: true, passive: true })'
for f in utils/caseStudyBack.ts utils/caseStudyGeneration.ts utils/caseStudyRestore.ts utils/caseStudyBackTransition.ts utils/caseStudyBackBrowser.ts components/common/ScrollToTop.tsx; do cmp "$f" "$PR/$f" || echo "NIEZGODNE z wzorcem: $f"; done
git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | head
echo "mutanty: $(grep -c zabity "$OUT/mutants.txt") zabite, $(grep -c PRZEZYL "$OUT/mutants.txt") przezylo, $(grep -c BLAD "$OUT/mutants.txt") bledne"
