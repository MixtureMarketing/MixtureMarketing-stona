#!/usr/bin/env bash
# MIX-1411: mutanty wariantu B menu mobilnego. Każdy mutant zmienia JEDEN plik, puszcza testy menu
# i przywraca dokładnie ten plik (git checkout -- <plik>). Uruchamiać na zatwierdzonym drzewie.
#   bash scripts/mutants-m1411.sh <katalog-wynikow>
# Wynik: <katalog>/mutanty.tsv (mutant, plik, rc testów, wynik). rc 0 = każdy mutant zabity.
set -u
OUT="${1:?katalog wynikow}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain -- components tests)" ]; then
  echo "ODMOWA: niezatwierdzone zmiany w components/ lub tests/" >&2
  exit 2
fi
TESTS=(tests/components/mobileMenuB.test.tsx tests/components/mobileMenuOffDom.test.tsx)
: > "$OUT/mutanty.tsv"
survivors=0

# id|plik|szukany tekst|zamiana  (\n = nowa linia; zamieniane tylko pierwsze wystąpienie)
while IFS='|' read -r id file from to; do
  [ -z "$id" ] && continue
  from="${from//\\n/$'\n'}"
  to="${to//\\n/$'\n'}"
  FROM="$from" TO="$to" perl -0pi -e 's/\Q$ENV{FROM}\E/$ENV{TO}/' "$file"
  if git diff --quiet -- "$file"; then
    # Wzorzec nie znaleziony albo zamiana bez efektu: mutant nie powstał = liczony jako porażka.
    echo -e "$id\t$file\t-\tBRAK_MUTACJI" | tee -a "$OUT/mutanty.tsv"
    survivors=$((survivors + 1))
    continue
  fi
  git diff -U0 -- "$file" | grep '^[-+][^-+]' > "$OUT/mut-$id.diff"
  npx vitest run "${TESTS[@]}" --maxWorkers=2 > "$OUT/mut-$id.log" 2>&1
  rc=$?
  git checkout -- "$file"
  if [ "$rc" -ne 0 ]; then res=zabity; else res=przezyl; survivors=$((survivors + 1)); fi
  echo -e "$id\t$file\t$rc\t$res" | tee -a "$OUT/mutanty.tsv"
done <<'EOF'
M1-fokus-powrot|components/layout/MobileMenuB.tsx|offerTitleRef : offerButtonRef|offerTitleRef : offerTitleRef
M2-fokus-wejscie|components/layout/MobileMenuB.tsx|offerTitleRef : offerButtonRef|offerButtonRef : offerButtonRef
M3-escape-klawisz|components/layout/MobileMenuB.tsx|if (e.key !== 'Escape') return;|if (e.key !== 'Esc') return;
M4-escape-kazdy-klawisz|components/layout/MobileMenuB.tsx|if (e.key !== 'Escape') return;|
M5-blokada-przewijania-link-uslugi|components/layout/MobileMenuB.tsx|                      to={item.target}\n                      onClick={close}|                      to={item.target}
M6-blokada-przewijania-cta|components/layout/MobileMenuB.tsx|            openModal('consultation');\n            close();|            openModal('consultation');
M7-reset-ekranu|components/layout/MobileMenuB.tsx|if (!isOpen) setScreen('main');|if (isOpen) setScreen('main');
M11-brak-resetu-ekranu|components/layout/MobileMenuB.tsx|if (!isOpen) setScreen('main');|
M8-flaga-domyslnie-wlaczona|components/layout/mobileMenuFlag.ts|raw: unknown = import.meta.env.VITE_MM_MOBILE_MENU_B,|raw: unknown = import.meta.env.VITE_MM_MOBILE_MENU_B ?? '1',
M9-flaga-allowlista|components/layout/mobileMenuFlag.ts|return raw === '1' || raw === 'true';|return Boolean(raw) && raw !== '0';
M10-navbar-zawsze-B|components/layout/Navbar.tsx|{isMobileMenuBEnabled() ? (|{true ? (
EOF

echo "PRZEZYLO=$survivors" | tee -a "$OUT/mutanty.tsv"
[ "$survivors" -eq 0 ]
