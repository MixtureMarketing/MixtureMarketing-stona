#!/usr/bin/env bash
# MIX-1680: mutanty. Najpierw baseline (musi byc zielony), potem kazdy mutant: kopia wzorca -> jedna zmiana w jednym pliku ->
# vitest siedmiu plikow testu -> przywrocenie z kopii + cmp. Chmura nie ma .git, wiec przywracanie z kopii. Z korzenia repo.
set -u
OUT=.bieg/r/mix1680m; mkdir -p "$OUT/pristine"; : > "$OUT/mutants.txt"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
T="tests/seo/aiSystemsArticle.test.tsx tests/seo/aiSystemsArticleVisuals.test.tsx tests/seo/aiSystemsArticleListing.test.tsx tests/seo/articleAuthorDates.test.tsx tests/seo/llmsTxt.test.ts tests/seo/sitemapLastmod.test.ts tests/routes.test.ts"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm.log" 2>&1; echo "npm-ci rc=$?"
run() { npx vitest run $T --maxWorkers=2 > "$OUT/$1.log" 2>&1; echo $?; }
rc=$(run baseline); sed 's/\x1b\[[0-9;]*m//g' "$OUT/baseline.log" | grep -aE 'Test Files|Tests ' | tr -s ' '; echo "baseline rc=$rc" | tee -a "$OUT/mutants.txt"
if [ "$rc" != 0 ]; then echo "baseline NIE zielony"; exit 1; fi
mut() {
  local name=$1 f=$2 from=$3 to=$4
  cp "$f" "$OUT/pristine/orig"
  node .bieg/mix1680/mutate.mjs "$f" "$from" "$to" || { echo "mutant $name: BLAD WZORCA" | tee -a "$OUT/mutants.txt"; return; }
  local c; c=$(run "mut-$name")
  cp "$OUT/pristine/orig" "$f"; cmp -s "$OUT/pristine/orig" "$f" && local same=cmp-ok || local same=CMP-BLAD
  local t; t=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
  local f1; f1=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ FAIL ' | sed -E 's/^ FAIL +//' | cut -c1-110 | sort -u | head -n 3 | tr '\n' ';')
  if [ "$c" != 0 ]; then echo "mutant $name: zabity (rc=$c;$t;$same;$f1)" | tee -a "$OUT/mutants.txt"; else echo "mutant $name: PRZEZYL ($t;$same)" | tee -a "$OUT/mutants.txt"; fi
}
A=components/articles/AiSystemsArticle.tsx
mut M1-noindex-wrocil "$A" "    publishedDate={AI_ARTICLE_PUBLISHED}
" "    publishedDate={AI_ARTICLE_PUBLISHED}
    noindex
"
mut M2-sitemap-brak public/sitemap.xml "<loc>https://mixturemarketing.pl/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/</loc>" "<loc>https://mixturemarketing.pl/baza-wiedzy/inny-adres/</loc>"
mut M3-routes-poza-lista routes.js "  '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/',
  '/baza-wiedzy/server-side-tracking" "  '/baza-wiedzy/server-side-tracking"
mut M4-llms-brak public/llms.txt "(https://mixturemarketing.pl/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/)" "(https://mixturemarketing.pl/baza-wiedzy/inny-adres/)"
mut M5-kafel-brak services/cms/legacyArticles.ts "slug: '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto'," "slug: '/baza-wiedzy/inny-adres',"
mut M6-W6-nazwa-malymi data/content/articles/ai-systems.ts "'Historia zmian'," "'historia bibmot',"
mut M7-data-publikacji data/content/articles/ai-systems.ts "AI_ARTICLE_PUBLISHED = '2026-11-14'" "AI_ARTICLE_PUBLISHED = '2026-11-13'"
mut M8-lastmod-json-brak data/seo/lastmod.json '"/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/": "2026-11-14"' '"/baza-wiedzy/inny-adres/": "2026-11-14"'
mut M9-key-paths-brak scripts/lib/llms.js "  '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/',
];" "];"
mut M10-W6-slowo-na-poczatku data/content/articles/ai-systems.ts "engineering: 'Zwykła inżynieria'" "engineering: 'bibmot inżynieria'"
echo "after: porcelain=$(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | wc -l)"
