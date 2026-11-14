#!/usr/bin/env bash
# MIX-1677: mutanty. Kazdy: jedna zmiana w jednym pliku, vitest pliku testu, przywrocenie tego pliku. Z korzenia repo.
set -u
OUT=.bieg/r/mix1677; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
T=tests/seo/aiSystemsArticleVisuals.test.tsx
V=components/articles/visuals/AiSystemsVisuals.tsx
D=data/content/articles/ai-systems.ts
mut() {
  local name=$1 f=$2 from=$3 to=$4
  node .bieg/mix1677/mutate.mjs "$f" "$from" "$to" || { echo "mutant $name: BLAD WZORCA" | tee -a "$OUT/mutants.txt"; return; }
  npx vitest run $T --maxWorkers=2 > "$OUT/mut-$name.log" 2>&1
  local rc=$?
  git checkout -- "$f"
  local t; t=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
  local f1; f1=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE ' (FAIL|×) ' | head -n 2 | tr -s ' ' | tr '\n' ';')
  if [ $rc -ne 0 ]; then echo "mutant $name: zabity (rc=$rc;$t;$f1)" | tee -a "$OUT/mutants.txt"; else echo "mutant $name: PRZEZYL ($t)" | tee -a "$OUT/mutants.txt"; fi
}
mut V1-motion-default-0 "$V" 'opacity: `calc((var(--p, 1) - ${start' 'opacity: `calc((var(--p, 0) - ${start'
mut V2-aiNote-number "$D" "aiNote: 'bywa najmniejszą częścią systemu'" "aiNote: 'bywa tylko 5% systemu'"
mut V3-client-name-caption "$D" "caption: 'portal B2B'" "caption: 'portal B2B Q-PLAST'"
mut V10-infographic-attr-removed "$V" 'data-infographic="porownanie"' 'data-x="porownanie"'
mut M5-no-item-new-number "$D" "'Standardowy program pokrywa Twój proces'" "'Standardowy program pokrywa 77 procent Twoich procesów'"
mut M6-module-label-name "$D" "'Historia zmian'," "'Allegro',"
mut M7-engineering-name-mid "$D" "engineering: 'Zwykła inżynieria'" "engineering: 'Zwykła inżynieria Mixture'"
mut M8-compare-title-name "$D" "title: 'Dedykowany system z AI się opłaca'" "title: 'Dedykowany system z AI się opłaca u Bibmot'"
mut M9-first-word-unknown "$D" "'Dane są wrażliwe lub muszą zostać u Ciebie'" "'Studentpi jest wrażliwe lub musi zostać u Ciebie'"
mut M10-stat-value-number "$D" "{ value: '24 godziny'," "{ value: '48 godzin',"
mut M11-process-label-number "$D" "Przebieg projektu w czterech krokach: rozmowa" "Przebieg projektu w 9 krokach: rozmowa"
echo "after: porcelain=$(git status --porcelain | grep -v '^?? .bieg/' | wc -l)"
