#!/usr/bin/env bash
# MIX-1607: A/B Lighthouse mobile (N przebiegow, naprzemiennie), buildy z flagami Preview, `vite preview` 127.0.0.1.
#   bash .bieg/m1607/measure.sh <N> <ref...>      ref: BASE (06c7062 KnowledgeBase.tsx) | HEAD | ALL (HEAD z FIRST_DEFERRED_CARD=0)
# Sciezki wzgledne (MIX-453). Wynik na stdout.
set -u
N="${1:?N}"; shift
REFS=("$@")
OUT=.bieg/m1607/out
LH=13.6.0
PAGES="/baza-wiedzy/ /portfolio/ /"
FILE=components/pages/KnowledgeBase.tsx
mkdir -p "$OUT"
echo "legacy-peer-deps=true" > .npmrc
npm ci --no-audit --no-fund > "$OUT/npm.log" 2>&1; echo "npm ci rc $?"
build() { # $1 = katalog drzewa
  (cd "$1" && VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production VITE_MM_PREONBOARD_KEY= \
   VITE_STRIPE_PUBLISHABLE_KEY= VITE_MM_MOBILE_MENU_B=1 VITE_MM_LIVE_PRICE_BAR=1 \
   VITE_MM_VIEW_TRANSITIONS=1 VITE_MM_TESTIMONIALS=1 VITE_MM_COOKIE_BANNER_STATIC="${CB:-1}" \
   npm run build > build-m1607.log 2>&1
   rc=$?; echo "build $1 rc $rc"; [ $rc -eq 0 ] || tail -n 25 build-m1607.log | cut -c1-250
   return $rc)
}
DIRS=(); PORTS=(); PIDS=()
i=0
for r in "${REFS[@]}"; do
  if [ "$r" = HEAD ]; then d=.; else
    d="../m1607-$r"; mkdir -p "$d"
    tar --exclude=./node_modules --exclude=./.bieg --exclude=./dist -cf - . | (cd "$d" && tar xf -)
    cp -al node_modules "$d/node_modules"
    case "$r" in
      BASE) cp .bieg/m1607/KnowledgeBase.base.tsx "$d/$FILE"; echo "BASE: $FILE z 06c7062 (kopia w repo) rc $?; wierszy $(wc -l < "$d/$FILE")" ;;
      ALL) sed -i 's/const FIRST_DEFERRED_CARD = 3;/const FIRST_DEFERRED_CARD = 0;/' "$d/$FILE"; echo "ALL: sed rc $?; $(grep -c 'FIRST_DEFERRED_CARD = 0' "$d/$FILE") trafien" ;;
      *) echo "nieznany ref $r"; exit 2 ;;
    esac
  fi
  build "$d" || exit 1
  DIRS+=("$d"); PORTS+=($((4400 + i))); i=$((i + 1))
done
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
      [ "${REFS[$k]}" = ALL ] && [ "$slug" != "baza-wiedzy" ] && continue
      mkdir -p "$OUT/lh$k"
      npx --yes "lighthouse@$LH" "http://127.0.0.1:${PORTS[$k]}$p" --output=json \
        --output-path="$OUT/lh$k/$slug-m-$n.json" --quiet --only-categories=performance --save-assets \
        --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
        --max-wait-for-load=60000 2> "$OUT/lh$k/$slug-m-$n.err"
      echo "lh ${REFS[$k]} $slug $n rc $?"
    done
  done
done
node .bieg/m1607/shots.mjs "${PORTS[0]}" "${PORTS[1]}" "/baza-wiedzy/ /portfolio/ /"
echo "shots (A=${REFS[0]}, B=${REFS[1]}) rc $?"
node .bieg/m1607/cards.mjs "${PORTS[0]}"
for k in "${!PORTS[@]}"; do echo "== probe ref ${REFS[$k]}"; node .bieg/m1607/lcp-probe.mjs "${PORTS[$k]}" "/baza-wiedzy/" 1; done
kill "${PIDS[@]}" 2> /dev/null
for k in "${!DIRS[@]}"; do echo "=== SUMMARY ${REFS[$k]} (katalog lh$k)"; node .bieg/m1607/summary.mjs "$OUT/lh$k"; done
echo "=== POROWNANIE ${REFS[0]} (baza) vs ${REFS[1]}"
node .bieg/m1607/summary.mjs "$OUT/lh0" "$OUT/lh1" | head -n 12
if [ "${#PORTS[@]}" -gt 2 ]; then echo "=== POROWNANIE ${REFS[0]} vs ${REFS[2]}"; node .bieg/m1607/summary.mjs "$OUT/lh0" "$OUT/lh2" | head -n 12; fi
for k in "${!DIRS[@]}"; do echo "=== DIAG2 ${REFS[$k]} (baza-wiedzy, okno 600-1500 ms)"; node .bieg/m1607/diag2.mjs "$OUT/lh$k" baza-wiedzy 600 1500 | head -n 40; done
for k in "${!DIRS[@]}"; do d="${DIRS[$k]}"; echo "=== HTML ${REFS[$k]}: $(wc -c < "$d/dist/baza-wiedzy/index.html") B, tagow: $(grep -o '<[a-z][a-z0-9]*[ >]' "$d/dist/baza-wiedzy/index.html" | wc -l), linkow /baza-wiedzy/<slug>: $(grep -o 'href="/baza-wiedzy/[^"]\+"' "$d/dist/baza-wiedzy/index.html" | wc -l), unikalnych: $(grep -o 'href="/baza-wiedzy/[^"]\+"' "$d/dist/baza-wiedzy/index.html" | sort -u | wc -l), content-visibility w HTML: $(grep -o 'content-visibility' "$d/dist/baza-wiedzy/index.html" | wc -l), w CSS: $(cat "$d"/dist/assets/*.css | grep -o 'content-visibility:auto' | wc -l)"; done
echo "=== KONIEC measure.sh"
