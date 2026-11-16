#!/usr/bin/env bash
# MIX-1711: mutants of the new conditions. One file at a time, restored with `git checkout -- <file>`.
# Each mutant runs the two back-navigation test files; rc != 0 = ZABITY. Pattern not found = BLAD WZORCA.
set -u
T="tests/utils/caseStudyBackBrowser.test.ts tests/utils/caseStudyBackTransition.test.ts"
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1
npx vitest run $T --maxWorkers=2 > /dev/null 2>&1; echo "baseline rc=$?"
mut() {
  local id=$1 file=$2 from=$3 to=$4
  if ! grep -qF -- "$from" "$file"; then echo "MUT $id BLAD WZORCA"; return; fi
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");fs.writeFileSync(f,s.replace(process.env.FROM,process.env.TO));' "$file"
  npx vitest run ${TESTS:-$T} --maxWorkers=2 > ".bieg/r/mut-$id.log" 2>&1; local rc=$?
  git checkout -- "$file"
  [ $rc -ne 0 ] && echo "MUT $id ZABITY ($file)" || echo "MUT $id PRZEZYL ($file)"
}
mkdir -p .bieg/r
mut E1-missing-holds utils/caseStudyBackSkip.ts "if (!p || typeof p.then !== 'function') return Promise.resolve();" "if (!p || typeof p.then !== 'function') return new Promise<void>(() => undefined);"
mut E2-getter-catch-holds utils/caseStudyBackSkip.ts "  } catch {
    return Promise.resolve();
  }" "  } catch {
    return new Promise<void>(() => undefined);
  }"
mut E3-skip-throw-unguarded utils/caseStudyBackSkip.ts "    try {
      t.skipTransition();
    } catch {" "    try {
      t.skipTransition();
    } finally {"
mut E4-raw-cbdone-in-run utils/caseStudyBackTransition.ts "callbackSettled(transition)])" "transition.updateCallbackDone.catch(() => undefined)])"
mut S1-no-settle utils/caseStudyBackTransition.ts "Math.max(confirmMs - (Date.now() - acceptedAt), settleMs)" "confirmMs - (Date.now() - acceptedAt)"
mut S2-settle-only utils/caseStudyBackTransition.ts "Math.max(confirmMs - (Date.now() - acceptedAt), settleMs)" "settleMs"
mut S3-window-250 utils/caseStudyBackOptions.ts "export const BACK_CONFIRM_MS = 90;" "export const BACK_CONFIRM_MS = 250;"
mut S4-window-0 utils/caseStudyBackOptions.ts "export const BACK_CONFIRM_MS = 90;" "export const BACK_CONFIRM_MS = 0;"
mut R1-enter-value utils/caseStudyBackTransition.ts "setAttribute(VT_ATTR, VT_BACK_VALUE)" "setAttribute(VT_ATTR, 'realizacja')"
# MIX-1711 r2: title scroll reset before the old snapshot (utils/caseStudyTransition.ts), tests in viewTransitions.test.ts
TV=tests/utils/viewTransitions.test.ts
npx vitest run $TV --maxWorkers=2 > /dev/null 2>&1; echo "baseline-vt rc=$?"
TESTS=$TV mut T1-no-scrolltop utils/caseStudyTransition.ts "parts.title.scrollTop = 0;" "void 0;"
TESTS=$TV mut T2-no-scrollleft utils/caseStudyTransition.ts "parts.title.scrollLeft = 0;" "void 0;"
TESTS=$TV mut T3-image-not-title utils/caseStudyTransition.ts "parts.title.scrollTop = 0;" "parts.image.scrollTop = 0;"
echo "porcelain: $(git status --porcelain | grep -cv '^?? ')"
echo "### end"
