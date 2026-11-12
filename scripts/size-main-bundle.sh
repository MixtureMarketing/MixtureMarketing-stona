#!/usr/bin/env bash
# MIX-1326 kryt. 3: rozmiar głównego bundla (dist/assets/index-*.js, gzip -9) PRZED i PO dodaniu
# sekcji opinii, oraz z włączonym przełącznikiem (sekcja ma być osobnym chunkiem).
#   bash scripts/size-main-bundle.sh [limit-bajtow-gzip=1024]
# "Przed" = to samo drzewo, w którym 4 zmienione pliki (Home, PortfolioPage, cmsService, types/sanity)
# mają treść z integracji 83be22f (scripts/m1326-base/); nowe pliki sekcji nie są wtedy w grafie importów.
# Wynik do .bieg/m1326/size-<id>/size.txt; kod 0 = wzrost <= limit (przełącznik wyłączony), 1 = ponad limit.
# Tylko `vite build` (bez prerendera i obrazów), bo mierzony jest wyłącznie bundel JS.
set -euo pipefail
limit="${1:-1024}"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
out=".bieg/m1326/size-$(date +%s)"
mkdir -p "$out"
# (node_modules rozwiązuje się z katalogu repo wyżej, bez dowiązań) kopia robocza bez node_modules i katalogów wynikowych; pliki bazowe nadpisują zmienione
mkdir -p "$out/base"
tar --exclude=./node_modules --exclude=./.bieg --exclude=./.bieg-stacja --exclude=./dist --exclude=./.git -cf - . | tar -xf - -C "$out/base"
cp scripts/m1326-base/components_pages_Home.tsx.txt "$out/base/components/pages/Home.tsx"
cp scripts/m1326-base/components_pages_PortfolioPage.tsx.txt "$out/base/components/pages/PortfolioPage.tsx"
cp scripts/m1326-base/services_cmsService.ts.txt "$out/base/services/cmsService.ts"
cp scripts/m1326-base/types_sanity.ts.txt "$out/base/types/sanity.ts"
(cd "$out/base" && npx vite build --outDir dist >/dev/null)
env -u VITE_MM_TESTIMONIALS npx vite build --outDir "$out/dist-off" >/dev/null
VITE_MM_TESTIMONIALS=1 npx vite build --outDir "$out/dist-on" >/dev/null
gzsum() {
  local t=0 f
  for f in "$1"/assets/index-*.js; do t=$((t + $(gzip -9 -c "$f" | wc -c))); done
  echo "$t"
}
b=$(gzsum "$out/base/dist")
a=$(gzsum "$out/dist-off")
o=$(gzsum "$out/dist-on")
{
  echo "commit=$(git rev-parse HEAD 2>/dev/null || echo brak-git)"
  echo "index-*.js gzip: przed=$b po(wyl)=$a po(wl)=$o"
  echo "wzrost(wyl)=$((a - b)) B, wzrost(wl)=$((o - b)) B, limit=$limit B"
  echo "chunk Testimonials: wyl=$(find "$out/dist-off/assets" -name 'Testimonials*' | wc -l) wl=$(find "$out/dist-on/assets" -name 'Testimonials*' | wc -l)"
  echo "testimonials-heading w index-*.js (wyl): $(cat "$out"/dist-off/assets/index-*.js | grep -c 'testimonials-heading' || true)"
  echo "pliki Home*.js gzip: przed=$(gzip -9 -c "$out"/base/dist/assets/Home-*.js | wc -c) po(wyl)=$(gzip -9 -c "$out"/dist-off/assets/Home-*.js | wc -c)"
} | tee "$out/size.txt"
[ $((a - b)) -le "$limit" ]
