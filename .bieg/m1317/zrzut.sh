#!/usr/bin/env bash
# MIX-1317 krok 1 (chmura): npm ci; prettier --write plików zmiany (diff na stdout, base64);
# tsc; eslint; zrzut wzorca sekcji procesu z kodu bazowego (bc51ab2) do tests/fixtures/mix1317.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1317/z; mkdir -p "$OUT"
echo "HEAD=$(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "STEP npm-ci rc=$?"
# Baza: z historii, jeśli jest; inaczej drzewo z cofniętą łatką zmian produktu.
B=.bieg/m1317/baza-src; rm -rf "$B"; mkdir -p "$B"
if git cat-file -e bc51ab2^{commit} 2>/dev/null; then
  git archive bc51ab2 | tar -x -C "$B"; echo "BAZA z git archive bc51ab2"
else
  tar --exclude=./node_modules --exclude=./.bieg --exclude=./dist --exclude=./.git -cf - . | tar -x -C "$B"
  git apply -R --directory="$B" .bieg/m1317/baza-odwrotnie.patch; echo "BAZA z łatki rc=$?"
fi
CHANGED="components/common/ProcessTimeline.tsx components/features/design/BrandProcess.tsx components/features/web-development/CustomAppStart.tsx components/pages/AiSystemsApps.tsx components/pages/GoogleAds.tsx components/pages/MarketingSeo.tsx components/pages/SeoRzeszow.tsx config/flags.ts index.css tests/helpers/processPages.tsx tests/process/processTimeline.test.tsx tests/scripts/ciWorkflow.test.ts .github/workflows/ci.yml"
# shellcheck disable=SC2086
npx prettier --write $CHANGED > "$OUT/prettier.log" 2>&1; echo "STEP prettier-write rc=$?"
echo "FMT-START"; git diff | base64 -w 120; echo "FMT-KONIEC"
npx tsc --noEmit -p tsconfig.json > "$OUT/tsc.log" 2>&1; echo "STEP tsc rc=$? errors=$(grep -c 'error TS' "$OUT/tsc.log")"
grep -a 'error TS' "$OUT/tsc.log" | head -15
# shellcheck disable=SC2086
npx eslint $(echo $CHANGED | tr ' ' '\n' | grep -E '\.tsx?$') --max-warnings 0 > "$OUT/eslint.log" 2>&1; echo "STEP eslint rc=$?"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/eslint.log" | grep -aE 'error|warning|^/' | head -20
mkdir -p "$B/tests/helpers" "$B/.bieg/m1317"
git show HEAD:tests/helpers/processPages.tsx > "$B/tests/helpers/processPages.tsx" 2>/dev/null || cp tests/helpers/processPages.tsx "$B/tests/helpers/"
echo "baza: flaga w flags.ts: $(grep -c VITE_MM_PROCESS_TIMELINE "$B/config/flags.ts"), ProcessTimeline: $(ls "$B/components/common/ProcessTimeline.tsx" 2>/dev/null | wc -l)"
cp .bieg/m1317/zrzut.test.tsx.txt "$B/.bieg/m1317/zrzut.mix1317.test.tsx"
ln -s "$PWD/node_modules" "$B/node_modules"
( cd "$B" && npx vitest run .bieg/m1317/zrzut.mix1317.test.tsx ) > "$OUT/zrzut.log" 2>&1; zr=$?
echo "STEP zrzut rc=$zr"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/zrzut.log" | sed -n '/ZRZUT-START/,/ZRZUT-KONIEC/p'
sed 's/\x1b\[[0-9;]*m//g' "$OUT/zrzut.log" | grep -aE 'Error|FAIL|Tests ' | head -20
exit $zr
