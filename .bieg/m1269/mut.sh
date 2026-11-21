#!/usr/bin/env bash
# MIX-1269 mutanty (wzór .bieg/m1902/mut.sh): każdy mutant zmienia jedno miejsce kodu/danych/ci.yml,
# uruchamia testy karty (tests/seo/homeSeo.test.tsx, tests/scripts/ciWorkflow.test.ts) i ma dać czerwień.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1269/mut
mkdir -p "$OUT"
T="tests/seo/homeSeo.test.tsx tests/scripts/ciWorkflow.test.ts"
rep() { FROM="$2" TO="$3" node -e '
const fs=require("fs");const f=process.argv[1];let s=fs.readFileSync(f,"utf8");
const from=process.env.FROM; const i=s.indexOf(from);
if(i<0||s.indexOf(from,i+1)>=0)process.exit(3);
s=s.slice(0,i)+process.env.TO+s.slice(i+from.length);fs.writeFileSync(f,s)' "$1"; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
npx vitest run $T > "$OUT/base.log" 2>&1; brc=$?
echo "BASELINE rc=$brc $(clean "$OUT/base.log" | grep -aE '^ *Tests ')"
[ "$brc" -ne 0 ] && { echo "MUT ABORT: baseline red"; exit 1; }
K=0; S=0; N=0
mut() { local id=$1 f=$2 from=$3 to=$4 opis=$5
  rep "$f" "$from" "$to" || { echo "MUT $id NOMATCH ($opis)"; N=$((N+1)); git checkout -- "$f"; return; }
  local ns; ns=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  # shellcheck disable=SC2086
  npx vitest run $T > "$OUT/$id.log" 2>&1; local rc=$?
  local fl; fl=$(clean "$OUT/$id.log" | grep -aE '^ *Tests ' | head -1)
  git checkout -- "$f"
  if [ $rc -ne 0 ]; then K=$((K+1)); echo "MUT $id KILLED rc=$rc diff=$ns $fl ($opis)"; else S=$((S+1)); echo "MUT $id SURVIVED rc=$rc diff=$ns $fl ($opis)"; fi
}
FL=config/flags.ts; H=components/pages/Home.tsx; HE=components/sections/Hero.tsx
SV=components/sections/Services.tsx; DA=data/content/pages/homeSeo.ts; CI=.github/workflows/ci.yml
mut M1 $FL "import.meta.env.VITE_MM_HOME_SEO === '1'" "import.meta.env.VITE_MM_HOME_SEO !== undefined" "przełącznik: każda zdefiniowana wartość"
mut M2 $FL "import.meta.env.VITE_MM_HOME_SEO === '1'" "String(import.meta.env.VITE_MM_HOME_SEO).trim() === '1'" "przełącznik: ' 1' z trim"
mut M3 $H "isHomeSeoEnabled() ? HOME_SEO : HOME_SEO_BASE" "HOME_SEO" "title/meta zawsze nowe"
mut M4 $HE "{isHomeSeoEnabled() && (" "{true && (" "linia frazy w H1 zawsze"
mut M5 $HE "{HOME_SEO.h1Lead}" "Agencja marketingowa w Rzeszowie." "H1 bez dokładnej frazy"
mut M6 $SV "{isHomeSeoEnabled() ? (" "{!isHomeSeoEnabled() ? (" "pas linków odwrócony"
mut M7 $SV "{HOME_LOCAL_LINKS.map((l) => (" "{HOME_LOCAL_LINKS.slice(0, 2).map((l) => (" "tylko 2 linki"
mut M8 $SV "                        l.primary" "                        !l.primary" "styl huba odwrócony"
mut M9 $DA "title: 'Agencja marketingowa Rzeszów: strony WWW, SEO i Google Ads'" "title: 'Agencja marketingowa Rzeszów: agencja marketingowa Rzeszów'" "fraza 2× w title"
mut M10 $DA "Pracujemy z firmami z Podkarpacia i z całej Polski.'" "Pracujemy z firmami z Podkarpacia i z całej Polski. Zadzwoń!'" "meta 160 znaków"
mut M11 $DA "{ to: '/marketing/google-ads/'" "{ to: '/marketing/google-adwords/'" "adres spoza sitemap"
mut M12 $DA "title: 'Agencja Marketingowa Rzeszów — Web, SEO, Ads'" "title: 'Agencja marketingowa Rzeszów — Web, SEO, Ads'" "title bazowy zmieniony o 1 znak"
mut M13 $CI "VITE_MM_HOME_SEO: \${{ steps.target.outputs.target == 'preview' && '1' || '' }}" "VITE_MM_HOME_SEO: '1'" "produkcja włączona"
mut M14 $DA "  h1Lead: 'Agencja marketingowa Rzeszów.'," "  h1Lead: 'Agencja marketingowa Rzeszów. Agencja marketingowa Rzeszów.'," "fraza 2× w H1"
echo "MUT SUMA killed=$K survived=$S nomatch=$N"
echo "dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
