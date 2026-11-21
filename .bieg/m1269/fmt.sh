#!/usr/bin/env bash
# MIX-1269: co zmieniłby prettier projektu w plikach zmiany (łatka na stdout, do nałożenia lokalnie).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1; echo "npm-ci rc=$?"
npx prettier --version
F="docs/tresci/MIX-1269.md data/content/pages/homeSeo.ts tests/seo/homeSeo.test.tsx config/flags.ts components/pages/Home.tsx components/sections/Hero.tsx tests/scripts/ciWorkflow.test.ts .github/workflows/ci.yml"
for f in $F; do npx prettier "$f" > "$f.fmt" 2>/dev/null; diff -u "$f" "$f.fmt" | sed "1s|.*|--- a/$f|;2s|.*|+++ b/$f|"; rm -f "$f.fmt"; done
echo "FMT KONIEC"
