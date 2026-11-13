#!/usr/bin/env bash
# MIX-1607 r2: rozbicie LCP /baza-wiedzy/: BASE z flaga banera (CB=1) i bez (CB=0), 6 przebiegow, slady.
set -u
mkdir -p .bieg/r
for cb in 1 0; do
  echo "##### CB=$cb (VITE_MM_COOKIE_BANNER_STATIC)"
  CB=$cb TAG=cb$cb OUT=.bieg/m1607/out$cb PAGES="/baza-wiedzy/" bash .bieg/m1607/measure.sh 6 BASE HEAD 2>&1 | grep -E "^(npm ci|build|BASE:|lh |=== (POROWNANIE|HTML))" | cut -c1-200
  for k in 0 1; do echo "=== BD CB=$cb ref=$([ $k = 0 ] && echo BASE || echo HEAD)"; node .bieg/m1607/bd.mjs .bieg/m1607/out$cb/lh$k baza-wiedzy | cut -c1-420; done
done
echo "=== KONIEC bd.sh"
