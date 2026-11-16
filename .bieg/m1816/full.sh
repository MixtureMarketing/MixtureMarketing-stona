#!/usr/bin/env bash
# MIX-1816 (Z13), one run on the pool (chmura), from the repo root, relative paths only
# (wzór .bieg/m1810/full.sh + .bieg/m1799/full.sh): npm ci; affected tests (vitest related); eslint,
# prettier, tsc root + functions, vitest run, build; local builds with the switch on and off; probe
# 390/1024/1366 (on) and 390 (off); two probe mutants that must FAIL (cookie hook dropped, break-words
# dropped); mutants (mut.sh, green baseline) last. Result lines go to stdout, details to
# .bieg/m1816/full/ on the pool machine. Screenshots return in the log as base64 (SHOT-BEGIN/END).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1816/full
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
CHANGED="$D/NewClientTimeline.tsx $D/newClientTimeline.content.ts $D/newClientTimeline.guard.ts $D/CalculatorResult.tsx $D/PublicCalculator.tsx $D/livePrice.ts $D/useHideCookieOver.ts $D/NewClientTimeline.test.tsx $D/NewClientTimeline.off.test.tsx $D/newClientTimeline.content.test.ts index.css"
# shellcheck disable=SC2086
step related npx vitest related $CHANGED --run --maxWorkers=2
tests_line related
fails related
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
clean eslint | grep -aE 'error|warning|problem|^/' | head -20 | sed 's/^/  eslint: /'
# shellcheck disable=SC2086
step prettier npx prettier --check ${CHANGED/index.css/} .bieg/m1816/probe.mjs
clean prettier | tail -3 | sed 's/^/  prettier: /'
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

B=.bieg/m1816
step build-on env VITE_MM_NEW_CLIENT_TIMELINE=1 npx vite build --outDir "$B/dist-on"
restore_generated
step build-off env VITE_MM_NEW_CLIENT_TIMELINE= npx vite build --outDir "$B/dist-off"
restore_generated
# K2: the switch-off bundle has no timeline copy; the switch-on one has it (inlined by Vite).
echo "  bundle on: files with 'Co dostajesz i kiedy'=$(grep -l 'Co dostajesz i kiedy' "$B"/dist-on/assets/*.js 2>/dev/null | wc -l); js bytes=$(cat "$B"/dist-on/assets/*.js | wc -c)"
echo "  bundle off: files with 'Co dostajesz i kiedy'=$(grep -l 'Co dostajesz i kiedy' "$B"/dist-off/assets/*.js 2>/dev/null | wc -l); js bytes=$(cat "$B"/dist-off/assets/*.js | wc -c)"

step probe-on node .bieg/m1816/probe.mjs "$B/dist-on" "$B/probe-on" on
grep -a '^PROBE' "$OUT/probe-on.log"
tail -n 12 "$OUT/probe-on.log" | cut -c1-400 | sed 's/^/  probe-on tail: /'
grep -a 'pageerror' "$OUT/probe-on.log" | head -5
step probe-off node .bieg/m1816/probe.mjs "$B/dist-off" "$B/probe-off" off
grep -a '^PROBE' "$OUT/probe-off.log"
tail -n 12 "$OUT/probe-off.log" | cut -c1-400 | sed 's/^/  probe-off tail: /'
grep -a 'pageerror' "$OUT/probe-off.log" | head -5
for f in "$B"/probe-on/shots/*.jpg; do
  [ -f "$f" ] || continue
  echo "SHOT-BEGIN $(basename "$f") $(wc -c < "$f")"
  base64 -w0 "$f"
  echo
  echo "SHOT-END"
done

# Probe negative legs: each mutant must make the probe FAIL (rc 1) with its own reason.
C=$D/NewClientTimeline.tsx
probe_mut() { # name from to expected-reason-regex
  local name=$1 from=$2 to=$3 want=$4
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");if(!s.includes(process.env.FROM)){process.exit(3)}fs.writeFileSync(f,s.replace(process.env.FROM,process.env.TO))' "$C" || { echo "  probe-mut $name NOMATCH"; return; }
  step "build-$name" env VITE_MM_NEW_CLIENT_TIMELINE=1 npx vite build --outDir "$B/dist-$name"
  git checkout -- "$C"
  restore_generated
  step "probe-$name" node .bieg/m1816/probe.mjs "$B/dist-$name" "$B/probe-$name" on
  grep -aE '^PROBE [a-z]+ fails' "$OUT/probe-$name.log" | cut -c1-500
  tail -n 4 "$OUT/probe-$name.log" | cut -c1-300 | sed "s/^/  probe-$name tail: /"
  if grep -aqE "$want" "$OUT/probe-$name.log"; then echo "  probe-mut $name: zabity (reason matches $want)"; else echo "  probe-mut $name: PRZEZYL (no '$want')"; fi
}
probe_mut hook "  useHideCookieOver(boxRef, rows.length > 0, 'timelineCookie');" '' 'przycisk ciasteczek nakłada się'
probe_mut wrap ' break-words' '' 'długi tekst: przewijanie poziome'

bash .bieg/m1816/mut.sh
restore_generated
echo DONE
