#!/usr/bin/env bash
# MIX-1975: mutanty (sed na kopii roboczej, przywrócenie przez git checkout). Każdy mutant musi
# dać czerwony bieg celowany (customAppProofPsychon + ciWorkflow). Wyjście: linia MUT na mutant
# i MUTANTY zabite/razem. Wymaga zielonego biegu bazowego.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
T="tests/components/customAppProofPsychon.test.tsx tests/scripts/ciWorkflow.test.ts"
C=components/features/web-development/CustomAppProof.tsx
D=data/content/services/web-development/custom-app.ts
F=config/flags.ts
Y=.github/workflows/ci.yml
# shellcheck disable=SC2086
npx vitest run $T > .bieg/m1975/mut-base.log 2>&1
brc=$?
echo "MUT baseline rc=$brc $(sed 's/\x1b\[[0-9;]*m//g' .bieg/m1975/mut-base.log | grep -aE '^ *Tests ' | head -1)"
[ $brc -eq 0 ] || { echo "MUTANTY baseline czerwony"; exit 1; }
zabite=0; razem=0
mut() {
  local id=$1 plik=$2 wzor=$3
  razem=$((razem+1))
  cp "$plik" "$plik.orig"
  sed -i "$wzor" "$plik"
  if cmp -s "$plik" "$plik.orig"; then echo "MUT $id NIE-ZASTOSOWANY"; mv "$plik.orig" "$plik"; return; fi
  rm -f "$plik.orig"
  # shellcheck disable=SC2086
  npx vitest run $T > ".bieg/m1975/mut-$id.log" 2>&1
  local rc=$?
  git checkout -- "$plik"
  if [ $rc -ne 0 ]; then zabite=$((zabite+1)); echo "MUT $id zabity rc=$rc $(sed 's/\x1b\[[0-9;]*m//g' ".bieg/m1975/mut-$id.log" | grep -aE '^ *Tests ' | head -1)"; else echo "MUT $id PRZEZYL"; fi
}
mut M1-flaga-niepusta "$F" "s/import.meta.env.VITE_MM_CUSTOMAPP_PSYCHON === '1'/import.meta.env.VITE_MM_CUSTOMAPP_PSYCHON !== ''/"
mut M2-zawsze-stara-tresc "$C" "s/psychon ? CONTENT.proofPsychon : CONTENT.proof/CONTENT.proof/"
mut M3-stare-obrazy-przy-on "$C" "s/{!psychon [&][&] CONTENT.proof.figures/{CONTENT.proof.figures/"
mut M4-link-psychon-404 "$D" "s|    linkTo: '/portfolio/',|    linkTo: '/portfolio/psychon/',|"
mut M5-bez-width "$C" "/width={fig.width}/d"
mut M6-ci-bez-flagi "$Y" "/VITE_MM_CUSTOMAPP_PSYCHON:/d"
mut M7-ci-flaga-na-prod "$Y" "s|VITE_MM_CUSTOMAPP_PSYCHON: .*|VITE_MM_CUSTOMAPP_PSYCHON: '1'|"
mut M8-zly-plik-zrzutu "$D" "s|psychon-postepy-grupy.webp|psychon-postepy-grupy-x.webp|"
mut M9-liczba-w-opisie "$D" "s|certyfikat z weryfikacją. Prowadzący|certyfikat z weryfikacją. 120 osób. Prowadzący|"
mut M10-off-pokazuje-psychon "$C" "s/const psychon = isCustomAppPsychonEnabled();/const psychon = true;/"
echo "MUTANTY zabite $zabite/$razem"
[ "$zabite" -eq "$razem" ]
