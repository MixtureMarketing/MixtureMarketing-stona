#!/usr/bin/env bash
# MIX-1280 b: mutanty na zatwierdzonym drzewie, po jednym, przywracany tylko mutowany plik (git checkout -- <plik>).
# Z korzenia repo; wymaga node_modules (npm ci). Wzor: .bieg/mix1665/mut.sh.
set -u
OUT=.bieg/r/mix1280b; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
T="tests/seo/aiSystemsArticleVisuals.test.tsx tests/seo/aiSystemsArticle.test.tsx"
V=components/articles/visuals/AiSystemsVisuals.tsx
A=components/articles/AiSystemsArticle.tsx
D=data/content/articles/ai-systems.ts
mut() {
  local name=$1 f=$2 from=$3 to=$4
  node .bieg/mix1657/mutate.mjs "$f" "$from" "$to" || { echo "mutant $name: BLAD WZORCA" | tee -a "$OUT/mutants.txt"; return; }
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$name.log" 2>&1
  local rc=$?
  git checkout -- "$f"
  local t first
  t=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
  first=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE ' FAIL ' | head -n 1 | cut -c1-120)
  if [ $rc -ne 0 ]; then echo "mutant $name: zabity (rc=$rc;$t) $first" | tee -a "$OUT/mutants.txt"; else echo "mutant $name: PRZEZYL ($t)" | tee -a "$OUT/mutants.txt"; fi
}
mut M1-svg-bez-aria-label "$V" $'          role="img"\n          aria-label={S.label}\n' $'          role="img"\n'
mut M2-svg-bez-role "$V" $'          role="img"\n          aria-label={S.label}' $'          aria-label={S.label}'
mut M3-infografika-bez-aria-label "$V" $'      aria-label={VISUALS.process.label}\n' ''
mut M4-tekst-zmieniony "$D" 'Zbudowaliśmy system, który prowadzi go' 'Zbudowaliśmy system, który wiedzie go'
mut M5-reduced-motion-zignorowany hooks/useSectionProgress.ts "if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;" ''
mut M6-sekcja-bez-AnimateOnScroll "$A" $'<AnimateOnScroll>\n      <ArticleSection section={S[5]} />\n    </AnimateOnScroll>' '<ArticleSection section={S[5]} />'
mut M7-nowa-liczba-w-infografice "$D" "{ value: 'od 23 000 zł', caption" "{ value: 'od 29 000 zł', caption"
mut M8-render-zmienia-tekst "$A" '<p key={p} dangerouslySetInnerHTML={{ __html: p }} />' "<p key={p} dangerouslySetInnerHTML={{ __html: p.replace('Pierwszy przykład', 'Przykład pierwszy') }} />"
mut M9-ruch-przez-height "$V" '<AnimateOnScroll delay={i * 120} className="h-full">' '<AnimateOnScroll delay={i * 120} className="h-full transition-[height]">'
mut M10-artykul-bez-noindex "$A" $'    noindex\n  >' '  >'
echo "porcelain po mutantach: $(git status --porcelain | grep -v '^?? .bieg/' | wc -l)" | tee -a "$OUT/mutants.txt"
