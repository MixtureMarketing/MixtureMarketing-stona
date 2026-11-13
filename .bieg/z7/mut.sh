#!/usr/bin/env bash
# Mutation checks on the committed tree: one mutant at a time, restore only that file.
set -u
OUT=.bieg/z7
: > "$OUT/mut.txt"
T1=functions/api/contact-submit.test.ts
T2=functions/api/leady/ponow.test.ts
run() { # id file test sed-expr
  local id=$1 f=$2 t=$3 expr=$4
  cp "$f" "$OUT/orig.tmp"
  sed -i "$expr" "$f"
  if cmp -s "$f" "$OUT/orig.tmp"; then echo "$id NOCHANGE" >> "$OUT/mut.txt"; return; fi
  git diff -U0 -- "$f" | grep '^[-+][^-+]' > "$OUT/mut-$id.diff"
  npx vitest run --maxWorkers=2 "$t" > "$OUT/mut-$id.log" 2>&1; local rc=$?
  git checkout -- "$f"
  echo "$id rc=$rc $(grep -E 'Tests ' "$OUT/mut-$id.log" | tr -s ' ')" >> "$OUT/mut.txt"
}
run M1 functions/api/_shared/limity.ts $T1 's/^export const KROK_MAX = 3;/export const KROK_MAX = 4;/'
run M2 functions/api/_shared/limity.ts $T1 's/^    !Number.isInteger(wartosc) ||$//'
run M3 functions/api/_shared/limity.ts $T1 "s/^    typeof wartosc !== 'number' ||\$//"
run M4 functions/api/contact-submit.ts $T1 's/sprawdzKrok(body.step),/null,/'
run M5 functions/api/leady/ponow.ts $T2 "s/^  if (tekst.trim() === '') return {};//"
run M6 functions/api/_linear.ts $T2 's/opcje.limit ?? 20/opcje.limit ?? 50/'
run M7 functions/api/crm/_podpis.ts $T2 's/adres.pathname + adres.search/adres.pathname/'
run M8 functions/api/leady/ponow.ts $T2 's/(limit as number) <= 50/(limit as number) <= 500/'
git status --short >> "$OUT/mut.txt"
echo DONE >> "$OUT/mut.txt"
