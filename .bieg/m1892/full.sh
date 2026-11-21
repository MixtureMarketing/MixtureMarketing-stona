#!/usr/bin/env bash
# MIX-1892 full check on the pool (chmura), from the repo root, relative paths only (wzór
# .bieg/m1816/full.sh): npm ci; vitest related; eslint; prettier; tsc root + functions; vitest run;
# build; 4 local builds (VITE_MM_NEW_CLIENT_TIMELINE x VITE_MM_CALC_NEW_UI); probe of each build
# (on = 390/1024/1366 with contrast >= 4.5 and axe incomplete color-contrast = error; off = 390);
# one probe mutant (new UI without the timeline must FAIL); unit mutants (mut.sh) last.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1892/full
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; return 0; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$OUT/$1.log"; }
tests_line() { clean "$1" | grep -aE '^ *(Test Files|Tests) ' | sed "s/^/  $1: /"; }
fails() { clean "$1" | grep -aE '^ *(FAIL|×) ' | head -20 | sed "s/^/  $1 fail: /"; }
restore_generated() { git checkout -- public/sitemap.xml 2>/dev/null; git status --porcelain | grep -v '^?? ' | sed 's/^/  dirty: /'; }

step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
restore_generated

D=components/features/calculator
CHANGED="$D/CalculatorResult.tsx $D/PublicCalculator.tsx $D/NewClientTimeline.newUi.test.tsx"
# shellcheck disable=SC2086
step related npx vitest related $CHANGED --run --maxWorkers=2
tests_line related
fails related
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
clean eslint | grep -aE 'error|warning|problem|^/' | head -20 | sed 's/^/  eslint: /'
# shellcheck disable=SC2086
step prettier npx prettier --check $CHANGED .bieg/m1892/probe.mjs
clean prettier | tail -3 | sed 's/^/  prettier: /'
# diff of what prettier would change (printed, then reverted), so formatting can be fixed by hand
# shellcheck disable=SC2086
npx prettier --write $CHANGED .bieg/m1892/probe.mjs > /dev/null 2>&1
# shellcheck disable=SC2086
git diff -- $CHANGED .bieg/m1892/probe.mjs | sed 's/^/  prettier-diff: /' | head -80
# shellcheck disable=SC2086
git checkout -- $CHANGED .bieg/m1892/probe.mjs
step tsc-root npx tsc --noEmit -p tsconfig.json
echo "  tsc-root errors: $(grep -c 'error TS' "$OUT/tsc-root.log")"
grep -a 'error TS' "$OUT/tsc-root.log" | head -10 | sed 's/^/  tsc-root: /'
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
echo "  tsc-functions errors: $(grep -c 'error TS' "$OUT/tsc-functions.log")"
step vitest npx vitest run --maxWorkers=2
tests_line vitest
fails vitest
step build npm run build
clean build | grep -aE 'Size|error' | head -4 | sed 's/^/  build: /'
restore_generated

B=.bieg/m1892
for t in 0 1; do for u in 0 1; do
  tv=$([ $t = 1 ] && echo 1 || echo ''); uv=$([ $u = 1 ] && echo 1 || echo '')
  step "build-t$t-u$u" env VITE_MM_NEW_CLIENT_TIMELINE="$tv" VITE_MM_CALC_NEW_UI="$uv" npx vite build --outDir "$B/dist-t$t-u$u"
  restore_generated
  echo "  bundle t$t-u$u: files with 'Co dostajesz i kiedy'=$(grep -l 'Co dostajesz i kiedy' "$B"/dist-t$t-u$u/assets/*.js 2>/dev/null | wc -l)"
done; done
for t in 0 1; do for u in 0 1; do
  m=$([ $t = 1 ] && echo on || echo off); ui=$([ $u = 1 ] && echo new || echo old)
  step "probe-t$t-u$u" node .bieg/m1892/probe.mjs "$B/dist-t$t-u$u" "$B/probe-t$t-u$u" "$m" "$ui"
  grep -a '^PROBE' "$OUT/probe-t$t-u$u.log" | cut -c1-1500
  grep -a 'pageerror\|NIE DOSZLO' "$OUT/probe-t$t-u$u.log" | head -5 | cut -c1-600
done; done
for f in "$B"/probe-t1-u*/shots/*.jpg; do
  [ -f "$f" ] || continue
  echo "SHOT-BEGIN $(basename "$(dirname "$(dirname "$f")")")-$(basename "$f") $(wc -c < "$f")"
  base64 -w0 "$f"
  echo
  echo "SHOT-END"
done

# Probe negative leg: new UI result without the timeline must FAIL the on/new probe.
R=$D/CalculatorResult.tsx
FROM='onReset={onReset} timeline={timeline} />' TO='onReset={onReset} />' node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");if(!s.includes(process.env.FROM)){process.exit(3)}fs.writeFileSync(f,s.replace(process.env.FROM,process.env.TO))' "$R" && {
  step build-pm1 env VITE_MM_NEW_CLIENT_TIMELINE=1 VITE_MM_CALC_NEW_UI=1 npx vite build --outDir "$B/dist-pm1"
  git checkout -- "$R"
  restore_generated
  step probe-pm1 node .bieg/m1892/probe.mjs "$B/dist-pm1" "$B/probe-pm1" on new
  grep -aE '^PROBE [a-z-]+ fails' "$OUT/probe-pm1.log" | cut -c1-400
  if grep -aq 'brak sekcji' "$OUT/probe-pm1.log"; then echo "  probe-mut pm1: zabity (brak sekcji)"; else echo "  probe-mut pm1: PRZEZYL"; fi
} || echo "  probe-mut pm1 NOMATCH"

# pm2: the CTA arrow WITHOUT aria-hidden must FAIL (the nonBmp exception is only for hidden symbols).
FROM='<span aria-hidden="true">→</span>' TO='<span>→</span>' node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");if(!s.includes(process.env.FROM)){process.exit(3)}fs.writeFileSync(f,s.replace(process.env.FROM,process.env.TO))' "$R" && {
  step build-pm2 env VITE_MM_NEW_CLIENT_TIMELINE=1 VITE_MM_CALC_NEW_UI=1 npx vite build --outDir "$B/dist-pm2"
  git checkout -- "$R"
  restore_generated
  step probe-pm2 node .bieg/m1892/probe.mjs "$B/dist-pm2" "$B/probe-pm2" on new
  grep -aE '^PROBE [a-z-]+ fails' "$OUT/probe-pm2.log" | cut -c1-400
  if grep -aq 'incomplete color-contrast na ekranie wyniku' "$OUT/probe-pm2.log"; then echo "  probe-mut pm2: zabity (incomplete)"; else echo "  probe-mut pm2: PRZEZYL"; fi
} || echo "  probe-mut pm2 NOMATCH"

# pm3: gradients kept (PROBE_OVERLAY=keep) on the good t1-u1 build must FAIL (bgGradient is still an error).
step probe-pm3 env PROBE_OVERLAY=keep node .bieg/m1892/probe.mjs "$B/dist-t1-u1" "$B/probe-pm3" on new
grep -aE '^PROBE [a-z-]+ fails' "$OUT/probe-pm3.log" | cut -c1-400
if grep -aq 'bgGradient' "$OUT/probe-pm3.log" && grep -aq 'incomplete color-contrast na ekranie wyniku' "$OUT/probe-pm3.log"; then echo "  probe-mut pm3: zabity (bgGradient)"; else echo "  probe-mut pm3: PRZEZYL"; fi

bash .bieg/m1892/mut.sh
restore_generated
echo DONE
