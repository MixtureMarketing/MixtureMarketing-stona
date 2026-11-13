#!/usr/bin/env bash
# MIX-1607 r2: A/B BASE vs HEAD z flaga banera: /baza-wiedzy/ x10, potem / i /portfolio/ x5; kandydaci LCP ze sladow.
set -u
mkdir -p .bieg/r
echo "##### baza-wiedzy x10"
CB=1 TAG=a OUT=.bieg/m1607/outa PAGES="/baza-wiedzy/" bash .bieg/m1607/measure.sh 10 BASE HEAD 2>&1 | grep -E "^(npm ci|build|lh .* rc [^0]|=== POROWNANIE|\| )" | head -n 12 | cut -c1-200
for k in 0 1; do echo "=== BD baza-wiedzy ref=$([ $k = 0 ] && echo BASE || echo HEAD)"; node .bieg/m1607/bd.mjs .bieg/m1607/outa/lh$k baza-wiedzy | grep -E "^##|kandydaci" | cut -c1-260; done
echo "##### home + portfolio x5"
CB=1 TAG=b OUT=.bieg/m1607/outb PAGES="/ /portfolio/" bash .bieg/m1607/measure.sh 5 BASE HEAD 2>&1 | grep -E "^(npm ci|build|lh .* rc [^0]|=== POROWNANIE|\| )" | head -n 12 | cut -c1-200
for k in 0 1; do for p in home portfolio; do echo "=== BD $p ref=$([ $k = 0 ] && echo BASE || echo HEAD)"; node .bieg/m1607/bd.mjs .bieg/m1607/outb/lh$k $p | grep -E "^##" | cut -c1-200; done; done
echo "=== KONIEC ab5.sh"
