#!/usr/bin/env bash
# MIX-1719: mutants of the late-second-back undo (utils/caseStudyBackSkip.ts, utils/caseStudyBackTransition.ts) and
# of the two MIX-1711 rules without a test (W6 PortfolioGrid entrance, W7 content-visibility). One file at a time,
# restored with `git checkout -- <file>`. Mutant runs its test file(s); rc != 0 = ZABITY. Pattern not found = BLAD WZORCA.
# MUTANT-APPLIED <file> diff-lines=<n> proves the mutant was in the tree when the tests ran. From the repo root.
set -u
TB=tests/utils/caseStudyBackTransition.test.ts
TG=tests/components/portfolioGridTransition.test.tsx
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1
mkdir -p .bieg/r
echo "HEAD=$(git rev-parse HEAD)"
npx vitest run $TB $TG --maxWorkers=2 > .bieg/r/mut1719-base.log 2>&1; echo "baseline rc=$?"
sed 's/\x1b\[[0-9;]*m//g' .bieg/r/mut1719-base.log | grep -aE "Test Files|Tests " | sed 's/^/baseline: /'
mut() {
  local id=$1 tests=$2 file=$3 from=$4 to=$5
  if ! grep -qF -- "$from" "$file"; then echo "MUT $id BLAD WZORCA"; return; fi
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");fs.writeFileSync(f,s.replace(process.env.FROM,process.env.TO));' "$file"
  echo "MUTANT-APPLIED $file diff-lines=$(git diff --numstat -- "$file" | awk '{print $1"/"$2}')"
  npx vitest run $tests --maxWorkers=2 > ".bieg/r/mut1719-$id.log" 2>&1; local rc=$?
  git checkout -- "$file"
  local first; first=$(sed 's/\x1b\[[0-9;]*m//g' ".bieg/r/mut1719-$id.log" | grep -aE '^ +(×|✗|FAIL)' | head -n 1 | cut -c1-160)
  [ $rc -ne 0 ] && echo "MUT $id ZABITY ($file) first: $first" || echo "MUT $id PRZEZYL ($file)"
}
S=utils/caseStudyBackSkip.ts
R=utils/caseStudyRootScroll.ts
mut U1-undo-not-called $TB $S "      u?.();" "      void u;"
mut U2-no-position-guard $TB $R "  if (Math.abs(win.scrollY - y) > SCROLL_TOLERANCE_PX) return;" ""
mut U3-no-same-position-guard $TB $R "  if (Math.abs(before - y) <= SCROLL_TOLERANCE_PX) return;" ""
mut U4-no-number-guard $TB $R "  if (!(before >= 0)) return;" ""
mut U5-every-call-overwrites $TB $S "    if (win && !undo) {" "    if (win) {"
mut U6-undo-unguarded $TB $S "    try {
      u?.();
    } catch {
      /* nawigacja nie stoi */
    }" "    u?.();"
mut U7-undo-to-our-y $TB $R "win.scrollTo({ top: before, left: win.scrollX, behavior: 'instant' });" "win.scrollTo({ top: y, left: win.scrollX, behavior: 'instant' });"
mut U8-transition-bypasses-restoring $TB utils/caseStudyBackTransition.ts "skip.restoring(doc.defaultView, y, opts.restore);" "opts.restore(y);"
# MIX-1719 r3: instant-scroll hold on an unaccepted back (utils/caseStudyRootScroll.ts, caseStudyBackSkip.ts, caseStudyBackTransition.ts)
mut H1-hold-not-called $TB $S "    holdInstantScroll(root);" "    void root;"
mut H2-transition-no-root $TB utils/caseStudyBackTransition.ts "setBackSkip(transition, cleanup, undefined, doc.documentElement)" "setBackSkip(transition, cleanup)"
mut H3-value-smooth $TB $R "    style.setProperty('scroll-behavior', 'auto');" "    style.setProperty('scroll-behavior', 'smooth');"
mut H4-not-removed $TB $R "      else style.removeProperty('scroll-behavior');" "      else void 0;"
mut H5-prev-not-restored $TB $R "      if (prev) style.setProperty('scroll-behavior', prev);" "      if (prev) void 0;"
mut H6-stale-timer-acts $TB $R "      if (instantHold?.timer !== timer) return;" ""
mut H7-prev-from-style $TB $R "    const prev = held && held.root === root && now === 'auto' ? held.prev : now;" "    const prev = now;"
mut H8-overwrites-other $TB $R "      if (style.getPropertyValue('scroll-behavior') !== 'auto') return;" ""
mut H9-hold-throws $TB $R "    /* korzeń bez stylu albo styl rzuca: przewijanie zostaje, jakie było */" "    throw new Error('hold');"
mut H10-hold-zero-ms $TB $R "  ms: number = BACK_INSTANT_HOLD_MS," "  ms: number = 0,"
mut W6-grid-entrance-always $TG components/features/portfolio/PortfolioGrid.tsx "const entrance = !reducedMotion && !isTransitionActive();" "const entrance = !reducedMotion;"
mut W7-cv-auto $TG components/common/caseStudyTransitions.css "content-visibility: visible;" "content-visibility: auto;"
echo "porcelain: $(git status --porcelain | grep -cv '^?? ')"
echo "### end"
