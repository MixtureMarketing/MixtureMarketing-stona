#!/usr/bin/env bash
# MIX-1269: zrzut wzorca strony głównej na SHA bazowym (kod strony bez zmian karty).
# Uzyty raz na 825b734 (kod strony = integracja 21a5ca4, stacja widzi go jako edfd10e); wynik: tests/fixtures/mix1269/home-flag-off.json.
set -u
echo "HEAD=$(git rev-parse HEAD)"
npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1; echo "npm-ci rc=$?"
cp .bieg/m1269/zrzut.mix1269.tsx.txt .bieg/m1269/zrzut.mix1269.test.tsx; npx vitest run .bieg/m1269/zrzut.mix1269.test.tsx 2>&1 | sed "s/\x1b\[[0-9;]*m//g" | tail -n 400; mv .bieg/m1269/zrzut.mix1269.test.tsx .bieg/m1269/zrzut.mix1269.uzyty.txt
