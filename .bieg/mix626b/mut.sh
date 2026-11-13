#!/usr/bin/env bash
# Mutation checks on the committed tree: one mutant at a time, restore only that file.
# Run from the repo root through the lock. A mutated file must pass its syntax check before tests run.
set -u
OUT=.bieg/mix626b
: > "$OUT/mut.txt"
S=scripts/test-e2e-linear-lead.mjs
C=.github/workflows/ci.yml
T="tests/scripts/e2eLinearLead.test.ts tests/scripts/ciWorkflow.test.ts"
run() { # id file sed-expr
  local id=$1 f=$2 expr=$3
  cp "$f" "$OUT/orig.tmp"
  sed -i "$expr" "$f"
  if cmp -s "$f" "$OUT/orig.tmp"; then echo "$id NOCHANGE" >> "$OUT/mut.txt"; return; fi
  git diff -U0 -- "$f" | grep '^[-+][^-+]' > "$OUT/mut-$id.diff"
  case "$f" in
    *.mjs) node --check "$f" > "$OUT/mut-$id.syn" 2>&1; syn=$? ;;
    *) syn=0 ;;
  esac
  if [ "$syn" != 0 ]; then git checkout -- "$f"; echo "$id INVALID-SYNTAX" >> "$OUT/mut.txt"; return; fi
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$id.log" 2>&1; local rc=$?
  git checkout -- "$f"
  echo "$id rc=$rc $(grep -E 'Tests ' "$OUT/mut-$id.log" | tr -s ' ')" >> "$OUT/mut.txt"
}
run M1 $S "119s/s !== 302 \&\& s !== 303/s !== 302 \&\& s !== 303 \&\& s !== 200/"
run M2 $S '131s#/^(\[a-z0-9-\]+\\.)+cloudflareaccess\\.com\$/#/cloudflareaccess\\.com$/#'
run M3 $S '118s/if (s === 403)/if (s >= 400)/'
run M4 $S "129s/u.username !== '' || //"
run M5 $S "369s/hash.origin/baza.origin/"
run M6 $S "706s/if (!ochrona.ok)/if (false)/"
run M7 $S "101s/HOSTY_PRODUKCJI.includes(host) || //"
run M8 $S "203s/niepelne.length > 0/niepelne.length > 99/"
run M9 $S "189s/=== '1'/!== undefined/"
run M10 $S "163s#return tytul === .*#return tytul.startsWith('[Preview] Lead: example.com — audyt strony');#"
run M11 $S "540s/if (po !== przed)/if (false)/"
run M12 $S "561s/!== 1/!== 0/"
run M13 $S "585s/!== 1/!== 0/"
run M14 $S "638s/!z || !z.etykiety.includes('test')/false/"
run M15 $S "639s/if (!z || z.stan !== 'Canceled')/if (false)/"
run M16 $C "155s#refs/heads/dev#refs/heads/main#"
run M17 $C "6s/, 'dev'//"
run M18 $C "155s/github.event_name == 'push' \&\& //"
git status --short >> "$OUT/mut.txt"
echo DONE >> "$OUT/mut.txt"
