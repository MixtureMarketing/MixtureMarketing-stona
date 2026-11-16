#!/usr/bin/env bash
# shellcheck disable=SC2016,SC2126
# MIX-1814 mutants (wzór .bieg/m1813/mut.sh): green baseline first; one mutant at a time, confirm the
# text was present (NOMATCH = script fails), run the affected tests, restore THAT file only.
# Killed = a named test failed.
set -u
NM=0
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1814/mut
mkdir -p "$OUT"
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
T="components/features/calculator/BookingEmbed.switch.test.tsx components/features/calculator/LeadConfig.switch.test.tsx tests/scripts/ciWorkflow.test.ts hooks/usePublicCalculator.test.ts components/features/calculator/PublicCalculator.test.tsx"
echo "MUT HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
npx vitest run $T --maxWorkers=2 > "$OUT/baseline.log" 2>&1; brc=$?
echo "MUT baseline rc=$brc $(clean "$OUT/baseline.log" | grep -aE '^\s+Tests ' | tr -s ' ')"
if [ "$brc" -ne 0 ]; then echo "MUT ABORT: baseline red, mutants not run"; exit 1; fi
run() { # name file from to
  local name="$1" f="$2" from="$3" to="$4"
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");const a=process.env.FROM,b=process.env.TO;if(!s.includes(a)){process.exit(3)}fs.writeFileSync(f,s.replace(a,b))' "$f" || { echo "$name NOMATCH"; NM=$((NM+1)); return; }
  local changed; changed=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  # shellcheck disable=SC2086
  npx vitest run $T --maxWorkers=2 > "$OUT/$name.log" 2>&1; local rc=$?
  local nf; nf=$(clean "$OUT/$name.log" | grep -aE '^\s+Tests ' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo 0)
  local first; first=$(clean "$OUT/$name.log" | grep -aE '^\s*(×|FAIL) ' | head -1 | cut -c1-90)
  if [ "$rc" -ne 0 ] && [ "${nf:-0}" -gt 0 ]; then echo "$name rc=$rc zabity ($nf failed: $first) diff=$changed"
  elif [ "$rc" -ne 0 ]; then echo "$name rc=$rc NIEJASNY (0 named failures: $first) diff=$changed"
  else echo "$name rc=0 PRZEZYL diff=$changed"; fi
  git checkout -- "$f"
  git diff --quiet -- "$f" || echo "WARN $f dirty after $name"
}
P=components/features/calculator/livePrice.ts
H=hooks/usePublicCalculator.ts
C=components/features/calculator/PublicCalculator.tsx
R=components/features/calculator/CalculatorResult.tsx
B=components/features/calculator/BookingEmbed.tsx
Y=.github/workflows/ci.yml
# przełącznik
run M1-flag-or $P "return raw === '1' && isLeadConfigEnabled(leadConfig);" "return raw === '1' || isLeadConfigEnabled(leadConfig);"
run M2-flag-any-truthy $P "return raw === '1' && isLeadConfigEnabled(leadConfig);" "return Boolean(raw) && isLeadConfigEnabled(leadConfig);"
run M3-flag-no-lead-config $P "return raw === '1' && isLeadConfigEnabled(leadConfig);" "return raw === '1';"
# zdarzenie calculator_booking_open
run M4-event-always $H "if (isBookingEmbedEnabled()) trackCalculatorBookingOpen" "if (true) trackCalculatorBookingOpen"
run M5-event-dropped $H "if (isBookingEmbedEnabled()) trackCalculatorBookingOpen({ variant: 'a' });" "if (isBookingEmbedEnabled()) void 0;"
run M6-event-with-email $H "if (isBookingEmbedEnabled()) trackCalculatorBookingOpen({ variant: 'a' });" "if (isBookingEmbedEnabled()) trackEvent('calculator_booking_open', { source: 'wycena', variant: 'a', email });"
run M7-event-before-post $H "      trackEvent('calculator_submit', { source: window.location.pathname });" "      trackEvent('calculator_submit', { source: window.location.pathname });
      if (isBookingEmbedEnabled()) trackCalculatorBookingOpen({ variant: 'a' });"
run M14-event-variant-b $H "trackCalculatorBookingOpen({ variant: 'a' })" "trackCalculatorBookingOpen({ variant: 'b' })"
# ramka
run M8-frame-always $C "booking={isBookingEmbedEnabled() ? <BookingEmbed /> : null}" "booking={<BookingEmbed />}"
run M9-frame-before-click $C "{c.phase === 'loading' && <CalculatorLoading />}" "{c.phase === 'loading' && <CalculatorLoading />}
      {isBookingEmbedEnabled() && <BookingEmbed />}"
run M10-result-drops-slot $R "    {booking}
" ""
run M11-frame-other-src $B "src={CALENDAR_IFRAME_SRC}" "src=\"about:blank\""
# ci.yml: produkcja wyłączona
run M12-ci-prod-on $Y "VITE_MM_BOOKING_EMBED: \${{ steps.target.outputs.target == 'preview' && '1' || '' }}" "VITE_MM_BOOKING_EMBED: '1'"
run M13-ci-flag-missing $Y "          VITE_MM_BOOKING_EMBED: \${{ steps.target.outputs.target == 'preview' && '1' || '' }} # MIX-1814: terminy pod wynikiem
" ""
echo "MUT NOMATCH=$NM"
[ "$NM" -eq 0 ]
