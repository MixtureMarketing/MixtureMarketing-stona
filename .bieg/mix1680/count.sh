#!/usr/bin/env bash
# MIX-1680 kryterium 5: liczba <loc> w sitemapie generowanej przez generator (z Sanity) z artykulem i bez niego
# (bez wpisu w routes.js = stan sprzed zmiany). Z korzenia repo.
set -u
OUT=.bieg/r/mix1680c; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm.log" 2>&1; echo "npm-ci rc=$?"
cp routes.js "$OUT/routes.orig"; cp public/sitemap.xml "$OUT/sitemap.orig"
node scripts/generate-sitemap.js > "$OUT/gen-z.log" 2>&1; echo "generator z artykulem rc=$?"
Z=$(grep -c '<loc>' public/sitemap.xml); ZA=$(grep -c 'aplikacje-dedykowane-z-ai' public/sitemap.xml)
grep -v "^  '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/',$" "$OUT/routes.orig" > routes.js
node scripts/generate-sitemap.js > "$OUT/gen-bez.log" 2>&1; echo "generator bez artykulu rc=$?"
B=$(grep -c '<loc>' public/sitemap.xml); BA=$(grep -c 'aplikacje-dedykowane-z-ai' public/sitemap.xml)
cp "$OUT/routes.orig" routes.js; cp "$OUT/sitemap.orig" public/sitemap.xml
cmp routes.js "$OUT/routes.orig" && echo "routes.js przywrocony"
echo "SITEMAP_PRZED(bez wpisu)=$B (artykul ${BA}x)  PO(z wpisem)=$Z (artykul ${ZA}x)  roznica=$((Z-B))"
