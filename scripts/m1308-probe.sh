#!/usr/bin/env bash
# MIX-1308: dwie lokalne budowy (przełącznik włączony / wyłączony) i próba przejść w Chromium.
# Uruchamiaj z katalogu repo: bash scripts/m1308-probe.sh   (wyniki: .bieg/m1308/)
# Kod wyjścia != 0, gdy którykolwiek krok jest czerwony. Id projektu Sanity jest publiczne
# (widać je w każdym adresie obrazka cdn.sanity.io), więc podajemy je jawnie.
set -u
OUT=.bieg/m1308
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
rc_total=0
step() {
  local name=$1
  shift
  "$@" > "$OUT/$name.log" 2>&1
  local rc=$?
  echo "STEP $name rc=$rc"
  [ "$rc" -ne 0 ] && rc_total=1
  return 0
}
step build-on env VITE_MM_VIEW_TRANSITIONS=1 npx vite build --outDir "$OUT/dist-on" --emptyOutDir
step build-off env -u VITE_MM_VIEW_TRANSITIONS npx vite build --outDir "$OUT/dist-off" --emptyOutDir
step probe node scripts/probe-view-transitions.mjs "$OUT/dist-on" "$OUT/dist-off" "$OUT/probe"
echo "CALOSC rc=$rc_total"
exit "$rc_total"
