#!/usr/bin/env bash
# MIX-1607: A/B Lighthouse (BASE 06c7062 / HEAD / ALL), wszystko na stdout. Sciezki wzgledne.
set -u
mkdir -p .bieg/r
bash .bieg/m1607/measure.sh 3 BASE HEAD ALL 2>&1
echo "=== KONIEC run.sh"
