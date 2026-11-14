#!/usr/bin/env bash
# MIX-1719 r2: .bieg/mix1711/smooth.sh on the d73cc9f code (noise vs regression of smooth C2/C3).
# HEAD differs from d73cc9f in app code only by utils/caseStudyBackSkip.ts and utils/caseStudyBackTransition.ts;
# their d73cc9f versions are committed under .bieg/mix1719/base-1711 (checked by sha256 and git blob id).
# Usage: bash .bieg/mix1719/smooth1711.sh   (from the repo root on a fresh tree; result on stdout)
set -u
B=.bieg/mix1719/base-1711
OUT=.bieg/r/mix1719s1711; mkdir -p "$OUT/orig/utils"
OLD="utils/caseStudyBackSkip.ts utils/caseStudyBackTransition.ts"
(cd "$B" && sha256sum -c SHA256SUMS) || { echo "FAILCHECK base-1711 checksum mismatch"; exit 2; }
for f in $OLD; do cp "$f" "$OUT/orig/$f"; cp "$B/$f.d73cc9f" "$f"; echo "swapped $f blob $(git hash-object "$f")"; done
bash .bieg/mix1711/smooth.sh; rc=$?
for f in $OLD; do cp "$OUT/orig/$f" "$f"; echo "restored $f blob $(git hash-object "$f")"; done
echo "SMOOTH-1711-SNAPSHOT rc=$rc"
exit $rc
