#!/usr/bin/env bash
# MIX-1814: only the local builds (switch on/off) and the 390 px probe, screenshots as base64.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1814/full
mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD)"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "STEP $n rc=$rc"; return 0; }
D=.bieg/m1814
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step build-on env VITE_MM_LEAD_CONFIG=1 VITE_MM_BOOKING_EMBED=1 npx vite build --outDir "$D/dist-on"
step build-off env VITE_MM_LEAD_CONFIG=1 VITE_MM_BOOKING_EMBED= npx vite build --outDir "$D/dist-off"
git checkout -- public/sitemap.xml 2>/dev/null
for m in on off; do
  step "probe-$m" node .bieg/m1814/probe.mjs "$D/dist-$m" "$D/probe-$m" "$m"
  grep -a '^PROBE\|^prod-safe\|PROD-SAFE\|pageerror' "$OUT/probe-$m.log" | cut -c1-3000
done
for f in "$D"/probe-on/shots/*.jpg "$D"/probe-off/shots/*-po.jpg; do
  [ -f "$f" ] || continue
  echo "SHOT-BEGIN $(basename "$f") $(wc -c < "$f")"; base64 -w0 "$f"; echo; echo "SHOT-END"
done
echo DONE
