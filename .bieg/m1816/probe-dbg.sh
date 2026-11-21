#!/usr/bin/env bash
# MIX-1816: short debug run (npm ci, switch-on and switch-off builds, both probes, full logs).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
B=.bieg/m1816
npm ci --legacy-peer-deps --no-audit --no-fund > "$B/dbg-ci.log" 2>&1; echo "ci rc=$?"
git checkout -- public/sitemap.xml 2>/dev/null
env VITE_MM_NEW_CLIENT_TIMELINE=1 npx vite build --outDir "$B/dist-on" > "$B/dbg-b1.log" 2>&1; echo "build-on rc=$?"
env VITE_MM_NEW_CLIENT_TIMELINE= npx vite build --outDir "$B/dist-off" > "$B/dbg-b2.log" 2>&1; echo "build-off rc=$?"
node .bieg/m1816/probe.mjs "$B/dist-on" "$B/probe-on" on > "$B/dbg-on.log" 2>&1; echo "probe-on rc=$?"
cut -c1-1500 "$B/dbg-on.log" | head -40
node .bieg/m1816/probe.mjs "$B/dist-off" "$B/probe-off" off > "$B/dbg-off.log" 2>&1; echo "probe-off rc=$?"
cut -c1-1500 "$B/dbg-off.log" | head -40
git checkout -- public/sitemap.xml 2>/dev/null
echo DONE
