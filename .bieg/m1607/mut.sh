#!/usr/bin/env bash
# MIX-1607 r2: mutanty App.tsx (po jednym pliku, przywracanie kopia przez mv). zabity = test czerwony.
set -u
T="tests/components/AppCookieOrder.test.tsx"
F=App.tsx
run() { # id operacja
  local id=$1 op=$2
  cp "$F" "$F.m1607bak"
  if ! node .bieg/m1607/mut-app.mjs "$op" > ".bieg/r/m1607/mut-$id.mut" 2>&1; then mv "$F.m1607bak" "$F"; echo "| $id | $op | NIE ZASTOSOWANO |"; return; fi
  npx vitest run $T --maxWorkers=2 > ".bieg/r/m1607/mut-$id.out" 2>&1
  local rc=$?
  mv "$F.m1607bak" "$F"
  local why; why=$(sed 's/\x1b\[[0-9;]*m//g' ".bieg/r/m1607/mut-$id.out" | grep -aE "AssertionError|expected" | head -n 1 | cut -c1-110)
  if [ $rc -ne 0 ]; then echo "| $id | $op | zabity: $why |"; else echo "| $id | $op | PRZEZYL |"; fi
}
run M1 po-main
run M2 przed-skip
run M3 po-navbarze
run M4 w-main
run M5 bez-sekcji
run M6 etykieta
git diff --stat -- "$F" | tail -n 1
echo "mutanty: plik przywrocony ($(git diff --quiet HEAD -- "$F" && echo bez zmian || echo ZMIENIONY))"
