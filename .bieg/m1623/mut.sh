#!/usr/bin/env bash
# MIX-1623 r2: mutanty App.tsx vs tests/components/AppCookieOrder.test.tsx. Kazdy mutant: zmiana -> vitest -> przywrocenie App.tsx (git checkout -- App.tsx).
set -u
mkdir -p .bieg/r
echo "legacy-peer-deps=true" > .npmrc
npm ci --no-audit --no-fund > .bieg/r/npm-mut.log 2>&1; echo "npm ci rc $?"
T=tests/components/AppCookieOrder.test.tsx
run() { # $1 nazwa
  npx vitest run "$T" --maxWorkers=2 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -aE "Test Files|Tests |AssertionError|expected" | head -n 4 | sed "s/^/   [$1] /"
}
echo "== BASE"; run base
echo "== M1 duplikat banera (drugi <CookieBanner /> w sekcji)"
sed -i 's|^\(\s*\)<CookieBanner />|\1<CookieBanner />\n\1<CookieBanner />|' App.tsx; git diff --stat -- App.tsx | tail -n 1; run M1; git checkout -- App.tsx
echo "== M2 baner usuniety"
sed -i '/^\s*<CookieBanner \/>$/d' App.tsx; git diff --stat -- App.tsx | tail -n 1; run M2; git checkout -- App.tsx
echo "== M3 duplikat calej sekcji z banerem"
sed -i 's|^\(\s*\)<section aria-label="Zarządzanie plikami cookies">|\1<section aria-label="Zarządzanie plikami cookies"><CookieBanner /></section>\n&|' App.tsx; git diff --stat -- App.tsx | tail -n 1; run M3; git checkout -- App.tsx
echo "== M4 baner za <main> (kolejnosc)"
sed -i '/^\s*<CookieBanner \/>$/d' App.tsx; sed -i 's|^\(\s*\)<main id="main-content">|\1<CookieBanner />\n&|' App.tsx; git diff --stat -- App.tsx | tail -n 1; run M4; git checkout -- App.tsx
echo "== po przywroceniu"; git status --porcelain -- App.tsx | wc -l; run restored
echo "=== KONIEC mut.sh"
