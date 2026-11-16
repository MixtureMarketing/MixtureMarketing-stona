#!/usr/bin/env bash
# MIX-1808 mutants (wzór .bieg/m1799/mut.sh): green baseline first; one mutant at a time, confirm the
# text was present, run the affected tests, restore THAT file. Killed = a named test failed.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1808/mut
mkdir -p "$OUT"
T="lib/estimation/publicScope.test.ts lib/estimation/publicScope.invisible.test.ts services/pricePreviewService.scope.test.ts"
echo "MUT HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
npx vitest run $T --maxWorkers=2 > "$OUT/baseline.log" 2>&1; brc=$?
echo "MUT baseline rc=$brc $(clean "$OUT/baseline.log" | grep -aE '^\s+Tests ' | tr -s ' ')"
if [ "$brc" -ne 0 ]; then echo "MUT ABORT: baseline red, mutants not run"; exit 1; fi
run() { # name file from to
  local name="$1" f="$2" from="$3" to="$4"
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");const a=process.env.FROM,b=process.env.TO;if(!s.includes(a)){process.exit(3)}fs.writeFileSync(f,s.replace(a,b))' "$f" || { echo "$name NOMATCH"; return; }
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
run M5-034F-dropped $S '͏ᅟ' 'ᅟ'
run M6-3164-dropped $S '⁪-⁯ㅤ' '⁪-⁯'
run M7-115F-1160-dropped $S 'ᅟᅠ' ''
run M8-FFA0-dropped $S 'ㅤﾠ' 'ㅤ'
run M9-180B-180F-dropped $S '᠋-᠏' ''
run M10-tags-E0000-dropped $S '\u{E0000}-\u{E0FFF}' ''
run M11-variation-selector-not-stripped $S "(m, base: string | undefined) => (base ? m : '')" "(m) => m"
run M12-variation-selector-always-stripped $S "(base ? m : '')" "('')"
run M13-17B4-dropped $S '឴឵' ''
run M14-client-helper-bypassed $V "const name = cleanClientText(rec.client_name, SCOPE_NAME_MAX);" "const name = typeof rec.client_name === 'string' && rec.client_name.trim() !== '' && rec.client_name.length <= SCOPE_NAME_MAX ? rec.client_name.trim() : null;"
echo "git status after: $(git status --porcelain | grep -v '^??' | wc -l) modified"
