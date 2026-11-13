#!/usr/bin/env bash
# MIX-1514: mutanty normalizacji po dekodowaniu %, nadpisania nieczytelnych page_* i listy slugow pakietu.
# Kazdy mutant zmienia JEDEN fragment jednego pliku (dokladny tekst, bez wyrazen regularnych),
# puszcza testy GA4 i przywraca dokladnie ten plik (git checkout -- <plik>).
# Wynik: mutant | plik:linia | opis | zabity (test czerwony) / przezyl (rc 0).
#   bash scripts/mutants-m1514.sh [katalog-wynikow=.bieg/m1514/mut] [id-mutanta...]
set -u
OUT="${1:-.bieg/m1514/mut}"
shift || true
mkdir -p "$OUT"
P=utils/ga4Personal.ts
G=utils/ga4Page.ts
K=utils/ga4Package.ts
M=context/ModalContext.tsx
TESTS=(tests/utils/ga4DecodedForms.test.ts tests/utils/ga4Package.test.tsx tests/utils/ga4Events.test.ts
  tests/utils/ga4AttackForms.test.ts tests/utils/keyEvents.test.tsx)
# id~plik~opis~tekst przed~tekst po
MUTANTS=(
  "W5~$P~brak NFKC i \\p{Cf} po dekodowaniu %~return clean(decodeEntities(decoded)).toLowerCase();~return decodeEntities(decoded).toLowerCase();"
  "W15~$G~nieczytelne page_* bez nadpisania~    if (r.why === null) continue;~    if (r.why === null || r.why === 'unreadable') continue;"
  "M1~$K~tytul spoza listy dostaje slug z wolnego tekstu~PACKAGE_SLUGS.get(title)) || REFUSED;~PACKAGE_SLUGS.get(title)) || (typeof title === 'string' ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : REFUSED);"
  "M2~$K~szukanie po obcietym tytule~PACKAGE_SLUGS.get(title))~PACKAGE_SLUGS.get(title.trim()))"
  "M3~$K~szukanie bez wielkosci liter~PACKAGE_SLUGS.get(title))~(PACKAGE_SLUGS.get(title) ?? [...PACKAGE_SLUGS].find(([k]) => k.toLowerCase() === title.toLowerCase())?.[1]))"
  "M4~$K~obiekt zamiast Map (klucze prototypu)~PACKAGE_SLUGS.get(title))~(Object.fromEntries(PACKAGE_SLUGS) as Record<string, string>)[title])"
  "M8~$K~tytul spoza listy oddany straznikowi bez zmian~PACKAGE_SLUGS.get(title)) || REFUSED;~PACKAGE_SLUGS.get(title)) || title;"
  "M9~$K~brak pakietu wysylany jako odmowa~  if (title === undefined || title === null) return undefined;~"
  "M5~$K~brak wpisu na liscie~  ['Lokalne SEO', 'lokalne-seo'],~"
  "M6~$K~wpis z wartoscia, ktorej straznik nie przyjmie~['Lokalne SEO', 'lokalne-seo']~['Lokalne SEO', 'Lokalne SEO']"
  "M7~$M~ModalContext wysyla surowy tytul~      package: packageSlug(data?.package),~      package: data?.package,"
)
TSV="$OUT/mutanty.tsv"
: > "$TSV"
for m in "${MUTANTS[@]}"; do
  IFS='~' read -r id file desc from to <<< "$m"
  from="${from//\\\$/\$}"; to="${to//\\\$/\$}"
  if [ "$#" -gt 0 ] && [[ ! " $* " =~ " $id " ]]; then continue; fi
  line=$(grep -nF -- "$from" "$file" | head -1 | cut -d: -f1)
  FROM="$from" TO="$to" perl -0pi -e 's/\Q$ENV{FROM}\E/$ENV{TO}/' "$file"
  if git diff --quiet -- "$file"; then
    echo -e "$id\t$file\t$desc\tBLAD: wzorzec nic nie zmienil" | tee -a "$TSV"
    continue
  fi
  npx vitest run --maxWorkers=2 "${TESTS[@]}" > "$OUT/mutant-$id.log" 2>&1
  rc=$?
  git checkout -- "$file"
  if git diff --quiet -- "$file"; then restored=tak; else restored=NIE; fi
  if [ "$rc" -ne 0 ]; then res=zabity; else res=przezyl; fi
  # zabity przez blad skladni to nie jest zabity przez test
  if grep -qE 'Transform failed|SyntaxError|Failed to parse|Unexpected token' "$OUT/mutant-$id.log"; then
    res="BLAD-skladni"
  fi
  summary=$(grep -E '^ +Tests ' "$OUT/mutant-$id.log" | tail -1 | sed 's/\x1b\[[0-9;]*m//g' | tr -s ' ')
  echo -e "$id\t$file:$line\t$desc\t$res (rc $rc)\t$summary\tprzywrocony=$restored" | tee -a "$TSV"
done
