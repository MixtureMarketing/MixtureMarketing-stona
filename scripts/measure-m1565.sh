#!/usr/bin/env bash
# MIX-1565: lokalny pomiar TBT/CLS (Lighthouse mobile i desktop, N przebiegów) na buildzie z flagami
# Preview, serwowanym przez `vite preview` na tej samej maszynie. Porównanie gałęzi z bazą = dwa biegi
# tego skryptu na tej samej maszynie, potem `node scripts/measure-m1565-summary.mjs <baza> <galaz>`.
# Lokalnie nie ma Zaraz (wstrzykuje go edge Cloudflare), więc pomiar dotyczy wyłącznie kodu strony.
# Bez adresów produkcji: tylko 127.0.0.1 (MIX-894).
#   bash scripts/measure-m1565.sh <katalog-wynikow> [powtorzenia=3]
# Ścieżki względne do katalogu repo (bieg przekierowalny, MIX-453).
set -u
OUT="${1:?katalog wynikow}"
N="${2:-3}"
PORT=4391
PAGES="/ /wycena/ /audyt-360/ /portfolio/ /baza-wiedzy/"
LH_VERSION=13.6.0
mkdir -p "$OUT/lh"

echo "legacy-peer-deps=true" > .npmrc
npm ci --no-audit --no-fund > "$OUT/npm.log" 2>&1
echo "npm ci rc $?"

VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production VITE_MM_PREONBOARD_KEY= \
  VITE_STRIPE_PUBLISHABLE_KEY= VITE_MM_MOBILE_MENU_B=1 VITE_MM_LIVE_PRICE_BAR=1 \
  VITE_MM_VIEW_TRANSITIONS=1 VITE_MM_TESTIMONIALS=1 npm run build > "$OUT/build.log" 2>&1
BRC=$?
echo "build rc $BRC"
[ "$BRC" -eq 0 ] || { grep -v '^$' "$OUT/build.log" | tail -n 30 | cut -c1-300; exit 1; }
grep -E 'Size limit|Size:|kB' "$OUT/build.log" | tail -n 6 | cut -c1-200

# Sonda zgód (MIX-1389): atrapa Zaraz, kod 0 = zgodne scenariusze i brak przecieku.
node scripts/probe-consent-zaraz.mjs "$OUT/consent.json" > "$OUT/consent.log" 2>&1
echo "probe-consent-zaraz rc $?"

CHROME_PATH=$(node -e "import('puppeteer').then((p) => console.log(p.default.executablePath()))")
export CHROME_PATH
npx --yes "lighthouse@$LH_VERSION" --version > "$OUT/lh-version.txt" 2>&1

npx vite preview --port "$PORT" --strictPort --host 127.0.0.1 > "$OUT/preview.log" 2>&1 &
PREVIEW_PID=$!
ok=0
for _ in $(seq 1 60); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/"; then ok=1; break; fi
  sleep 1
done
[ "$ok" -eq 1 ] || { echo "preview nie wstal na porcie $PORT"; kill "$PREVIEW_PID"; exit 1; }

for p in $PAGES; do
  slug=$(echo "$p" | tr -d '/'); slug=${slug:-home}
  for i in $(seq 1 "$N"); do
    for form in m d; do
      preset=()
      [ "$form" = d ] && preset=(--preset=desktop)
      npx --yes "lighthouse@$LH_VERSION" "http://127.0.0.1:$PORT$p" "${preset[@]}" \
        --output=json --output-path="$OUT/lh/$slug-$form-$i.json" --quiet \
        --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
        --only-categories=performance --max-wait-for-load=60000 2> "$OUT/lh/$slug-$form-$i.err"
      echo "lighthouse $slug $form $i rc $?"
    done
  done
done

kill "$PREVIEW_PID" 2> /dev/null
pkill -f "vite preview --port $PORT" 2> /dev/null
node scripts/measure-m1565-summary.mjs "$OUT/lh" > "$OUT/summary.md"
echo "summary rc $?"
cat "$OUT/summary.md"
