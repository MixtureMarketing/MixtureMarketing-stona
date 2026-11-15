#!/usr/bin/env bash
# MIX-1719/MIX-1729: mutants of the late-second-back undo, the traverse restore suppression (N*) (utils/caseStudyBackSkip.ts, utils/caseStudyBackTransition.ts) and
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
# MIX-1729: no browser scroll restore for a history traverse during our back transition
# (utils/caseStudyRootScroll.ts suppressTraverseRestore, caseStudyBackSkip.ts setBackSkip/release, caseStudyBackTransition.ts)
mut N1-skip-no-window $TB $S "  const unsuppress = suppressTraverseRestore(host);" "  const unsuppress = suppressTraverseRestore(null);"
mut N2-transition-no-window $TB utils/caseStudyBackTransition.ts "setBackSkip(transition, cleanup, undefined, doc.defaultView)" "setBackSkip(transition, cleanup)"
mut N3-release-keeps-listener $TB $S "    unsuppress();" "    void unsuppress;"
mut N4-any-navigation-type $TB $R "if (n.navigationType !== 'traverse' || n.canIntercept !== true) return;" "if (n.canIntercept !== true) return;"
mut N5-canIntercept-truthy $TB $R "n.canIntercept !== true) return;" "!n.canIntercept) return;"
mut N6-no-hash-guard $TB $R "if (n.hashChange !== false || n.defaultPrevented !== false) return;" "if (n.defaultPrevented !== false) return;"
mut N7-hash-unknown-allowed $TB $R "if (n.hashChange !== false ||" "if (n.hashChange === true ||"
mut N8-no-prevented-guard $TB $R " || n.defaultPrevented !== false) return;" ") return;"
mut N9-scroll-after-transition $TB $R "{ scroll: 'manual', focusReset: 'manual' }" "{ scroll: 'after-transition', focusReset: 'manual' }"
mut N10-focus-reset-default $TB $R "{ scroll: 'manual', focusReset: 'manual' }" "{ scroll: 'manual' }"
mut N11-intercept-detached $TB $R "n.intercept.call(e, {" "n.intercept.call(undefined, {"
mut N12-intercept-error-escapes $TB $R "        /* przeglądarka odmawia: zostaje jej przywrócenie */" "        throw new Error('intercept');"
mut N13-double-remove $TB $R "      if (!on) return;" ""
mut N14-remove-error-escapes $TB $R "        /* nic do zdjęcia */" "        throw new Error('remove');"
mut N15-nav-getter-error-escapes $TB $R "  } catch {
    return NOTHING;" "  } catch {
    throw new Error('nav');"
mut N16-no-nav-guard $TB $R "    if (!nav || typeof nav.addEventListener !== 'function') return NOTHING;" ""
mut N17-no-intercept-type-guard $TB $R "        if (typeof n.intercept !== 'function') return;" ""
mut W6-grid-entrance-always $TG components/features/portfolio/PortfolioGrid.tsx "const entrance = !reducedMotion && !isTransitionActive();" "const entrance = !reducedMotion;"
mut W7-cv-auto $TG components/common/caseStudyTransitions.css "content-visibility: visible;" "content-visibility: auto;"
echo "porcelain: $(git status --porcelain | grep -cv '^?? ')"
echo "### end"
