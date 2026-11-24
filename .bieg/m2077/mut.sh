#!/usr/bin/env bash
# MIX-2077: mutanty (sed na kopii roboczej, przywrócenie przez git checkout). Każdy mutant musi
# dać czerwony bieg celowany ciWorkflow. Wyjście: linia MUT na mutant i MUTANTY zabite/razem.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
T="tests/scripts/ciWorkflow.test.ts"
Y=.github/workflows/ci.yml
npx vitest run $T > .bieg/m2077/mut-base.log 2>&1
brc=$?
echo "MUT baseline rc=$brc $(sed 's/\x1b\[[0-9;]*m//g' .bieg/m2077/mut-base.log | grep -aE '^ *Tests ' | head -1)"
[ $brc -eq 0 ] || { echo "MUTANTY baseline czerwony"; exit 1; }
zabite=0; razem=0
mut() {
  local id=$1 plik=$2 wzor=$3
  razem=$((razem+1))
  cp "$plik" "$plik.orig"
  sed -i "$wzor" "$plik"
  if cmp -s "$plik" "$plik.orig"; then echo "MUT $id NIE-ZASTOSOWANY"; mv "$plik.orig" "$plik"; return; fi
  rm -f "$plik.orig"
  npx vitest run $T > ".bieg/m2077/mut-$id.log" 2>&1
  local rc=$?
  git checkout -- "$plik"
  if [ $rc -ne 0 ]; then zabite=$((zabite+1)); echo "MUT $id zabity rc=$rc $(sed 's/\x1b\[[0-9;]*m//g' ".bieg/m2077/mut-$id.log" | grep -aE '^ *Tests ' | head -1)"; else echo "MUT $id PRZEZYL"; fi
}
PREV="\${{ steps.target.outputs.target == 'preview' \&\& '1' || '' }}"
# M1 = mutant z karty: produkcja '' (powrót do wyrażenia tylko-Preview).
mut M1-ci-prod-pusty "$Y" "s#^\( *VITE_MM_CENNIK: \).*#\1$PREV#"
mut M2-ci-stala-1 "$Y" "s#^\( *VITE_MM_CENNIK: \).*#\1'1'#"
mut M3-ci-bez-flagi "$Y" "/VITE_MM_CENNIK:/d"
mut M4-ci-tylko-prod "$Y" "/VITE_MM_CENNIK:/s#(steps.target.outputs.target == 'preview' || steps.target.outputs.target == 'prod')#steps.target.outputs.target == 'prod'#"
mut M5-ci-none-zamiast-prod "$Y" "/VITE_MM_CENNIK:/s#target == 'prod')#target == 'none')#"
mut M6-ci-inny-przelacznik-na-prod "$Y" "/VITE_MM_HOME_SEO:/s#target == 'preview' \&\&#target == 'preview' || steps.target.outputs.target == 'prod') \&\&#;/VITE_MM_HOME_SEO:/s#\${{ steps#\${{ (steps#"
mut M7-parser-ignoruje-drugi-cel "$T" "s/cel === m2\[1\] || cel === m2\[2\]/cel === m2[1]/"
mut M8-pr-jak-produkcja "$T" "s/const naPoza = WLACZONE_NA_PROD.has(f) ? '1' : '';/const naPoza = naProd;/"
mut M9-zbior-bez-cennika "$T" "s/const WLACZONE_NA_PROD_BEZ_PR = new Set(\['VITE_MM_CENNIK'\]);/const WLACZONE_NA_PROD_BEZ_PR = new Set<string>([]);/"
echo "MUTANTY zabite $zabite/$razem"
[ "$zabite" -eq "$razem" ]
