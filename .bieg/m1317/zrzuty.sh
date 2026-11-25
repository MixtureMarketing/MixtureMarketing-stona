#!/usr/bin/env bash
# MIX-1317: zrzuty K1 dla Jakuba (build z VITE_MM_PROCESS_TIMELINE=1, potem .bieg/m1317/zrzuty.mjs).
# Dodatkowo (informacyjnie): pierwsza różnica w 3 artykułach bazy wiedzy baza vs off z ostatniego full.sh.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1
D=$(ls -d .bieg/m1317/dist-* 2>/dev/null | tail -1)
if [ -n "$D" ] && [ -d "$D/on" ]; then ON="$D/on"; echo "dist on z $D"; else
  env VITE_MM_PROCESS_TIMELINE=1 npm run build > .bieg/m1317/zrzuty-build.log 2>&1; echo "STEP build-on rc=$?"
  git checkout -- public/sitemap.xml 2>/dev/null; ON=dist
fi
node .bieg/m1317/zrzuty.mjs "$ON"; rc=$?
if [ -n "$D" ] && [ -d "$D/base-src/dist" ]; then
  for a in core-web-vitals-2025 edge-computing cdn-globalna-wydajnosc; do
    node -e '
const fs=require("fs");const n=s=>s.replace(/([\w.-]+)-[A-Za-z0-9_-]{8}\.(js|css|mjs)/g,"$1-HASH.$2");
const x=n(fs.readFileSync(process.argv[1],"utf8")),y=n(fs.readFileSync(process.argv[2],"utf8"));
let i=0;while(i<x.length&&x[i]===y[i])i++;console.log("ARTYKUL",process.argv[3],"znak",i,JSON.stringify(x.slice(Math.max(0,i-120),i+120)),"||",JSON.stringify(y.slice(Math.max(0,i-120),i+120)));' "$D/base-src/dist/baza-wiedzy/$a/index.html" "$D/off/baza-wiedzy/$a/index.html" "$a"
  done
fi
exit $rc
