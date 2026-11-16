#!/usr/bin/env bash
# MIX-1607 r2: A/B BASE vs HEAD z flaga banera, /baza-wiedzy/ x8; kandydaci LCP ze sladow (wykrycie wyscigu pierwsze malowanie / baner).
set -u
mkdir -p .bieg/r
CB=1 TAG=c OUT=.bieg/m1607/outc PAGES="/baza-wiedzy/" bash .bieg/m1607/measure.sh 8 BASE HEAD 2>&1 | grep -E "^(npm ci|build|lh .* rc [^0]|=== POROWNANIE|\| )" | head -n 12 | cut -c1-200
for k in 0 1; do echo "=== BD baza-wiedzy ref=$([ $k = 0 ] && echo BASE || echo HEAD)"; node .bieg/m1607/bd.mjs .bieg/m1607/outc/lh$k baza-wiedzy | grep -E "^##|kandydaci" | cut -c1-260; done
echo "=== KONIEC ab6.sh"
