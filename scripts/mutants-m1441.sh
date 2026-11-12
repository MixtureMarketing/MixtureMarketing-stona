#!/usr/bin/env bash
# MIX-1441: mutanty pomocnika preview-server (i sondy przejść). Każdy mutant zmienia JEDNĄ linię
# jednego pliku, puszcza test pomocnika i przywraca dokładnie ten plik (git checkout -- <plik>).
# Wynik: tabela mutant | linia | wynik (zabity = test zrobił się czerwony, przeżył = rc 0).
#   bash scripts/mutants-m1441.sh [katalog-wynikow=.bieg/m1441] [numer-mutanta...]
set -u
OUT="${1:-.bieg/m1441}"
shift || true
mkdir -p "$OUT"
H=scripts/lib/preview-server.mjs
V=scripts/probe-view-transitions.mjs
T=tests/scripts/preview-server.test.ts
# numer~plik~wzorzec perl (s///)~opis
MUTANTS=(
  "1~$H~s/^  await assertPortFree\\(port, host\\);/  \\/\\/ no-op/m~brak sprawdzenia zajętego portu"
  "2~$H~s/detached: true/detached: false/~serwer bez własnej grupy procesów"
  "3~$H~s/process.kill\\(-pgid, 'SIGKILL'\\);\\n  \\} catch \\{\\n    \\/\\* znikła/process.kill(-pgid, 0);\\n  } catch {\\n    \\/* znikła/~brak SIGKILL po limicie"
  "4~$H~s/listenerBelongsToGroup\\(port, pgid\\) === false/listenerBelongsToGroup(port, pgid) === 'x'/~odpowiedź obcego procesu uznana za gotowość"
  "5~$H~s/    if \\(exited\\)\\n      await fail\\(/    if (false)\\n      await fail(/~martwy serwer nie przerywa startu"
  "6~$H~s/n < 1024/n < 0/~port systemowy dozwolony"
  "7~$H~s/if \\(raw === undefined \\|\\| raw === null\\)/if (raw === undefined || raw === null || raw === '')/~pusty port uznany za domyślny"
  "8~$H~s/process.on\\('SIGINT', onSignal\\('SIGINT', 130\\)\\);//~brak obsługi SIGINT"
  "9~$H~s/process.on\\('exit', \\(\\) => \\{\\n    for \\(const pgid of live\\) killGroupSync\\(pgid\\);/process.on('exit', () => {\\n    for (const pgid of []) killGroupSync(pgid);/~brak sprzątania przy exit"
  "10~$V~s/fail\\((.{1,30}brak karty realizacji do zrzutu)/void ($1/~cichy brak karty do zrzutu"
  "11~$V~s/fail\\((.{1,30}A2-powiazane: brak karty)/void ($1/~cichy pominięty A2"
)
TSV="$OUT/mutanty.tsv"
: > "$TSV"
for m in "${MUTANTS[@]}"; do
  IFS="~" read -r num file pat desc <<< "$m"
  if [ "$#" -gt 0 ] && [[ ! " $* " =~ " $num " ]]; then continue; fi
  perl -0pi -e "$pat" "$file"
  if git diff --quiet -- "$file"; then
    echo -e "$num\t$file\t$desc\tBLAD: wzorzec nic nie zmienił" | tee -a "$TSV"
    continue
  fi
  npx vitest run --maxWorkers=2 "$T" > "$OUT/mutant-$num.log" 2>&1
  rc=$?
  git checkout -- "$file"
  if [ "$rc" -ne 0 ]; then res=zabity; else res=przezyl; fi
  echo -e "$num\t$file\t$desc\t$res (rc $rc)" | tee -a "$TSV"
done
