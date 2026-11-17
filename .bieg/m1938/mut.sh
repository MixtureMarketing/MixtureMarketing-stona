#!/usr/bin/env bash
# MIX-1938 mutants (wzór .bieg/m1816/mut.sh): zielony baseline; potem jeden mutant naraz.
# A1–A9: formy F1–F9 z werdyktu MIX-1910 wstawione do sprawdzanych plików (noga ujemna).
# G*/N*/P*: mutanty samego strażnika. Zabity = nazwany test padł. NOMATCH = błąd skryptu (exit 3).
# TO jest literałem JSON (JSON.parse), żeby zapisać twardą spację i półpauzę jako   / –.
set -u
NM=0
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1938/mut
mkdir -p "$OUT"
T=tests/content/auditTime.test.ts
echo "MUT HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
npx vitest run $T > "$OUT/baseline.log" 2>&1; brc=$?
echo "MUT baseline rc=$brc $(clean "$OUT/baseline.log" | grep -aE '^\s+Tests ' | tr -s ' ')"
if [ "$brc" -ne 0 ]; then echo "MUT ABORT: baseline red, mutants not run"; exit 1; fi
run() { # name file from to(JSON string)
  local name="$1" f="$2" from="$3" to="$4"
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");const a=process.env.FROM,b=JSON.parse(process.env.TO);if(!s.includes(a)){process.exit(3)}const o=s.replace(a,()=>b);if(o===s){process.exit(4)}fs.writeFileSync(f,o)' "$f" || { echo "$name NOMATCH"; NM=$((NM+1)); return; }
  local changed; changed=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  npx vitest run $T > "$OUT/$name.log" 2>&1; local rc=$?
  local nf; nf=$(clean "$OUT/$name.log" | grep -aE '^\s+Tests ' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo 0)
  local first; first=$(clean "$OUT/$name.log" | grep -aE '^\s*(×|FAIL) ' | head -1 | cut -c1-110)
  if [ "$rc" -ne 0 ] && [ "${nf:-0}" -gt 0 ]; then echo "$name rc=$rc zabity ($nf failed: $first) diff=$changed"
  elif [ "$rc" -ne 0 ]; then echo "$name rc=$rc NIEJASNY (0 named failures: $first) diff=$changed"
  else echo "$name rc=0 PRZEZYL diff=$changed"; fi
  git checkout -- "$f"
  git diff --quiet -- "$f" || echo "WARN $f dirty after $name"
}
A=components/features/audit/AuditTeaser.tsx
J=data/content/web-facts.json
TT=$T
# Formy ataku F1–F9 w plikach z listy (komentarz albo tekst; test czyta tekst linii).
AN="import "
run A1-F1-nbsp $A "$AN" '"// Darmowy, 15\u00a0minutowy audyt strony\nimport "'
run A2-F2-polpauza $A "$AN" '"// Darmowy 15\u2013minutowy audyt strony\nimport "'
run A3-F3-W60s $A "$AN" '"// W 60s dostaniesz wynik audytu\nimport "'
run A4-F4-slowo-w-srodku $A "$AN" '"// Bezpłatny 15-minutowy, techniczny audyt\nimport "'
run A5-F5-audyt-trwa $A "$AN" '"// Audyt trwa 15 minut.\nimport "'
run A6-F6-w-minute $A "$AN" '"// Darmowy audyt w minutę\nimport "'
run A7-F7-json $J '{' '"{\n  \"label\": \"Darmowy audyt w 60s\","'
run A8-F8-60sek $A "$AN" '"// Wynik audytu w 60 sek.\nimport "'
run A9-F9-jsx-nbsp $A "$AN" '"// <span>Wynik w 60&nbsp;s</span>\nimport "'
# Mutanty strażnika
run G1-pusta-lista $TT '/\.(ts|tsx|json)$/.test(f)' '"/\\.(tsq)$/.test(f)"'
run G2-bez-json $TT '/\.(ts|tsx|json)$/.test(f)' '"/\\.(ts|tsx)$/.test(f)"'
run N1-bez-nbsp $TT "/&nbsp;|&#160;|&#x0*a0;|[\u00a0\u2007\u202f]/gi, ' '" '"/&nbsp;|&#160;|&#x0*a0;/gi, '"'"' '"'"'"'
run N2-bez-myslnikow $TT "/[\u2010-\u2015\u2212]/g, '-'" '"/[\\u2212]/g, '"'"'-'"'"'"'
run P1-stary-wzorzec-60s $TT '/\b60\s*(?:s|sek)(?![\p{L}\d])/iu.test(l)' '"/\\bw 60 ?s\\b/.test(l)"'
run P2-15min-bez-audytu $TT '/\b15\s*-?\s*min/i.test(l) && /audyt/i.test(l)' '"/\\b15\\s*-?\\s*min/i.test(l)"'
run P3-minute-bez-audytu $TT '      /audyt|wynik|raport/i.test(l) &&
' '""'
run P4-60s-za-szeroki $TT '(?:s|sek)(?![\p{L}\d])/iu' '"(?:s|sek)/iu"'
echo "git status after: $(git status --porcelain | grep -v '^??' | wc -l) modified"
echo "NOMATCH count: $NM"
[ "$NM" -eq 0 ] || { echo "MUT FAIL: $NM mutant(s) did not apply"; exit 3; }
