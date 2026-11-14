#!/usr/bin/env bash
# MIX-1695: vitest tests/seo/llmsTxt.test.ts + mutant X6 (scripts/lib/llms.js:189, astral code points dropped in the WILDCARD branch of skeletonChar)
set -u
cd "$(dirname "$0")/../.." || exit 1
OUT=.bieg/mix1695/out
mkdir -p "$OUT"
CMD="npx vitest run tests/seo/llmsTxt.test.ts --maxWorkers=2"

echo "sha=$(git rev-parse HEAD)"

$CMD > "$OUT/vitest.log" 2>&1
rc=$?
echo "vitest rc=$rc"
grep -E "^ *Tests " "$OUT/vitest.log" | tail -1

cp scripts/lib/llms.js "$OUT/llms.js.orig"
sed -i '189s/return WILDCARD;/return c.codePointAt(0) > 0xFFFF ? "" : WILDCARD;/' scripts/lib/llms.js
if git diff --quiet scripts/lib/llms.js; then
  echo "mutant X6: bledny (miejsce nie znalezione)"
else
  $CMD > "$OUT/vitest-x6.log" 2>&1
  mrc=$?
  echo "vitest-x6 rc=$mrc"
  grep -E "^ *Tests " "$OUT/vitest-x6.log" | tail -1
  if [ "$mrc" -ne 0 ]; then
    echo "mutant X6: zabity"
  else
    echo "mutant X6: przezyl"
  fi
fi
cp "$OUT/llms.js.orig" scripts/lib/llms.js
git diff --quiet scripts/lib/llms.js
echo "restore rc=$?"
