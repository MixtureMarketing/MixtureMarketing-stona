#!/usr/bin/env bash
# Mutation checks on the committed tree (one mutant at a time, only the mutated file is restored).
# Run from the repo root through the lock. A mutated .mjs must pass `node --check` before the tests run.
set -u
OUT=.bieg/z8c
: > "$OUT/mut.txt"
S=scripts/test-e2e-linear-lead.mjs
T="tests/scripts/e2eLinearLead.test.ts"
run() { # id file sed-expr
  local id=$1 f=$2 expr=$3
  cp "$f" "$OUT/orig.tmp"
  sed -i "$expr" "$f"
  if cmp -s "$f" "$OUT/orig.tmp"; then echo "$id NOCHANGE" >> "$OUT/mut.txt"; return; fi
  git diff -U0 -- "$f" | grep '^[-+][^-+]' > "$OUT/mut-$id.diff"
  node --check "$f" > "$OUT/mut-$id.syn" 2>&1; syn=$?
  if [ "$syn" != 0 ]; then git checkout -- "$f"; echo "$id INVALID-SYNTAX" >> "$OUT/mut.txt"; return; fi
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$id.log" 2>&1; local rc=$?
  git checkout -- "$f"
  echo "$id rc=$rc $(grep -E 'Tests ' "$OUT/mut-$id.log" | tr -s ' ')" >> "$OUT/mut.txt"
}
run V1  $S "801s/z.tytul.startsWith(PRZEDROSTEK_TYTULU)/true/"
run V1b $S "560s/z.tytul.startsWith(PRZEDROSTEK_TYTULU)/true/"
run E1  $S "563s/nowe.length > 0/nowe.length > 99/"
run S1  $S "665s/stan.sha !== ctx.sha/false/"
run S2  $S "669s/wiek >= WAZNOSC_STANU_F_MS/wiek >= 1e15/"
run S3  $S "668s/wiek < 0/false/"
run S4  $S "664s/!ctx?.sha/false/"
run S5  $S "662s/ || stan.nieczytelny//"
run S6  $S "613s/if (wiazanie)/if (false)/"
run S7  $S "852s/e?.code === 'ENOENT' ? null : { nieczytelny: true }/null/"
run S8  $S "598s/sha: ctx.sha/sha: ''/"
run S9  $S "597s/f2: null,//"
run A1  $S "119s/host !== ALIAS_PREVIEW/false/"
run A2  $S "42s/{8}/{7,9}/"
run A3  $S '105s/%//'
run A4  $S "115s/u.port !== ''/false/"
run A5  $S "123s/if (adres !== u.origin \&\& adres !== \`\${u.origin}\/\`)/if (false)/"
run A6  $S "113s/u.protocol !== 'https:'/false/"
run A7  $S "42s#/^\[0-9a-f\]#/[0-9a-f]#"
run A8  $S "42s/0-9a-f/0-9a-z/"
run A9  $S "s/host.endsWith('.mixturemarketing.pl')/false/"
run R1  $S "44s/= 3/= 1/"
run R2  $S "584s/if (p.json.w_kolejce !== 0 || p.json.ponowione !== 0) break;/if (false) break;/"
run R3  $S "585s/if (proba < PROBY_PONOW) await ctx.sleep(ctx.krokMs);//"
run R4  $S "585s/proba < PROBY_PONOW/proba <= PROBY_PONOW/"
run V10 $S "639s/await ctx.sleep(ctx.krokMs);//"
run M1  $S '843s/, sek)/, [])/'
run M2  $S '865s/maskuj(args.blad, \[.*\])/args.blad/'
git status --short >> "$OUT/mut.txt"
echo DONE >> "$OUT/mut.txt"
