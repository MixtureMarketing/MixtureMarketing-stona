#!/usr/bin/env bash
# MIX-1758 mutanty (z korzenia repo, na zatwierdzonym drzewie). Kazdy mutant: sed, grep linii mutanta,
# bieg, przywrocenie TEGO pliku przez git checkout. Wynik: linia "MUT <id> <zabity|przezyl> ..." na mutant.
# Vitest idzie przez zamek: ciezki-bieg --krotki m1758-mut-<id>.
set -u
OUT=.bieg/r/mix1758m; mkdir -p "$OUT"
BB=utils/caseStudyBackBrowser.ts
FS=.bieg/mix1745/full.sh
TESTS="tests/utils/caseStudyBackBrowser.test.ts tests/utils/caseStudyToTop.test.ts"
NONE="    if (plan.kind === 'none') return; // przełącznik wyłączony: bez żadnych zmian"
grep -qxF "$NONE" "$BB" || { echo "STOP: linia none nie znaleziona"; exit 2; }
[ -z "$(git status --porcelain -- "$BB" "$FS")" ] || { echo "STOP: pliki nie sa czyste"; exit 2; }

ts_mut() { # id, zamiennik linii none
  local id=$1 repl=$2
  REPL="$repl" NONE="$NONE" perl -i -pe 'if ($_ eq "$ENV{NONE}\n") { $_ = "$ENV{REPL}\n" }' "$BB"
  if ! grep -qxF "$repl" "$BB"; then echo "MUT $id NIEZASTOSOWANY"; git checkout -- "$BB"; return; fi
  ciezki-bieg --krotki "m1758-mut-$id" npx vitest run $TESTS --maxWorkers=2 > "$OUT/$id.log" 2>&1
  local rc=$?
  local t; t=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/$id.log" | grep -aE '^ +Tests ' | tr -s ' ')
  if [ $rc -ne 0 ]; then echo "MUT $id zabity rc=$rc $t"; else echo "MUT $id przezyl rc=$rc $t"; fi
  sed 's/\x1b\[[0-9;]*m//g' "$OUT/$id.log" | grep -aE '^ +(×|✗|FAIL)' | head -n 5
  git checkout -- "$BB"
}
ts_mut O7 "    if (plan.kind === 'none') { caseStudyToTop(win); return; }"
ts_mut O7b "    if (plan.kind === 'none') { win.scrollTo({ top: 0, left: 0, behavior: 'instant' }); return; }"
ts_mut O7c "    if (plan.kind === 'none') { setTimeout(() => caseStudyToTop(win), 100); return; }"

sh_mut() { # id, sed wyrazenie, oczekiwana linia kontrolna
  local id=$1 expr=$2 probe=$3
  sed -i -e "$expr" "$FS"
  if git diff --quiet -- "$FS"; then echo "MUT $id NIEZASTOSOWANY"; return; fi
  bash .bieg/mix1758/full-rc.sh > "$OUT/$id-green.txt" 2>&1; local g=$?
  RED_STEP=vitest bash .bieg/mix1758/full-rc.sh > "$OUT/$id-red.txt" 2>&1; local r=$?
  if [ $g -eq 0 ] && [ $r -eq 1 ] && grep -qxF 'RED: vitest' "$OUT/$id-red.txt"; then
    echo "MUT $id przezyl green=$g red=$r"
  else
    echo "MUT $id zabity green=$g red=$r linia=$(grep -c -xF 'RED: vitest' "$OUT/$id-red.txt") ($probe)"
  fi
  git checkout -- "$FS"
}
sh_mut F1 's/ RED="\$RED \$n";//' 'krok czerwony nie zapisany'
sh_mut F2 's/exit 1; fi$/exit 0; fi/' 'rc 0 przy czerwonym'
sh_mut F3 's/if \[ -n "\$RED" \]/if [ -z "$RED" ]/' 'odwrocony warunek'
sh_mut F4 's/echo "RED:\$RED"/echo "RED"/' 'linia bez nazwy kroku'
echo "porcelain: $(git status --porcelain -- "$BB" "$FS" | wc -l)"
