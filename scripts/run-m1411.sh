#!/usr/bin/env bash
# MIX-1411: celowany bieg kontrolny: tsc, testy menu, pomiar w przeglądarce (wariant B i stare
# menu), rozmiar JS, mutanty. Ścieżki względne do katalogu repo.
#   bash scripts/run-m1411.sh [katalog-wynikow=.bieg/m1411] [krok...]
# Kroki: tsc testy rozmiar sonda-B sonda-off mutanty (domyślnie wszystkie; każdy zmieści się
# w szybkim torze zamka, gdy podany osobno). Wynik: <katalog>/run-m1411-<kroki>.tsv (krok, rc);
# rc 0 = wszystkie wybrane kroki rc 0; nieznany krok = rc 2.
set -u
OUT="${1:-.bieg/m1411}"
shift || true
ALL=(tsc testy rozmiar sonda-B sonda-off mutanty)
if [ "$#" -gt 0 ]; then STEPS=("$@"); else STEPS=("${ALL[@]}"); fi
mkdir -p "$OUT"
TSV="$OUT/run-m1411-$(IFS=_; echo "${STEPS[*]}").tsv"
: > "$TSV"
fail=0
run() {
  local name=$1
  shift
  "$@" > "$OUT/krok-$name.log" 2>&1
  local rc=$?
  echo -e "$name\t$rc" | tee -a "$TSV"
  [ "$rc" -ne 0 ] && fail=1
}
for s in "${STEPS[@]}"; do
  case "$s" in
    tsc) run tsc npx tsc --noEmit -p tsconfig.json ;;
    testy)
      run testy npx vitest related components/layout/Navbar.tsx components/layout/MobileMenuB.tsx \
        components/layout/mobileMenuFlag.ts tests/components/mobileMenuB.test.tsx \
        tests/components/mobileMenuOffDom.test.tsx --run --maxWorkers=2
      ;;
    rozmiar) run rozmiar node scripts/size-mobile-menu-b.mjs 2048 ;;
    sonda-B) run sonda-B node scripts/probe-mobile-menu-b.mjs "$OUT/sonda-B" ;;
    sonda-off) run sonda-off node scripts/probe-mobile-menu-b.mjs "$OUT/sonda-off" --off ;;
    mutanty) run mutanty bash scripts/mutants-m1411.sh "$OUT/mutanty" ;;
    *)
      echo "ODMOWA: nieznany krok '$s' (dozwolone: ${ALL[*]})" | tee -a "$TSV" >&2
      exit 2
      ;;
  esac
done
echo -e "RAZEM\t$fail" | tee -a "$TSV"
exit "$fail"
