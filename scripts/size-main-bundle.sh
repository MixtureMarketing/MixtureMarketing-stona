#!/usr/bin/env bash
# MIX-1326 kryt. 3: rozmiar głównego bundla (dist/assets/index-*.js, gzip -9) PRZED i PO dodaniu
# sekcji opinii, oraz z włączonym przełącznikiem (sekcja ma być osobnym chunkiem).
#   bash scripts/size-main-bundle.sh <SHA-bazowy> [limit-bajtow-gzip=1024]
# Wynik do .bieg/m1326/size-<id>/size.txt; kod 0 = wzrost <= limit (przełącznik wyłączony), 1 = ponad limit.
# Tylko `vite build` (bez prerendera i obrazów), bo mierzony jest wyłącznie bundel JS.
set -euo pipefail
base="${1:?SHA bazowy}"
limit="${2:-1024}"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
out=".bieg/m1326/size-$(date +%s)"
mkdir -p "$out/base"
git archive "$base" | tar -x -C "$out/base"
ln -s "$PWD/node_modules" "$out/base/node_modules"
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
  echo "commit=$(git rev-parse HEAD) baza=$base"
  echo "index-*.js gzip: przed=$b po(wyl)=$a po(wl)=$o"
  echo "wzrost(wyl)=$((a - b)) B, wzrost(wl)=$((o - b)) B, limit=$limit B"
  echo "chunk Testimonials: wyl=$(find "$out/dist-off/assets" -name 'Testimonials*' | wc -l) wl=$(find "$out/dist-on/assets" -name 'Testimonials*' | wc -l)"
  echo "testimonials-heading w index-*.js (wyl): $(cat "$out"/dist-off/assets/index-*.js | grep -c 'testimonials-heading' || true)"
} | tee "$out/size.txt"
[ $((a - b)) -le "$limit" ]
