#!/usr/bin/env bash
# MIX-1286b: pelna kontrola (npm ci, eslint, prettier zmienionych, tsc root, tsc functions, vitest run, build). Z korzenia repo.
set -u
OUT=.bieg/r/mix1286bf; mkdir -p "$OUT"; : > "$OUT/summary.txt"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null)" | tee -a "$OUT/summary.txt"
step() { local n=$1; shift; "$@" > "$OUT/$n.log" 2>&1; local rc=$?; echo "$n rc=$rc" | tee -a "$OUT/summary.txt"; if [ $rc -ne 0 ]; then sed "s/\x1b\[[0-9;]*m//g" "$OUT/$n.log" | tail -n 40 | tee -a "$OUT/summary.txt"; fi; }
step npm-ci npm ci --legacy-peer-deps --no-audit --no-fund
step eslint npx eslint . --report-unused-disable-directives --max-warnings 0
step prettier npx prettier --check components/sections/LocalRzeszowSection.tsx tests/seo/localRzeszowSections.test.tsx
step tsc-root npx tsc --noEmit -p tsconfig.json
step tsc-functions npx tsc --noEmit -p functions/tsconfig.json
step vitest npx vitest run --maxWorkers=2
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE "Test Files|Tests " | tee -a "$OUT/summary.txt"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/vitest.log" | grep -aE " FAIL |AssertionError" | head -n 20 | tee -a "$OUT/summary.txt"
step build npm run build
echo "porcelain: $(git status --porcelain | grep -v '^?? .bieg/' | wc -l)" | tee -a "$OUT/summary.txt"; git status --porcelain | grep -v '^?? .bieg/' | tee -a "$OUT/summary.txt"
# Mutanty (po pelnej kontroli, na zatwierdzonym drzewie; kazdy przywracany git checkout jednego pliku)
S=components/sections/LocalRzeszowSection.tsx; T=tests/seo/localRzeszowSections.test.tsx
mut() { local n=$1; shift; "$@"; npx vitest run "$T" --maxWorkers=2 > "$OUT/mut-$n.log" 2>&1; local rc=$?; sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$n.log" | grep -aE "AssertionError|Tests " | head -n 4 > "$OUT/mut-$n.txt"; echo "MUTANT $n vitest rc=$rc ($( [ $rc -ne 0 ] && echo zabity || echo przezyl ))" | tee -a "$OUT/summary.txt"; head -n 4 "$OUT/mut-$n.txt" | tee -a "$OUT/summary.txt"; git checkout -- "$S"; }
mut adres-wraca sed -i "s|            Telefon:{' '}|            Adres rejestrowy: {SITE_CONFIG.contact.address.street}, {SITE_CONFIG.contact.address.postalCode}. Telefon:{' '}|" "$S"
mut tylko-kod sed -i "s|            Telefon:{' '}|            Kod {SITE_CONFIG.contact.address.postalCode}. Telefon:{' '}|" "$S"
mut bez-telefonu sed -i 's|href={`tel:${phoneFull}`}|href="/contact/"|' "$S"
echo "porcelain-po-mutantach: $(git status --porcelain | grep -v '^?? .bieg/' | wc -l)" | tee -a "$OUT/summary.txt"; git status --porcelain | grep -v '^?? .bieg/' | tee -a "$OUT/summary.txt"
