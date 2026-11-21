#!/usr/bin/env bash
# MIX-1898 mutants: each mutant edits one file, runs the targeted test, must be RED (killed).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
D=components/features/calculator
T=$D/flagInherit.mix1898.test.ts
RET="  return raw === '1';"
rep() { FROM="$2" TO="$3" N="$4" node -e '
const fs=require("fs");const f=process.argv[1];let s=fs.readFileSync(f,"utf8");
const from=process.env.FROM, n=+process.env.N; let i=-1;
for(let k=0;k<=n;k++){i=s.indexOf(from,i+1);if(i<0)process.exit(3)}
s=s.slice(0,i)+process.env.TO+s.slice(i+from.length);fs.writeFileSync(f,s)' "$1"; }
base() { npx vitest run "$T" > /tmp/m1898-base.log 2>&1; echo "BASELINE rc=$? $(sed 's/\x1b\[[0-9;]*m//g' /tmp/m1898-base.log | grep -aE '^ *Tests ' )"; }
mut() { local id=$1 f=$2 from=$3 to=$4 n=$5 pre=${6:-}
  if [ -n "$pre" ]; then FROM="// zostają w hookach i formLogic." TO="// zostają w hookach i formLogic.
import { isLivePriceBarEnabled } from './livePrice';" N=0 rep "$f" "// zostają w hookach i formLogic." "// zostają w hookach i formLogic.
import { isLivePriceBarEnabled } from './livePrice';" 0 || { echo "MUT $id NOMATCH-pre"; return; }; fi
  rep "$f" "$from" "$to" "$n" || { echo "MUT $id NOMATCH"; git checkout -- "$f"; return; }
  npx vitest run "$T" > /tmp/m1898-$id.log 2>&1; local rc=$?
  local fl; fl=$(sed 's/\x1b\[[0-9;]*m//g' /tmp/m1898-$id.log | grep -aE '^ *Tests ' | head -1)
  git checkout -- "$f"
  [ $rc -ne 0 ] && echo "MUT $id KILLED rc=$rc $fl" || echo "MUT $id SURVIVED rc=$rc $fl"
}
base
mut M1-calcUi-delegacja   $D/calcUi.ts    "$RET" "  return isLivePriceBarEnabled(raw);" 0 pre
mut M2-preview-delegacja  $D/livePrice.ts "$RET" "  return isLivePriceBarEnabled(raw);" 1
mut M3-link-delegacja     $D/livePrice.ts "$RET" "  return isLivePriceBarEnabled(raw);" 2
mut M4-calcUi-true        $D/calcUi.ts    "$RET" "  return raw === '1' || raw === 'true';" 0
mut M5-preview-trim       $D/livePrice.ts "$RET" "  return String(raw).trim() === '1';" 1
mut M6-link-luzne         $D/livePrice.ts "$RET" "  return raw == 1;" 2
mut M7-preview-stale-true $D/livePrice.ts "$RET" "  return true;" 1
mut M8-link-stale-false   $D/livePrice.ts "$RET" "  return false;" 2
echo "dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
