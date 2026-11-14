#!/usr/bin/env bash
# MIX-1707 (kopia .bieg/mix1699/mut.sh bez U1-U16 + C1-C14): mutanty powrotu z realizacji. Kazdy: jedna zmiana w jednym pliku, vitest celowany,
# przywrocenie tego pliku z kopii wzorcowej (chmura nie ma .git; po kazdym mutancie cmp z wzorcem, a mutant
# musi sie roznic od wzorca przed testem). Wymaga node_modules. Z korzenia repo.
set -u
OUT=.bieg/r/mix1707m; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)"
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
PR="$OUT/pristine"; mkdir -p "$PR"
for f in utils/caseStudyBack.ts utils/caseStudyGeneration.ts utils/caseStudyRestore.ts utils/caseStudyBackTransition.ts utils/caseStudyBackOptions.ts utils/caseStudyBackBrowser.ts utils/caseStudyBackSkip.ts components/common/ScrollToTop.tsx; do mkdir -p "$PR/$(dirname $f)"; cp "$f" "$PR/$f"; done
T="tests/utils/caseStudyBack.test.ts tests/utils/caseStudyBackTransition.test.ts tests/utils/caseStudyBackBrowser.test.ts tests/components/scrollToTopBack.test.tsx tests/components/scrollToTopCaseStudy.test.tsx tests/components/caseStudyTransitions.test.tsx"
O=utils/caseStudyBackOptions.ts; B=utils/caseStudyBack.ts; G=utils/caseStudyGeneration.ts; R=utils/caseStudyRestore.ts; X=utils/caseStudyBackTransition.ts; W=utils/caseStudyBackBrowser.ts; S=components/common/ScrollToTop.tsx; K=utils/caseStudyBackSkip.ts
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
mut M15-drift-tolerance-zero "$O" 'export const SCROLL_TOLERANCE_PX = 4;' 'export const SCROLL_TOLERANCE_PX = -1;'
mut M16-flag-check-removed-in-plan "$B" "  if (!i.enabled) return { kind: 'none' };" ''
mut M17-flag-check-removed-in-restore-effect "$S" '    if (!isViewTransitionsEnabled()) return;' ''
mut M18-listeners-installed-when-off "$S" '(isViewTransitionsEnabled() ? installBackInterceptor() : undefined)' 'installBackInterceptor()'
mut M19-hold-before-plan-when-off "$W" "    if (plan.kind === 'none') return;" ''
mut V5-card-wait-3000 "$O" 'export const BACK_CARD_MAX_MS = 300;' 'export const BACK_CARD_MAX_MS = 3000;'
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
mut F2e-always-on-list "$W" '    const live = backTicket(() => win.location);' '    const live = () => true;'
mut F2i-restore-live-ignored-timer "$R" 'if (live()) scrollInstant(y, deps.win);' 'scrollInstant(y, deps.win);'
mut F2j-restore-live-ignored-layout "$R" 'if (!live()) return stop();' ''
mut G1-transition-start-no-live-check "$X" 'nic nie robi
      if (!opts.live()) {' 'nic nie robi
      if (false) {'
mut G2-transition-wait-not-aborted "$X" 'waitUntil(opts.listReady, cardMs, opts.live)' 'waitUntil(opts.listReady, cardMs)'
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
mut R8-unclaimed-pop-handled "$W" '    if (!claimBack(win.location)) return void skipAndHandOver(e, handToRouter);' '    claimBack(win.location);'
mut R9-no-revert-on-unclaimed "$G" '  if (claim === null) revertManualRestoration();' ''
mut R10-no-user-input-listener "$S" '  useLayoutEffect(() => (isViewTransitionsEnabled() ? listenUserInput(window) : undefined), []);' ''
mut R11-dropclaim-noop "$G" 'export function dropClaim(): void {
  claim = null;' 'export function dropClaim(): void {
  void 0;'
mut R12-ticket-ignores-drop "$G" 'return () => claim === c && c.gen === generation' 'return () => c.gen === generation'
mut R13-ticket-no-generation "$G" 'return () => claim === c && c.gen === generation && ' 'return () => claim === c && '
mut R14-ticket-start-no-generation "$G" 'if (c === null || c.gen !== generation || locationKey' 'if (c === null || locationKey'
mut R15-revert-writes-always "$B" "if (win.history.scrollRestoration === 'manual') win.history.scrollRestoration = 'auto';" "win.history.scrollRestoration = 'auto';"
mut R19-sets-manual-from-any-mode "$B" "    if (win.history.scrollRestoration !== 'auto') return;" ''
mut R20-skips-only-manual "$B" "if (win.history.scrollRestoration !== 'auto') return;" "if (win.history.scrollRestoration === 'manual') return;"
mut R16-new-window-no-revert "$B" "export function manualRestorationFor(win: Window, ms = MANUAL_RESTORATION_MS): void {
  revertManualRestoration();" "export function manualRestorationFor(win: Window, ms = MANUAL_RESTORATION_MS): void {"
mut R17-revert-keeps-timer "$B" '      win.clearTimeout(timer);' ''
mut R18-input-listener-wrong-target "$G" 'win.addEventListener(t, onUserInput, { capture: true, passive: true })' 'win.document.body?.addEventListener(t, onUserInput, { capture: true, passive: true })'
# MIX-1699: N = pominiecie przejscia przy nieprzyjetym cofnieciu, P = koniec okna manual przy ruchu uzytkownika
mut N1-unclaimed-pop-no-skip "$W" '    if (!claimBack(win.location)) return void skipAndHandOver(e, handToRouter);' '    if (!claimBack(win.location)) return;'
mut N2-skip-no-cleanup "$G" '    t.skipTransition();
    cleanup();' '    t.skipTransition();'
mut N3-skip-no-skiptransition "$G" '    t.skipTransition();
    cleanup();' '    cleanup();'
mut N4-skip-not-released-at-end "$X" '    setTransitionActive(false);
    skip.release();' '    setTransitionActive(false);'
mut N5-skip-never-registered "$X" '  skip = setBackSkip(transition, cleanup);' ''
mut N6-release-ignores-identity "$K" '    if (skipActive === skip) skipActive = null;' '    skipActive = null;'
mut P1-input-no-revert "$G" '  dropClaim();
  revertManualRestoration();
}' '  dropClaim();
}'
mut P2-input-no-drop "$G" 'function onUserInput(): void {
  dropClaim();' 'function onUserInput(): void {'
mut P3-click-no-revert "$G" "  win.addEventListener('click', revertManualRestoration, true);" ''
mut P4-click-drops-claim "$G" "  win.addEventListener('click', revertManualRestoration, true);" "  win.addEventListener('click', onUserInput, true);"
# MIX-1699 r2: K = budzenie wywolania zwrotnego (U1-U16 usuniete razem z utils/caseStudyBackUndo.ts, MIX-1707)
mut K1-no-wake "$G" '    wake(false);' ''
mut K2-race-removed "$X" 'await Promise.race([waitUntil(opts.listReady, cardMs, opts.live), skip.woken]);' 'await waitUntil(opts.listReady, cardMs, opts.live);'
mut K3-woken-at-once "$K" 'const woken = new Promise<false>((resolve) => (wake = resolve));' 'const woken = Promise.resolve(false as const);'
# MIX-1707: C = przywrocenie listy dopiero po potwierdzeniu pojedynczego cofniecia (okno, bilet, jeden wlasciciel)
mut C1-no-confirm-wait "$X" '      if (left > 0) await Promise.race([new Promise((r) => setTimeout(r, left)), skip.woken]);' ''
mut C2-wait-not-woken "$X" 'if (left > 0) await Promise.race([new Promise((r) => setTimeout(r, left)), skip.woken]);' 'if (left > 0) await new Promise((r) => setTimeout(r, left));'
mut C3-wait-condition-inverted "$X" '      if (left > 0) await' '      if (left < 0) await'
mut C4-window-from-callback "$X" '      const left = confirmMs - (Date.now() - acceptedAt);' '      const left = confirmMs;'
mut C5-window-0 "$O" 'export const BACK_CONFIRM_MS = 250;' 'export const BACK_CONFIRM_MS = 0;'
mut C6-window-100 "$O" 'export const BACK_CONFIRM_MS = 250;' 'export const BACK_CONFIRM_MS = 100;'
mut C7-window-500 "$O" 'export const BACK_CONFIRM_MS = 250;' 'export const BACK_CONFIRM_MS = 500;'
mut C8-live-after-wait-removed "$X" '      const left = confirmMs - (Date.now() - acceptedAt);
      if (left > 0) await Promise.race([new Promise((r) => setTimeout(r, left)), skip.woken]);
      // szybkie drugie cofnięcie: lista nie jest już na ekranie, jej pozycji nie wolno stawiać na innej stronie
      if (!opts.live()) {' '      const left = confirmMs - (Date.now() - acceptedAt);
      if (left > 0) await Promise.race([new Promise((r) => setTimeout(r, left)), skip.woken]);
      if (false) {'
mut C9-not-owned "$X" '    ownBack(true);' ''
mut C10-not-given-back "$X" '    ownBack(false);' ''
mut C11-scrolltotop-ignores-owner "$S" '    if (backOwned()) return;' ''
mut C12-owned-ignores-flag "$G" '  return claim !== null && claim.owned;' '  return claim !== null;'
mut C13-new-claim-owned "$G" '{ key: at, gen: generation, owned: false }' '{ key: at, gen: generation, owned: true }'
mut C14-own-without-claim "$G" '  if (claim !== null) claim.owned = owned;' '  claim!.owned = owned;'
mut C15-restore-not-waiting "$W" "      restore: (y) => void startRestore(y, { win, doc, guard: live })," "      restore: (y) => win.scrollTo({ top: y, left: 0, behavior: 'instant' }),"
mut C16-restore-guard-removed "$W" '      restore: (y) => void startRestore(y, { win, doc, guard: live }),' '      restore: (y) => void startRestore(y, { win, doc }),'
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
for f in utils/caseStudyBack.ts utils/caseStudyGeneration.ts utils/caseStudyRestore.ts utils/caseStudyBackTransition.ts utils/caseStudyBackOptions.ts utils/caseStudyBackBrowser.ts utils/caseStudyBackSkip.ts components/common/ScrollToTop.tsx; do cmp "$f" "$PR/$f" || echo "NIEZGODNE z wzorcem: $f"; done
git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | head
echo "mutanty: $(grep -c zabity "$OUT/mutants.txt") zabite, $(grep -c PRZEZYL "$OUT/mutants.txt") przezylo, $(grep -c BLAD "$OUT/mutants.txt") bledne"
