#!/usr/bin/env bash
# MIX-1758 B: dowod, ze .bieg/mix1745/full.sh konczy sie rc != 0 przy czerwonym kroku.
# Kopia skryptu z kazdym krokiem zamienionym na `true`, a krok RED_STEP (domyslnie zaden) na `false`.
# Z korzenia repo: bash .bieg/mix1758/full-rc.sh            -> oczekiwane rc 0
#                  RED_STEP=vitest bash .bieg/mix1758/full-rc.sh -> oczekiwane rc 1 i linia "RED: vitest"
set -u
D=.bieg/r/mix1758-rc; mkdir -p "$D"
RED_STEP=${RED_STEP:-}
sed -E \
  -e "s#^OUT=[^;]*;#OUT=$D/out;#" \
  -e "s#^step ([a-z-]+) .*#step \\1 true#" \
  .bieg/mix1745/full.sh > "$D/copy.sh"
if [ -n "$RED_STEP" ]; then sed -i -E "s#^step $RED_STEP true\$#step $RED_STEP false#" "$D/copy.sh"; fi
echo "kroki: $(grep -c '^step ' "$D/copy.sh"), false: $(grep -c '^step [a-z-]* false$' "$D/copy.sh")"
bash "$D/copy.sh"
