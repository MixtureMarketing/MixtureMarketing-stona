#!/usr/bin/env bash
# shellcheck disable=SC2016,SC2126
# MIX-1813 mutants (wzór .bieg/m1810/mut.sh): green baseline first; one mutant at a time, confirm the
# text was present (NOMATCH = script fails), run the affected tests, restore THAT file only.
# Killed = a named test failed.
set -u
NM=0
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1813/mut
mkdir -p "$OUT"
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
T="functions/api/estimation/_leadConfig.test.ts functions/api/crm/crm.leadconfig.test.ts components/features/calculator/LeadConfig.switch.test.tsx functions/api/estimation/public-quote.test.ts functions/api/crm/crm.test.ts"
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
L=functions/api/estimation/_leadConfig.ts
Q=functions/api/estimation/public-quote.ts
P=components/features/calculator/livePrice.ts
H=hooks/usePublicCalculator.ts
F=components/features/calculator/CalculatorForm.tsx
# K3 przełącznik serwera (allowlista, fail-closed)
run M1-switch-any-truthy $L "if (raw === '1') return { on: true" "if (raw) return { on: true"
run M2-switch-no-reason-line $L 'return { on: false, reason: `konfiguracja: ${LEAD_CONFIG_ENV}` }' 'return { on: false, reason: null }'
run M3-off-still-reads-phone $Q 'if (!sw.on) return { on: false };' ''
run M4-off-uses-new-insert $Q 'if (extra === null) {' 'if (false) {'
# K4 telefon
run M5-phone-charset-open $L 'const PHONE_ALLOWED = /^\+?[0-9 ().-]+$/;' 'const PHONE_ALLOWED = /^[\s\S]+$/;'
run M6-phone-length-guard-dropped $L 'if (raw.length > PHONE_RAW_MAX) return { ok: false, reason: PHONE_REFUSAL.tooLong };' ''
run M7-phone-e164-max-16 $L 'e164.length > 15' 'e164.length > 16'
run M8-phone-pl-prefix-dropped $L 'else if (digits.length === 9) e164 = `48${digits}`;' ''
run M9-phone-refusal-without-reason $Q 'return json({ error: PHONE_MESSAGE, reason: ph.reason }, 400);' 'return json({ error: PHONE_MESSAGE }, 400);'
run M10-phone-value-in-log $Q 'console.error(`[quote] odmowa 400: ${ph.reason} ray=' 'console.error(`[quote] odmowa 400: ${ph.reason} ${String(raw)} ray='
# K1 etykiety, link, plan, telefon w details
run M11-label-is-raw-value $L "return typeof value === 'string' ? (byValue.get(value) ?? null) : null;" "return typeof value === 'string' ? value : null;"
run M12-multiselect-partial-unknown $L "return words.every((w) => typeof w === 'string') ? words.join(', ') : null;" "return words.filter(Boolean).join(', ');"
run M13-bool-words-swapped $L "(value ? 'Tak' : 'Nie')" "(value ? 'Nie' : 'Tak')"
run M14-config-link-dropped $L 'if (link !== null) details.config_link = link;' ''
run M15-plan-dropped $L 'if (input.plan && Object.keys(input.plan).length > 0) details.plan = { ...input.plan };' ''
run M16-phone-not-in-details $L 'if (input.phone !== null) details.phone = input.phone;' ''
# Klient (VITE_MM_LEAD_CONFIG)
run M17-client-flag-falls-back $P $'czyli wartość VITE_MM_LIVE_PRICE_BAR.\n  return raw === \'1\' || raw === \'true\';' $'czyli wartość VITE_MM_LIVE_PRICE_BAR.\n  return isLivePriceBarEnabled(raw);'
run M18-client-sends-empty-phone $H "phone.trim() !== ''" "true"
run M19-client-label-always-new $F "leadConfig ? 'Wyślij i umów rozmowę' : 'Poznaj widełki'" "'Wyślij i umów rozmowę'"
echo "git status after: $(git status --porcelain | grep -v '^??' | wc -l) modified"
echo "NOMATCH count: $NM"
[ "$NM" -eq 0 ] || { echo "MUT FAIL: $NM mutant(s) did not apply"; exit 3; }
