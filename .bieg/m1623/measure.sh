#!/usr/bin/env bash
# MIX-1623 r2: Lighthouse mobile N przebiegow na lokalnym buildzie HEAD (flagi Preview), `vite preview` 127.0.0.1:4400,
#   potem rozbicie dlugich zadan dla strony o najwyzszym medianie TBT. Adaptacja .bieg/m1607/measure.sh (tylko HEAD, N z parametru).
#   bash .bieg/m1623/measure.sh <N>      Sciezki wzgledne (MIX-453), wynik na stdout i w .bieg/m1623/out.
set -u
N="${1:?N}"
OUT="${OUT:-.bieg/m1623/out}"
LH=13.6.0
PAGES="${PAGES:-/baza-wiedzy/ / /portfolio/}"
mkdir -p "$OUT/lh"
echo "SHA=$(git rev-parse HEAD 2> /dev/null)"
echo "legacy-peer-deps=true" > .npmrc
npm ci --no-audit --no-fund > "$OUT/npm.log" 2>&1; echo "npm ci rc $?"
VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production VITE_MM_PREONBOARD_KEY= \
  VITE_STRIPE_PUBLISHABLE_KEY= VITE_MM_MOBILE_MENU_B=1 VITE_MM_LIVE_PRICE_BAR=1 \
  VITE_MM_VIEW_TRANSITIONS=1 VITE_MM_TESTIMONIALS=1 VITE_MM_COOKIE_BANNER_STATIC=1 \
  npm run build > "$OUT/build.log" 2>&1
rc=$?; echo "build rc $rc"; [ $rc -eq 0 ] || { tail -n 25 "$OUT/build.log" | cut -c1-250; exit 1; }
CHROME_PATH=$(node -e "import('puppeteer').then(async (p) => console.log(await p.default.executablePath()))")
export CHROME_PATH
npx --yes "lighthouse@$LH" --version
node node_modules/vite/bin/vite.js preview --port 4400 --strictPort --host 127.0.0.1 > "$OUT/preview.log" 2>&1 &
PID=$!
for _ in $(seq 1 60); do curl -fsS -o /dev/null "http://127.0.0.1:4400/" && break; sleep 1; done
for p in $PAGES; do
  slug=$(echo "$p" | tr -d '/'); slug=${slug:-home}
  for n in $(seq 1 "$N"); do
    npx --yes "lighthouse@$LH" "http://127.0.0.1:4400$p" --output=json \
      --output-path="$OUT/lh/$slug-m-$n.json" --quiet --only-categories=performance --save-assets \
      --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
      --max-wait-for-load=60000 2> "$OUT/lh/$slug-m-$n.err"
    echo "lh $slug $n rc $?"
  done
done
kill "$PID" 2> /dev/null
echo "=== SUMMARY (TBT mediana N=$N)"
node .bieg/m1607/summary.mjs "$OUT/lh" | sed -n '1,/^### /p' | head -n 12
echo "=== TBT per przebieg"
for p in $PAGES; do slug=$(echo "$p" | tr -d '/'); slug=${slug:-home}
  echo "$slug: $(node -e "const fs=require('fs');const d=process.argv[1],s=process.argv[2];const v=fs.readdirSync(d).filter(f=>f.startsWith(s+'-m-')&&f.endsWith('.json')).map(f=>{try{return Math.round(JSON.parse(fs.readFileSync(d+'/'+f)).audits['total-blocking-time'].numericValue)}catch{return null}}).filter(x=>x!==null);const so=[...v].sort((a,b)=>a-b);console.log(v.join(' ')+' | mediana '+so[Math.floor(so.length/2)]+' (N='+v.length+')')" "$OUT/lh" "$slug")"
done
WORST=$(node -e "const fs=require('fs');const d=process.argv[1];const by={};for(const f of fs.readdirSync(d)){const m=/^(.+)-m-\d+\.json$/.exec(f);if(!m)continue;try{(by[m[1]]||=[]).push(JSON.parse(fs.readFileSync(d+'/'+f)).audits['total-blocking-time'].numericValue)}catch{}}let w='',wm=-1;for(const[k,v]of Object.entries(by)){v.sort((a,b)=>a-b);const m=v[Math.floor(v.length/2)];if(m>wm){wm=m;w=k}}console.log(w)" "$OUT/lh")
echo "=== NAJGORSZA STRONA: $WORST"
node .bieg/m1623/longtasks.mjs "$OUT/lh" "$WORST-m-" 5
echo "=== DIAG2 $WORST (okno 0-4000 ms)"
node .bieg/m1607/diag2.mjs "$OUT/lh" "$WORST-m-" 0 4000 | head -n 45
echo "=== KONIEC measure.sh"
