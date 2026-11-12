#!/usr/bin/env bash
# MIX-1411: celowany bieg kontrolny (jeden bieg w zamku): testy menu, pomiar w przeglądarce
# (wariant B i stare menu), rozmiar JS, mutanty. Ścieżki względne do katalogu repo.
#   bash scripts/run-m1411.sh [katalog-wynikow=.bieg/m1411]
# Wynik: <katalog>/run-m1411.tsv (krok, rc); rc 0 = wszystkie kroki rc 0.
set -u
OUT="${1:-.bieg/m1411}"
mkdir -p "$OUT"
: > "$OUT/run-m1411.tsv"
fail=0
step() {
  local name=$1
  shift
  "$@" > "$OUT/krok-$name.log" 2>&1
  local rc=$?
  echo -e "$name\t$rc" | tee -a "$OUT/run-m1411.tsv"
  [ "$rc" -ne 0 ] && fail=1
}
step testy npx vitest related components/layout/Navbar.tsx components/layout/MobileMenuB.tsx \
  components/layout/mobileMenuFlag.ts tests/components/mobileMenuB.test.tsx \
  tests/components/mobileMenuOffDom.test.tsx --run --maxWorkers=2
step rozmiar node scripts/size-mobile-menu-b.mjs 2048
step sonda-B node scripts/probe-mobile-menu-b.mjs "$OUT/sonda-B"
step sonda-off node scripts/probe-mobile-menu-b.mjs "$OUT/sonda-off" --off
step mutanty bash scripts/mutants-m1411.sh "$OUT/mutanty"
echo -e "RAZEM\t$fail" | tee -a "$OUT/run-m1411.tsv"
exit "$fail"
