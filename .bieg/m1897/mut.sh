#!/usr/bin/env bash
# shellcheck disable=SC2016,SC2126
# MIX-1897 mutants on the lines changed while resolving the 1814 x integracja conflicts (wzór
# .bieg/m1814/mut.sh): green baseline first; one mutant at a time; OCC = which occurrence of FROM
# (1-based); NOMATCH = script fails; run the affected tests, restore THAT file only.
set -u
NM=0
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1897/mut
mkdir -p "$OUT"
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
D=components/features/calculator
T="$D/BookingTimeline.combos.test.tsx $D/BookingEmbed.switch.test.tsx $D/NewClientTimeline.newUi.test.tsx $D/NewClientTimeline.test.tsx $D/NewClientTimeline.off.test.tsx tests/scripts/ciWorkflow.test.ts"
T=$(for f in $T; do [ -f "$f" ] && printf '%s ' "$f"; done)
echo "MUT HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l) tests=$T"
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
npx vitest run $T --maxWorkers=2 > "$OUT/baseline.log" 2>&1; brc=$?
echo "MUT baseline rc=$brc $(clean "$OUT/baseline.log" | grep -aE '^\s+Tests ' | tr -s ' ')"
if [ "$brc" -ne 0 ]; then echo "MUT ABORT: baseline red"; exit 1; fi
mutate() { # file from to occ
  FROM="$2" TO="$3" OCC="${4:-1}" node -e '
const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");
const a=process.env.FROM,b=process.env.TO;let n=Number(process.env.OCC),i=-1;
while(n-->0){i=s.indexOf(a,i+1);if(i<0)process.exit(3)}
fs.writeFileSync(f,s.slice(0,i)+b+s.slice(i+a.length))' "$1"
}
run() { # name file from to [occ]
  local name="$1" f="$2"
  mutate "$f" "$3" "$4" "${5:-1}" || { echo "$name NOMATCH"; NM=$((NM+1)); return; }
  local changed; changed=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  # shellcheck disable=SC2086
  npx vitest run $T --maxWorkers=2 > "$OUT/$name.log" 2>&1; local rc=$?
  local nf; nf=$(clean "$OUT/$name.log" | grep -aE '^\s+Tests ' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo 0)
  local first; first=$(clean "$OUT/$name.log" | grep -aE '^\s*(×|FAIL) ' | head -1 | cut -c1-110)
  if [ "$rc" -ne 0 ] && [ "${nf:-0}" -gt 0 ]; then echo "$name rc=$rc zabity ($nf failed: $first) diff=$changed"
  elif [ "$rc" -ne 0 ]; then echo "$name rc=$rc NIEJASNY (0 named failures: $first) diff=$changed"
  else echo "$name rc=0 PRZEZYL diff=$changed"; fi
  git checkout -- "$f"
  git diff --quiet -- "$f" || echo "WARN $f dirty after $name"
}
R=$D/CalculatorResult.tsx
C=$D/PublicCalculator.tsx
Y=.github/workflows/ci.yml
G=tests/scripts/ciWorkflow.test.ts
BT='      {booking}
      {timeline}
'
TB='      {timeline}
      {booking}
'
# CalculatorResult: occurrence 1 = nowy wygląd (NewResult), 2 = stary wygląd
run K1-new-drops-booking $R "$BT" '      {timeline}
' 1
run K2-old-drops-booking $R "$BT" '      {timeline}
' 2
run K3-new-booking-after-timeline $R "$BT" "$TB" 1
run K4-old-booking-after-timeline $R "$BT" "$TB" 2
run K5-newui-not-passed-booking $R ' timeline={timeline} booking={booking} />' ' timeline={timeline} />'
run K6-new-drops-timeline $R "$BT" '      {booking}
' 1
# PublicCalculator: oba propsy zachowane
run K7-pc-drops-booking $C 'booking={isBookingEmbedEnabled() ? <BookingEmbed /> : null}' ''
run K8-pc-drops-timeline $C 'timeline={isNewClientTimelineEnabled() ? <NewClientTimeline /> : null}' ''
run K9-pc-drops-newui $C '          newUi={newUi}
' ''
# ci.yml i strażnik: kroki obu gałęzi
run K10-ci-drops-calc-new-ui $Y "          VITE_MM_CALC_NEW_UI: \${{ steps.target.outputs.target == 'preview' && '1' || '' }} # MIX-1867: nowy wyglad kalkulatora
" ''
run K11-ci-drops-booking $Y "          VITE_MM_BOOKING_EMBED: \${{ steps.target.outputs.target == 'preview' && '1' || '' }} # MIX-1814: terminy pod wynikiem
" ''
run K12-ci-booking-prod-on $Y "VITE_MM_BOOKING_EMBED: \${{ steps.target.outputs.target == 'preview' && '1' || '' }}" "VITE_MM_BOOKING_EMBED: '1'"
run K13-guard-drops-calc-new-ui $G "  'VITE_MM_CALC_NEW_UI', // MIX-1867: nowy wygląd kalkulatora /wycena/
" ''
run K14-guard-drops-booking $G "  'VITE_MM_BOOKING_EMBED', // MIX-1814: harmonogram rozmów pod wynikiem (Z9)
" ''
echo "MUT NOMATCH=$NM"
[ "$NM" -eq 0 ]
