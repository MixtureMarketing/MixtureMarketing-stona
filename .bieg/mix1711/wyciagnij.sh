#!/usr/bin/env bash
# MIX-1711 r2: rebuild the artifacts printed by reverse.sh ("B64 <file> <chunk>") from a run log into
# .bieg/mix1711/out/ and check each against its "SHA256 <file> <hash>" line. Usage: wyciagnij.sh <log>. Exit 0 = all ok.
set -u
LOG=${1:?usage: wyciagnij.sh <log>}
OUT=.bieg/mix1711/out; mkdir -p "$OUT"
BAD=0; N=0
while read -r _ f want _; do
  case "$f" in strip-1280.png|strip-375.png|video-1280.webm|video-375.webm|reverse-1280.json|reverse-375.json) ;; *) echo "skip $f"; continue ;; esac
  grep -a "^B64 $f " "$LOG" | cut -d' ' -f3 | base64 -d > "$OUT/$f"
  got=$(sha256sum "$OUT/$f" | cut -d' ' -f1); N=$((N + 1))
  if [ "$got" = "$want" ]; then echo "ok $f $(wc -c < "$OUT/$f")"; else echo "BAD $f"; BAD=$((BAD + 1)); fi
done < <(grep -a '^SHA256 ' "$LOG")
echo "extracted=$N bad=$BAD"
[ "$N" -gt 0 ] && [ "$BAD" -eq 0 ]
