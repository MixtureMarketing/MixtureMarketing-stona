#!/usr/bin/env bash
# MIX-1670: mutanty (dżoker, tablica przed małymi literami, pary rn/cl/vv, plik z repo). Najpierw bieg
# bazowy bez zmian (musi być zielony), potem każdy mutant: jedna zmiana w jednym pliku, node --check,
# vitest tests/seo/llmsTxt.test.ts, przywrócenie tego pliku (git checkout -- <plik>). Z korzenia repo.
set -u
OUT=.bieg/r/mix1670; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
L=scripts/lib/llms.js
npx vitest run tests/seo/llmsTxt.test.ts --maxWorkers=2 > "$OUT/mut-baseline.log" 2>&1
b=$?; bt=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-baseline.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
echo "baseline: rc=$b;$bt" | tee -a "$OUT/mutants.txt"
[ $b -eq 0 ] || { echo "baseline czerwony: mutanty pominięte" | tee -a "$OUT/mutants.txt"; exit 1; }
mut() {
  local name=$1 f=$2 from=$3 to=$4
  node .bieg/mix1657/mutate.mjs "$f" "$from" "$to" || { echo "mutant $name: BLAD WZORCA" | tee -a "$OUT/mutants.txt"; return; }
  if ! node --check "$f" > /dev/null 2>&1; then git checkout -- "$f"; echo "mutant $name: NIEWAZNY (skladnia)" | tee -a "$OUT/mutants.txt"; return; fi
  local d; d=$(git diff --numstat -- "$f" | tr '\t' ' ')
  npx vitest run tests/seo/llmsTxt.test.ts --maxWorkers=2 > "$OUT/mut-$name.log" 2>&1
  local rc=$?
  git checkout -- "$f"
  local t; t=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
  if [ $rc -ne 0 ]; then echo "mutant $name: zabity (rc=$rc; diff=[$d];$t)" | tee -a "$OUT/mutants.txt"; else echo "mutant $name: PRZEZYL (diff=[$d];$t)" | tee -a "$OUT/mutants.txt"; fi
}
mut M1-map-after-casefold "$L" 'const m = SKELETON_MAP.get(c) ?? fold(noMarks(c.toLowerCase()));' 'const m = fold(noMarks(c.toLowerCase()));'
mut M2-greek-caps-row-off "$L" "  ['ΑΒΕΖΗΙΚΜΝΟΡΤΥΧИ', 'abezhikmnoptyxn'],"$'\n' ''
mut M3-wildcard-off "$L" 'else if (isWild(c)) out += WILDCARD;' 'else if (false) out += WILDCARD;'
mut M4-wildcard-not-separator "$L" 'if (q > 0 && !isAlnum(t)) put(j + 1, q);' 'if (q > 0 && !isAlnum(t) && t !== WILDCARD) put(j + 1, q);'
mut M5-wildcard-not-letter "$L" 'const fits = (t, k) => t === k || t === WILDCARD;' 'const fits = (t, k) => t === k;'
mut M6-symbols-not-wild "$L" " || (c > '\\x7f' && /\\p{S}/u.test(c))" ''
mut M7-boundary-wildcard-as-letter "$L" 'if (!isAlnum(s[j - 1])) put(j, 0);' 'if (!isAlnum(s[j - 1]) && s[j - 1] !== WILDCARD) put(j, 0);'
mut M8-pairs-off-long "$L" 'for (const [one, two] of LOOK_PAIRS) {' 'for (const [one, two] of []) {'
mut M9-pairs-reverse-off "$L" 'if (k.startsWith(two, q) && fits(t, one)) put(j + 1, q + 2);' 'if (false) put(j + 1, q + 2);'
mut M10-short-pairs-off "$L" 'const one = LOOK_PAIRS.find(([o]) => o === seg[i]);' 'const one = undefined;'
mut M11-short-hard-no-wildcard "$L" 'const HARD = `[/${WILDCARD}]`;' "const HARD = '/';"
mut M12-letters-skippable "$L" 'if (q > 0 && !isAlnum(t)) put(j + 1, q);' 'if (q > 0) put(j + 1, q);'
mut M13-no-end-boundary "$L" '          if (!isAlnum(t)) return true;' '          return true;'
echo "after: porcelain=$(git status --porcelain -- scripts tests | wc -l)" | tee -a "$OUT/mutants.txt"
