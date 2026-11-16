#!/usr/bin/env bash
# MIX-1579: Lighthouse mobile (N przebiegów, naprzemiennie A/B) na buildach z flagami Preview
# (+ VITE_MM_COOKIE_BANNER_STATIC=1), serwowanych przez `vite preview` na tej samej maszynie;
# zrzuty 390/1280 z różnicą pikseli; sonda wpisów LCP.
#   bash .bieg/m1579/measure.sh <N> HEAD          (jedno drzewo)
#   bash .bieg/m1579/measure.sh <N> BASE HEAD     (BASE = kopia drzewa z odwróconym .bieg/m1579/fix.diff)
# Tylko 127.0.0.1 (bez produkcji, MIX-894). Ścieżki względne (MIX-453).
set -u
N="${1:?N}"; shift
REFS=("$@")
OUT=.bieg/m1579/out
LH=13.6.0
PAGES="/ /audyt-360/ /baza-wiedzy/ /portfolio/ /wycena/"
mkdir -p "$OUT"
echo "legacy-peer-deps=true" > .npmrc
npm ci --no-audit --no-fund > "$OUT/npm.log" 2>&1; echo "npm ci rc $?"
build() { # $1 = katalog drzewa
  (cd "$1" && VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production VITE_MM_PREONBOARD_KEY= \
   VITE_STRIPE_PUBLISHABLE_KEY= VITE_MM_MOBILE_MENU_B=1 VITE_MM_LIVE_PRICE_BAR=1 \
   VITE_MM_VIEW_TRANSITIONS=1 VITE_MM_TESTIMONIALS=1 VITE_MM_COOKIE_BANNER_STATIC=1 \
   npm run build > build-m1579.log 2>&1
   rc=$?; echo "build $1 rc $rc"; [ $rc -eq 0 ] || tail -n 25 build-m1579.log | cut -c1-250
   for f in dist/index.html dist/audyt-360/index.html dist/baza-wiedzy/index.html; do echo "mm-zgoda-baner w $1/$f: $(grep -o "p-4 mm-zgoda-baner" "$f" | wc -l)"; done; return $rc)
}
DIRS=(); PORTS=(); PIDS=()
i=0
for r in "${REFS[@]}"; do
  if [ "$r" = HEAD ]; then d=.; else
    d=../m1579-base; mkdir -p "$d"
    tar --exclude=./node_modules --exclude=./.bieg --exclude=./dist -cf - . | (cd "$d" && tar xf -)
    cp -al node_modules "$d/node_modules"
    cp .bieg/m1579/basediff.txt "$d/m1579-basediff.txt"
    (cd "$d" && patch -R -p1 -s < m1579-basediff.txt); echo "base patch -R rc $?"
    n=$(grep -c isCookieBannerStaticEnabled "$d/components/features/CookieBanner.tsx"); echo "base: flaga w CookieBanner = $n"; [ "$n" = 0 ] || { echo "base niepoprawna"; exit 1; }
  fi
  build "$d" || exit 1
  DIRS+=("$d"); PORTS+=($((4400 + i))); i=$((i + 1))
done
node scripts/probe-consent-zaraz.mjs "$OUT/consent.json" > "$OUT/consent.log" 2>&1
echo "probe-consent-zaraz (HEAD) rc $?"; grep -aE 'S[0-9]|NIE|OK' "$OUT/consent.log" | head -n 20 | cut -c1-200
CHROME_PATH=$(node -e "import('puppeteer').then(async (p) => console.log(await p.default.executablePath()))")
export CHROME_PATH
npx --yes "lighthouse@$LH" --version
for k in "${!DIRS[@]}"; do
  (cd "${DIRS[$k]}" && exec node node_modules/vite/bin/vite.js preview --port "${PORTS[$k]}" --strictPort --host 127.0.0.1) > "$OUT/preview$k.log" 2>&1 &
  PIDS+=($!)
done
for k in "${!PORTS[@]}"; do
  for _ in $(seq 1 60); do curl -fsS -o /dev/null "http://127.0.0.1:${PORTS[$k]}/" && break; sleep 1; done
done
for p in $PAGES; do
  slug=$(echo "$p" | tr -d '/'); slug=${slug:-home}
  for n in $(seq 1 "$N"); do
    for k in "${!PORTS[@]}"; do
      mkdir -p "$OUT/lh$k"
      npx --yes "lighthouse@$LH" "http://127.0.0.1:${PORTS[$k]}$p" --output=json \
        --output-path="$OUT/lh$k/$slug-m-$n.json" --quiet --only-categories=performance \
        --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
        --max-wait-for-load=60000 2> "$OUT/lh$k/$slug-m-$n.err"
      echo "lh $k $slug $n rc $?"
    done
  done
done
P2=""; [ "${#PORTS[@]}" -gt 1 ] && P2="${PORTS[1]}"
node .bieg/m1579/shots.mjs "${PORTS[0]}" $P2 "$PAGES"
echo "shots rc $?"
for k in "${!PORTS[@]}"; do echo "== probe ref $k"; node .bieg/m1579/lcp-probe.mjs "${PORTS[$k]}" "$PAGES" 1; done
kill "${PIDS[@]}" 2> /dev/null
if [ "${#DIRS[@]}" -gt 1 ]; then node .bieg/m1579/summary.mjs "$OUT/lh0" "$OUT/lh1"; else node .bieg/m1579/summary.mjs "$OUT/lh0"; fi
echo "summary rc $?"
