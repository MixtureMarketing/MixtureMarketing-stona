#!/usr/bin/env bash
# MIX-1400: pelny bieg kontrolny (przed/po/mutanty). Uruchamiac z katalogu repo przez ciezki-bieg.
# Wymaga zacommitowanej poprawki w index.css (HEAD). Wyniki: .bieg/m1400/ (summary.txt).
set -u
OUT=.bieg/m1400
BASE=36ab991
VT="npx vitest run tests/styles/cookieButtonOffset.test.ts --maxWorkers=2"
mkdir -p "$OUT"
S="$OUT/summary.txt"
: > "$S"
say() { echo "$*" | tee -a "$S"; }

git diff --quiet -- index.css || { say "BLAD: index.css ma niezacommitowane zmiany"; exit 9; }
restore() { git checkout -- index.css; }
trap restore EXIT

build() { npx vite build --outDir "$OUT/dist-$1" --emptyOutDir > "$OUT/build-$1.log" 2>&1; echo $?; }

# PO (HEAD z poprawka)
say "build po rc=$(build po)"
node scripts/probe-cookie-sticky.mjs "$OUT/dist-po" "$OUT" po > "$OUT/probe-po.log" 2>&1; say "probe po rc=$?"; tail -n 5 "$OUT/probe-po.log" | tee -a "$S"
$VT > "$OUT/vitest-po.log" 2>&1; say "vitest po rc=$?"

# PRZED (index.css z $BASE = mutant 'regula w base')
git show "$BASE:index.css" > index.css
say "build przed rc=$(build przed)"
node scripts/probe-cookie-sticky.mjs "$OUT/dist-przed" "$OUT" przed > "$OUT/probe-przed.log" 2>&1; say "probe przed rc=$? (oczekiwane 1)"; tail -n 25 "$OUT/probe-przed.log" | tee -a "$S"
$VT > "$OUT/vitest-przed.log" 2>&1; say "vitest przed rc=$? (oczekiwane 1, mutant base)"
restore

# strony bez paska i desktop: przed vs po
node scripts/probe-cookie-sticky.mjs --compare "$OUT/przed.json" "$OUT/po.json" > "$OUT/compare.log" 2>&1; say "compare rc=$?"; cat "$OUT/compare.log" | tee -a "$S"

# MUTANTY (na poprawce z HEAD)
for m in selektor desktop wartosc; do
  node scripts/mutate-cookie-css.mjs "$m" > "$OUT/mut-$m.log" 2>&1 || { say "mutant $m: BLAD mutacji rc=$?"; restore; continue; }
  b=$(build "mut-$m")
  node scripts/probe-cookie-sticky.mjs "$OUT/dist-mut-$m" "$OUT" "mut-$m" > "$OUT/probe-mut-$m.log" 2>&1; p=$?
  $VT > "$OUT/vitest-mut-$m.log" 2>&1; v=$?
  say "mutant $m: build rc=$b probe rc=$p vitest rc=$v (zabity gdy probe!=0 lub vitest!=0)"
  restore
done
# prog768: pasek jest md:hidden, 1366 px tego nie widzi: tylko test jednostkowy
node scripts/mutate-cookie-css.mjs prog768 > "$OUT/mut-prog768.log" 2>&1 || say "mutant prog768: BLAD mutacji"
$VT > "$OUT/vitest-mut-prog768.log" 2>&1; say "mutant prog768: vitest rc=$? (zabity gdy != 0)"
restore
say "KONIEC"
