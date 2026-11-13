#!/usr/bin/env bash
# MIX-1607: mutanty (po jednym pliku, przywracanie kopia przez mv). zabity = test czerwony.
set -u
T="tests/components/KnowledgeBaseDefer.test.tsx"
F=components/pages/KnowledgeBase.tsx
run() { # id sed-wyrazenie
  local id=$1 e=$2
  cp "$F" "$F.m1607bak"
  sed -i "$e" "$F"
  if cmp -s "$F" "$F.m1607bak"; then mv "$F.m1607bak" "$F"; echo "| $id | $F | NIE ZASTOSOWANO |"; return; fi
  npx vitest run $T --maxWorkers=2 > ".bieg/r/m1607/mut-$id.out" 2>&1
  local rc=$?
  mv "$F.m1607bak" "$F"
  local why; why=$(sed 's/\x1b\[[0-9;]*m//g' ".bieg/r/m1607/mut-$id.out" | grep -aE "AssertionError|expected" | head -n 1 | cut -c1-110)
  if [ $rc -ne 0 ]; then echo "| $id | $2 | zabity: $why |"; else echo "| $id | $2 | PRZEZYL |"; fi
}
run M1 "s/\[content-visibility:auto\] \[contain-intrinsic-size/[contain-intrinsic-size/"
run M2 "s/auto_1px_auto_540px/1px_1500px/"
run M3 "s/const FIRST_DEFERRED_CARD = 3;/const FIRST_DEFERRED_CARD = 0;/"
run M4 "s/ gap-8\">\$/ gap-8 [content-visibility:auto]\">/"
run M5 "s/{filteredArticles.map((article, index)/{filteredArticles.slice(0, 6).map((article, index)/"
run M6 "s/index >= FIRST_DEFERRED_CARD ?/index >= 99 ?/"
git diff --stat -- "$F" | tail -n 1
echo "mutanty: plik przywrocony ($(git diff --quiet -- "$F" && echo bez zmian || echo ZMIENIONY))"
