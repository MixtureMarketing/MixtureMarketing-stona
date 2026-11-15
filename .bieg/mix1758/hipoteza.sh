#!/usr/bin/env bash
# MIX-1758 C: sonda przyczyny szybkiego podwojnego cofniecia (12-30 ms, "/" przewiniete na 300 konczy na 10/25 przy 375,
# 29/64/131 przy 1280). Hipoteza: 77cad32 (MIX-1729) przechwytuje drugie cofniecie (Navigation API intercept,
# scroll 'manual') takze wtedy, gdy nasza lista jeszcze nie byla przewinieta; na MIX-1711 (bez przechwycenia)
# przegladarka przywracala "/" na 300 (klasa OFF/base) i .bieg/mix1711/classes.sh byl GREEN.
# Wariant (argument):
#   bez   = przechwycenie wylaczone (suppressTraverseRestore(null)): dowod przypisania; oczekiwane ON GREEN
#   brama = propozycja .bieg/mix1758/brama.patch: przechwycenie tylko po naszym przewinieciu listy (undo != null)
# Potem dla wariantu brama: bash .bieg/mix1719/classes.sh 375|1280 i .bieg/mix1741/footer.sh (regresja 130-260, stopka).
# Z korzenia repo, na czystym drzewie (bez dist-*). Pliki przywracane przez git checkout tylko tych dwoch plikow.
set -u
V=${1:?uzycie: hipoteza.sh bez|brama}
SKIP=utils/caseStudyBackSkip.ts; ROOT=utils/caseStudyRootScroll.ts
[ -z "$(git status --porcelain -- "$SKIP" "$ROOT")" ] || { echo "STOP: $SKIP/$ROOT nie sa czyste"; exit 2; }
case "$V" in
  bez)
    sed -i 's/^  const unsuppress = suppressTraverseRestore(host);$/  const unsuppress = suppressTraverseRestore(null);/' "$SKIP"
    grep -qxF '  const unsuppress = suppressTraverseRestore(null);' "$SKIP" || { echo "STOP: wariant bez nie zastosowany"; git checkout -- "$SKIP"; exit 2; } ;;
  brama)
    git apply .bieg/mix1758/brama.patch || { echo "STOP: brama.patch nie wchodzi"; exit 2; }
    grep -qF '() => undo !== null' "$SKIP" || { echo "STOP: brama nie zastosowana"; git checkout -- "$SKIP" "$ROOT"; exit 2; } ;;
  *) echo "wariant $V niedozwolony"; exit 2 ;;
esac
echo "WARIANT=$V HEAD=$(git rev-parse HEAD) diff: $(git diff --stat -- "$SKIP" "$ROOT" | tail -n 1)"
bash .bieg/mix1711/classes.sh; rc=$?
git checkout -- "$SKIP" "$ROOT"
echo "przywrocone: $(git status --porcelain -- "$SKIP" "$ROOT" | wc -l) zmienionych"
# wlasne wyniki budowy tego biegu (dist-on, dist-on0, dist-off, dist-base) zdejmowane, zeby nastepny bieg mial czyste drzewo
rm -rf dist-on dist-on0 dist-off dist-base
echo "HIPOTEZA $V classes rc=$rc"
exit $rc
