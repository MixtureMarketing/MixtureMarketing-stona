#!/usr/bin/env bash
# MIX-1745: rebuild the files printed by frames.sh ("B64 <file> <chunk>") from a run log into <dir> and check each
# against its "SHA256 <file> <hash>" line. Names allowed: [a-z0-9-]+.(png|json). Usage: wyciagnij.sh <log> <dir>.
# Exit 0 = at least one file and all ok.
set -u
LOG=${1:?usage: wyciagnij.sh <log> <dir>}; DIR=${2:?dir}
mkdir -p "$DIR"; BAD=0; N=0
while read -r _ f want _; do
  [[ "$f" =~ ^[a-z0-9-]+\.(png|json)$ ]] || { echo "skip $f"; BAD=$((BAD + 1)); continue; }
  grep -a "^B64 $f " "$LOG" | cut -d' ' -f3 | base64 -d > "$DIR/$f"
  got=$(sha256sum "$DIR/$f" | cut -d' ' -f1); N=$((N + 1))
  [ "$got" = "$want" ] || { echo "BAD $f"; BAD=$((BAD + 1)); }
done < <(grep -a '^SHA256 ' "$LOG")
echo "extracted=$N bad=$BAD"
[ "$N" -gt 0 ] && [ "$BAD" -eq 0 ]
