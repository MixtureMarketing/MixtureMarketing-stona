#!/usr/bin/env bash
# MIX-1695: vitest tests/seo/llmsTxt.test.ts + mutanty galezi astralnej skeletonChar (scripts/lib/llms.js:189).
# X6: astral -> "" (znak znika), X7: astral -> " " (separator miekki), X8: astral -> "/" (separator twardy).
set -u
cd "$(dirname "$0")/../.." || exit 1
OUT=.bieg/mix1695/out
mkdir -p "$OUT"
SRC=scripts/lib/llms.js
LINE=189
CMD="env NO_COLOR=1 FORCE_COLOR=0 npx vitest run tests/seo/llmsTxt.test.ts --maxWorkers=2"

echo "sha=$(git rev-parse HEAD)"

# 1. zaleznosci (maszyna bez node_modules)
if [ ! -d node_modules ]; then
  echo "node_modules brak: npm ci"
  # legacy-peer-deps przez zmienna srodowiska: plik konfiguracji npm jest maskowany jako sekret przy wysylce biegu
  npm_config_legacy_peer_deps=true npm ci --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
  nrc=$?
  echo "npm ci rc=$nrc"
  if [ "$nrc" -ne 0 ]; then
    tail -30 "$OUT/npm-ci.log"
    exit 1
  fi
fi

# 2. miejsce mutanta
if ! sed -n "${LINE}p" "$SRC" | grep -q 'return WILDCARD;'; then
  echo "mutant: bledny (linia $LINE nie zawiera 'return WILDCARD;')"
  exit 1
fi

# 3. baseline
$CMD > "$OUT/vitest.log" 2>&1
rc=$?
echo "vitest rc=$rc"
grep -E "^ *Tests " "$OUT/vitest.log" | tail -1
if [ "$rc" -ne 0 ]; then
  tail -30 "$OUT/vitest.log"
  echo "mutant X6: bledny (baseline czerwony)"
  exit 1
fi

# 4. mutanty
cp "$SRC" "$OUT/llms.js.orig"
status=0
for spec in 'X6|""' 'X7|" "' 'X8|"/"'; do
  id=${spec%%|*}
  val=${spec#*|}
  cp "$OUT/llms.js.orig" "$SRC"
  sed -i "${LINE}s|return WILDCARD;|return c.codePointAt(0) > 0xFFFF ? ${val} : WILDCARD;|" "$SRC"
  if git diff --quiet "$SRC"; then
    echo "mutant $id: bledny (miejsce nie znalezione)"
    status=1
    continue
  fi
  $CMD > "$OUT/vitest-$id.log" 2>&1
  mrc=$?
  echo "vitest-$id rc=$mrc"
  grep -E "^ *Tests " "$OUT/vitest-$id.log" | tail -1
  if [ "$mrc" -ne 0 ]; then
    echo "mutant $id: zabity"
    grep -E "^ *(FAIL|×)" "$OUT/vitest-$id.log" | head -5
  else
    echo "mutant $id: przezyl"
  fi
done
cp "$OUT/llms.js.orig" "$SRC"
git diff --quiet "$SRC"
echo "restore rc=$?"
exit "$status"
