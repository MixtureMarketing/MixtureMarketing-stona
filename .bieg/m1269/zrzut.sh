#!/usr/bin/env bash
# MIX-1269: zrzut wzorca strony głównej na SHA bazowym (kod strony bez zmian karty).
set -u
echo "HEAD=$(git rev-parse HEAD)"
npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1; echo "npm-ci rc=$?"
npx vitest run .bieg/m1269/zrzut.mix1269.test.tsx 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | tail -n 400
