#!/usr/bin/env bash
# MIX-1810 mutants (wzór .bieg/m1808/mut.sh; M1-M14 z MIX-1808, P1/P2/P7/P8 weryfikatora MIX-1808, V1-V14 nowe): green baseline first; one mutant at a time, confirm the
# text was present, run the affected tests, restore THAT file. Killed = a named test failed.
set -u
NM=0
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1810/mut
mkdir -p "$OUT"
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
T="lib/estimation/publicScope.test.ts lib/estimation/publicScope.invisible.test.ts lib/estimation/publicScope.attack.test.ts lib/estimation/publicScope.visible.test.ts services/pricePreviewService.scope.test.ts"
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
S=lib/estimation/publicScope.ts
V=services/pricePreviewService.ts
run M1-Cf-dropped $S '[\p{Cf}\p{Cs}' '[\p{Cs}'
run M2-Cs-dropped $S '\p{Cf}\p{Cs}' '\p{Cf}'
run M3-Cc-dropped $S '(?![\t\n\r])\p{Cc}|' ''
run M4-Cc-keeps-no-tab-newline $S '(?![\t\n\r])\p{Cc}' '\p{Cc}'
run M5-034F-dropped $S '\u034F\u115F' '\u115F'
run M6-3164-dropped $S '\u206F\u3164' '\u206F'
run M7-115F-1160-dropped $S '\u115F\u1160' ''
run M8-FFA0-dropped $S '\u3164\uFFA0' '\u3164'
run M9-180B-180F-dropped $S '\u180B-\u180F' ''
run M10-tags-E0000-dropped $S '\u{E0000}-\u{E0FFF}' ''
run M11-variation-selector-not-stripped $S "(m, base: string | undefined) => (base ? m : '')" "(m) => m"
run M12-variation-selector-always-stripped $S "(base ? m : '')" "('')"
run M13-17B4-dropped $S '\u17B4\u17B5' ''
run M14-client-helper-bypassed $V "const name = cleanClientText(rec.client_name, SCOPE_NAME_MAX);" "const name = typeof rec.client_name === 'string' && rec.client_name.trim() !== '' && rec.client_name.length <= SCOPE_NAME_MAX ? rec.client_name.trim() : null;"
# Mutanty weryfikatora MIX-1808, które przeżyły testy kodera (K1): zabija je publicScope.attack.test.ts.
run P1-CR-not-kept $S '(?![\t\n\r])' '(?![\t\n])'
P2F=".replace(INVISIBLE, '')
    .replace(VARIATION_SELECTOR, (m, base: string | undefined) => (base ? m : ''))"
P2T=".replace(VARIATION_SELECTOR, (m, base: string | undefined) => (base ? m : ''))
    .replace(INVISIBLE, '')"
run P2-step-order-swapped $S "$P2F" "$P2T"
run P7-FE00-FE0E-not-in-VS $S '[\uFE00-\uFE0F]/gu' '[\uFE0F]/gu'
run P8-keycap-hash-star-dropped $S '|[0-9#*])?' '|[0-9])?'
# MIX-1810 (K2, K3): znak widoczny.
run V1-visible-check-dropped $S ' || !VISIBLE.test(t)' ''
run V2-L-dropped $S '[\p{L}\p{N}\p{P}\p{S}]/u' '[\p{N}\p{P}\p{S}]/u'
run V3-N-dropped $S '\p{L}\p{N}\p{P}' '\p{L}\p{P}'
run V4-P-dropped $S '\p{N}\p{P}\p{S}]/u' '\p{N}\p{S}]/u'
run V5-S-dropped $S '\p{P}\p{S}]/u' '\p{P}]/u'
run V6-2800-blank-dropped $S '(?![\u2800\uFFFC' '(?![\uFFFC'
run V7-FFFC-blank-dropped $S '\u2800\uFFFC\u{1D159}' '\u2800\u{1D159}'
run V8-1D159-blank-dropped $S '\uFFFC\u{1D159}]' '\uFFFC]'
run V9-blank-lookahead-dropped $S '(?![\u2800\uFFFC\u{1D159}])[\p{L}' '[\p{L}'
run V10-visible-on-raw-text $S '!VISIBLE.test(t)' '!VISIBLE.test(raw)'
run V11-visible-g-flag $S '\p{S}]/u;' '\p{S}]/gu;'
run V12-VS-symbol-base-dropped $S '(\p{S}|[\u203C' '([\u203C'
run V13-VS-emoji-outside-S-dropped $S '[\u203C\u2049\u2139\u3030\u303D]|' ''
run V14-Extended_Pictographic-back $S '(\p{S}|' '(\p{Extended_Pictographic}|'
echo "git status after: $(git status --porcelain | grep -v '^??' | wc -l) modified"
echo "NOMATCH count: $NM"
[ "$NM" -eq 0 ] || { echo "MUT FAIL: $NM mutant(s) did not apply"; exit 3; }
