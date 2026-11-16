#!/usr/bin/env bash
# MIX-1662: mutanty skanu stron ukrytych. Każdy: jedna zmiana w jednym pliku, node --check, vitest
# tests/seo/llmsTxt.test.ts, przywrócenie tego pliku (git checkout -- <plik>). Z korzenia repo.
set -u
OUT=.bieg/r/mix1662; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
L=scripts/lib/llms.js
mut() {
  local name=$1 f=$2 from=$3 to=$4
  node .bieg/mix1657/mutate.mjs "$f" "$from" "$to" || { echo "mutant $name: BLAD WZORCA" | tee -a "$OUT/mutants.txt"; return; }
  if ! node --check "$f" > /dev/null 2>&1; then git checkout -- "$f"; echo "mutant $name: NIEWAZNY (skladnia)" | tee -a "$OUT/mutants.txt"; return; fi
  npx vitest run tests/seo/llmsTxt.test.ts --maxWorkers=2 > "$OUT/mut-$name.log" 2>&1
  local rc=$?
  git checkout -- "$f"
  local t; t=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
  if [ $rc -ne 0 ]; then echo "mutant $name: zabity (rc=$rc;$t)" | tee -a "$OUT/mutants.txt"; else echo "mutant $name: PRZEZYL ($t)" | tee -a "$OUT/mutants.txt"; fi
}
mut N1-fold-off "$L" "String(s).replace(LOOKALIKE_SLASH_RE, '/').replace(LOOKALIKE_HYPHEN_RE, '-');" 'String(s);'
mut N2-noslash-off "$L" "if (rel !== '') out.push(" 'if (false) out.push('
mut N3-join-off "$L" "lines.map((l) => norm(l).replace(LINE_MARK_RE, '')).join('');" 'norm(text);'
mut N4-token-substring "$L" 'if (!token) return s.includes(needle);' 'return s.includes(needle);'
mut N5-single-bare "$L" "rel.includes('/') ? rel : \`\${rel}/\`" 'rel'
mut N6-hyphen-fold-off "$L" ".replace(LOOKALIKE_HYPHEN_RE, '-');" ';'
mut N7-marks-kept "$L" "norm(l).replace(LINE_MARK_RE, '')" 'norm(l)'
mut N8-flat-no-token "$L" "(token && !needle.slice(0, -1).includes('/'))" 'token'
mut N9-line-fold-off "$L" 'const low = foldLookalikes(norm(raw).toLowerCase());' 'const low = norm(raw).toLowerCase();'
mut N10-slash-fold-off "$L" "String(s).replace(LOOKALIKE_SLASH_RE, '/')" 'String(s)'
git status --porcelain -- "$L"
echo "mutanty: $(grep -c zabity "$OUT/mutants.txt") zabite, $(grep -c PRZEZYL "$OUT/mutants.txt") przezylo, $(grep -cE 'BLAD|NIEWAZNY' "$OUT/mutants.txt") bledne"
