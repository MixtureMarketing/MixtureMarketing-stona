#!/usr/bin/env bash
# MIX-1678: mutanty kafelkow. Najpierw baseline (musi byc zielony, inaczej przerwanie). Kazdy mutant: jedna zmiana w
# jednym pliku, vitest tests/components/GoogleAdsCalculator.test.tsx, przywrocenie tego pliku (git checkout -- <plik>).
set -u
OUT=.bieg/r/mix1678; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
C=components/features/marketing/GoogleAdsCalculator.tsx
T=tests/components/GoogleAdsCalculator.test.tsx
npx vitest run $T --maxWorkers=2 > "$OUT/mut-baseline.log" 2>&1 || { echo "BASELINE CZERWONY: przerwanie" | tee -a "$OUT/mutants.txt"; exit 1; }
echo "baseline zielony" | tee -a "$OUT/mutants.txt"
mut() {
  local name=$1 f=$2 from=$3 to=$4
  node .bieg/mix1657/mutate.mjs "$f" "$from" "$to" || { echo "mutant $name: BLAD WZORCA" | tee -a "$OUT/mutants.txt"; return; }
  npx vitest run $T --maxWorkers=2 > "$OUT/mut-$name.log" 2>&1
  local rc=$?
  git checkout -- "$f"
  local t; t=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
  if [ $rc -ne 0 ]; then echo "mutant $name: zabity (rc=$rc;$t)" | tee -a "$OUT/mutants.txt"; else echo "mutant $name: PRZEZYL ($t)" | tee -a "$OUT/mutants.txt"; fi
}
mut M1-nowrap-off "$C" "'flex items-center gap-2 whitespace-nowrap font-black" "'flex items-center gap-2 font-black"
mut M2-cpa-comma-off "$C" "cpa.replace('.', ',');" "cpa;"
mut M3-revenue-unit-off "$C" 'unit="zł"
              wide' 'wide'
mut M4-floor-to-round "$C" 'Math.floor(budget / cpc)' 'Math.round(budget / cpc)'
mut M5-revenue-formula "$C" 'leads * avgOrderValue' 'traffic * avgOrderValue'
mut M6-label-swap "$C" 'label={L.leads}' 'label={L.traffic}'
mut M7-unit-outside "$C" '        {unit && (
          <span className={`ml-1 text-base font-bold ${highlight ? '"'"'text-white'"'"' : '"'"'text-gray-600'"'"'}`}>
            {unit}
          </span>
        )}
      </span>' '      </span>
      {unit && <span>{unit}</span>}'
echo "after: porcelain=$(git status --porcelain -- components tests | wc -l)"
