#!/usr/bin/env bash
# MIX-1411 + MIX-1465: mutanty wariantu B menu mobilnego (od MIX-1465 także Escape o poziom,
# aria-current, pułapka fokusu, inert, blokada body, zakładki, fragment menu B tylko przy przełączniku). Każdy mutant zmienia JEDEN plik, puszcza testy menu
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
M3-escape-klawisz|components/layout/MobileMenuB.tsx|if (e.key === 'Escape') {|if (e.key === 'Esc') {
M4-escape-zawsze-zamyka|components/layout/MobileMenuB.tsx|if (screen === 'offer') showScreen('main');\n        else close();|close();
M5-blokada-przewijania-link-uslugi|components/layout/MobileMenuBOffer.tsx|                      onClick={onNavigate}\n                      className="mmb-row"|                      className="mmb-row"
M6-blokada-przewijania-cta|components/layout/MobileMenuB.tsx|              openModal('consultation');\n              close();|              openModal('consultation');
M7-reset-ekranu|components/layout/MobileMenuB.tsx|      setScreen('main');\n      setTab(0);|      setTab(0);
M11-brak-resetu-ekranu|components/layout/MobileMenuB.tsx|    }, RESET_AFTER_CLOSE_MS);|    }, 1e9);
M8-flaga-domyslnie-wlaczona|components/layout/mobileMenuFlag.ts|raw: unknown = import.meta.env.VITE_MM_MOBILE_MENU_B,|raw: unknown = import.meta.env.VITE_MM_MOBILE_MENU_B ?? '1',
M9-flaga-allowlista|components/layout/mobileMenuFlag.ts|return raw === '1' || raw === 'true';|return Boolean(raw) && raw !== '0';
M10-navbar-zawsze-B|components/layout/Navbar.tsx|      {menuB ? (\n        <MobileMenuBSlot|      {true ? (\n        <MobileMenuBSlot
M12-escape-glowny-nie-zamyka|components/layout/MobileMenuB.tsx|        else close();|        else showScreen('main');
M13-strona-glowna-podswietla|components/layout/mobileMenuBData.ts|return prefix ? path.startsWith(target) : path === target;|return prefix ? target.startsWith(path) : path === target;
M14-przedrostek-wszedzie|components/layout/mobileMenuBData.ts|return prefix ? path.startsWith(target) : path === target;|return path.startsWith(target);
M15-bez-podswietlenia-uslug|components/layout/MobileMenuBOffer.tsx|aria-current={current(isCurrentPage(path, item.target))}|aria-current={undefined}
M16-podswietlenie-zawsze|components/layout/MobileMenuBOffer.tsx|(on ? ('page' as const) : undefined)|(on ? ('page' as const) : ('page' as const))
M17-pulapka-shift-tab|components/layout/MobileMenuB.tsx|        last.focus();|
M18-pulapka-tab|components/layout/MobileMenuB.tsx|        first.focus();|
M19-fokus-na-X|components/layout/useMobileMenuB.ts|    closeRef.current?.focus({ preventScroll: true });|
M20-fokus-powrot-przycisk-menu|components/layout/useMobileMenuB.ts|      document.querySelector<HTMLElement>(TOGGLE_SELECTOR)?.focus({ preventScroll: true });|
M21-strona-bez-inert|components/layout/useMobileMenuB.ts|const restoreInert = layer ? makeRestInert(layer) : () => {};|const restoreInert = () => {};
M22-body-bez-przypiecia|components/layout/useMobileMenuB.ts|      position: 'fixed',|      position: '',
M23-tlo-nie-zamyka|components/layout/MobileMenuB.tsx|<div className="mmb-scrim" aria-hidden="true" onClick={close} />|<div className="mmb-scrim" aria-hidden="true" />
M24-zakladka-strzalka|components/layout/MobileMenuBOffer.tsx|        ArrowRight: (tab + 1) % n,|        ArrowRight: tab,
M25-fragment-bez-warunku-budowy|components/layout/MobileMenuBSlot.tsx|    import.meta.env.VITE_MM_MOBILE_MENU_B !== '1' &&\n    import.meta.env.VITE_MM_MOBILE_MENU_B !== 'true'|    false
M26-fragment-allowlista|components/layout/MobileMenuBSlot.tsx|    import.meta.env.VITE_MM_MOBILE_MENU_B !== 'true'|    !import.meta.env.VITE_MM_MOBILE_MENU_B
EOF

echo "PRZEZYLO=$survivors" | tee -a "$OUT/mutanty.tsv"
[ "$survivors" -eq 0 ]
