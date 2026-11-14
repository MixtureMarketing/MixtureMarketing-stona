#!/usr/bin/env bash
# MIX-1280 b: mutanty na zatwierdzonym drzewie, po jednym, przywracany tylko mutowany plik (git checkout -- <plik>).
# Z korzenia repo; wymaga node_modules (npm ci). Wzor: .bieg/mix1665/mut.sh.
# Fail-closed: najpierw baza na niezmienionym drzewie; nie zielona = ABORT. Mutant jest zabity tylko gdy
# liczba nieudanych testow > baza; rc != 0 bez wiekszej liczby porazek to NIEWAZNY (np. blad kompilacji).
set -u
OUT=.bieg/r/mix1280b; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
T="tests/seo/aiSystemsArticleVisuals.test.tsx tests/seo/aiSystemsArticle.test.tsx"
V=components/articles/visuals/AiSystemsVisuals.tsx
A=components/articles/AiSystemsArticle.tsx
D=data/content/articles/ai-systems.ts
strip_ansi() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# liczba nieudanych testow z podsumowania vitest ("Tests  3 failed | 20 passed"); pusta gdy brak "failed"
nfail() { strip_ansi "$1" | grep -aE '^ +Tests ' | tail -n 1 | grep -aoE '[0-9]+ failed' | grep -aoE '^[0-9]+' || true; }
npx vitest run --maxWorkers=2 $T > "$OUT/baseline.log" 2>&1
BRC=$?
BF=$(nfail "$OUT/baseline.log"); BF=${BF:-0}
BT=$(strip_ansi "$OUT/baseline.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
echo "baza: rc=$BRC failed=$BF ($BT)" | tee -a "$OUT/mutants.txt"
if [ $BRC -ne 0 ] || [ "$BF" -ne 0 ]; then
  echo "ABORT: baza nie jest zielona, mutanty niewazne" | tee -a "$OUT/mutants.txt"
  strip_ansi "$OUT/baseline.log" | grep -aE ' FAIL |Error' | head -n 10 | cut -c1-200 | tee -a "$OUT/mutants.txt"
  exit 1
fi
INVALID=0
mut() {
  local name=$1 f=$2 from=$3 to=$4
  node .bieg/mix1657/mutate.mjs "$f" "$from" "$to" || { echo "mutant $name: BLAD WZORCA (nie liczy sie)" | tee -a "$OUT/mutants.txt"; INVALID=1; return; }
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$name.log" 2>&1
  local rc=$?
  git checkout -- "$f"
  local t first nf
  t=$(strip_ansi "$OUT/mut-$name.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
  first=$(strip_ansi "$OUT/mut-$name.log" | grep -aE ' FAIL ' | head -n 1 | cut -c1-120)
  nf=$(nfail "$OUT/mut-$name.log"); nf=${nf:-0}
  if [ $rc -ne 0 ] && [ "$nf" -gt "$BF" ]; then echo "mutant $name: zabity (rc=$rc;failed=$nf>baza=$BF;$t) $first" | tee -a "$OUT/mutants.txt"
  elif [ $rc -ne 0 ]; then echo "mutant $name: NIEWAZNY (rc=$rc, failed=$nf nie wiecej niz baza) $first" | tee -a "$OUT/mutants.txt"; INVALID=1
  else echo "mutant $name: PRZEZYL ($t)" | tee -a "$OUT/mutants.txt"; fi
}
mut M1-svg-bez-aria-label "$V" $'          role="img"\n          aria-label={S.label}\n' $'          role="img"\n'
mut M2-svg-bez-role "$V" $'          role="img"\n          aria-label={S.label}' $'          aria-label={S.label}'
mut M3-infografika-bez-aria-label "$V" $'      aria-label={VISUALS.process.label}\n' ''
mut M4-tekst-zmieniony "$D" 'Zbudowaliśmy system, który prowadzi go' 'Zbudowaliśmy system, który wiedzie go'
mut M5-reduced-motion-zignorowany hooks/useSectionProgress.ts $'    if (window.matchMedia(\'(prefers-reduced-motion: reduce)\').matches) return;\n    const el = ref.current;' $'    const el = ref.current;'
mut M6-sekcja-bez-AnimateOnScroll "$A" $'<AnimateOnScroll>\n      <ArticleSection section={S[5]} />\n    </AnimateOnScroll>' '<ArticleSection section={S[5]} />'
mut M7-nowa-liczba-w-infografice "$D" "{ value: 'od 23 000 zł', caption" "{ value: 'od 29 000 zł', caption"
mut M8-render-zmienia-tekst "$A" '<p key={p} dangerouslySetInnerHTML={{ __html: p }} />' "<p key={p} dangerouslySetInnerHTML={{ __html: p.replace('Pierwszy przykład', 'Przykład pierwszy') }} />"
mut M9-ruch-przez-height "$V" '<AnimateOnScroll delay={i * 120} className="h-full">' '<AnimateOnScroll delay={i * 120} className="h-full transition-[height]">'
mut M10-artykul-bez-noindex "$A" $'    noindex\n  >' '  >'
echo "niewazne: $INVALID" | tee -a "$OUT/mutants.txt"
echo "porcelain po mutantach: $(git status --porcelain | grep -v '^?? .bieg/' | wc -l)" | tee -a "$OUT/mutants.txt"
[ "$INVALID" -eq 0 ]
