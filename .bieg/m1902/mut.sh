#!/usr/bin/env bash
# MIX-1902 mutants (wzór .bieg/m1898/mut.sh): formy obiektowe z uwagi 1 werdyktu MIX-1898.
# Każdy mutant zmienia jedną linię `return raw === '1';`, uruchamia test i ma dać czerwień (KILLED).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
D=components/features/calculator
T=$D/flagInherit.mix1898.test.ts
OUT=.bieg/m1902/mut
mkdir -p "$OUT"
RET="  return raw === '1';"
rep() { FROM="$2" TO="$3" N="$4" node -e '
const fs=require("fs");const f=process.argv[1];let s=fs.readFileSync(f,"utf8");
const from=process.env.FROM, n=+process.env.N; let i=-1;
for(let k=0;k<=n;k++){i=s.indexOf(from,i+1);if(i<0)process.exit(3)}
s=s.slice(0,i)+process.env.TO+s.slice(i+from.length);fs.writeFileSync(f,s)' "$1"; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
npx vitest run "$T" > "$OUT/base.log" 2>&1; brc=$?
echo "BASELINE rc=$brc $(clean "$OUT/base.log" | grep -aE '^ *Tests ')"
[ "$brc" -ne 0 ] && { echo "MUT ABORT: baseline red"; exit 1; }
mut() { local id=$1 f=$2 to=$3 n=$4
  rep "$f" "$RET" "$to" "$n" || { echo "MUT $id NOMATCH"; git checkout -- "$f"; return; }
  local ns; ns=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  npx vitest run "$T" > "$OUT/$id.log" 2>&1; local rc=$?
  local fl; fl=$(clean "$OUT/$id.log" | grep -aE '^ *Tests ' | head -1)
  git checkout -- "$f"
  [ $rc -ne 0 ] && echo "MUT $id KILLED rc=$rc diff=$ns $fl" || echo "MUT $id SURVIVED rc=$rc diff=$ns $fl"
}
LUZ="  return raw == '1';"
LUZ_BEZ="  return typeof raw !== 'number' && typeof raw !== 'boolean' && raw == '1';"
VOF="  return (raw as { valueOf?: () => unknown } | null | undefined)?.valueOf?.() === '1';"
mut L0-calc-luzne          $D/calcUi.ts    "$LUZ" 0
mut L1-calc-luzne-bez-liczb $D/calcUi.ts   "$LUZ_BEZ" 0
mut L2-preview-luzne-bez-liczb $D/livePrice.ts "$LUZ_BEZ" 1
mut L3-link-luzne-bez-liczb $D/livePrice.ts "$LUZ_BEZ" 2
mut O1-calc-valueOf        $D/calcUi.ts    "$VOF" 0
mut O2-preview-valueOf     $D/livePrice.ts "$VOF" 1
mut O3-link-valueOf        $D/livePrice.ts "$VOF" 2
echo "dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
