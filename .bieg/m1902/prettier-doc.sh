#!/usr/bin/env bash
# MIX-1902: czy uwagi prettier dla kontraktu były przed kartą? Baza = HEAD z liniami 231-232
# zamienionymi na jedną linię sprzed zmiany (migawka stacji nie ma historii 5d81d76).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
DOC=docs/estimation/kontrakt-kalkulator-publiczny.md
OUT=.bieg/m1902/pdoc; mkdir -p "$OUT"
cp "$DOC" "$OUT/head.md"
sed -n '231,232p' "$DOC" | sed 's/^/  head 231-232: /'
sed '231,232d' "$DOC" | sed '230a\  budowy `VITE_MM_CONFIG_PREVIEW` (`1`/`true`).' > "$OUT/baza.md"
echo "  baza linii=$(wc -l < "$OUT/baza.md") head linii=$(wc -l < "$OUT/head.md") baza sha256=$(sha256sum "$OUT/baza.md" | cut -c1-16)"
for w in baza head; do
  npx prettier --stdin-filepath "$DOC" < "$OUT/$w.md" > "$OUT/$w.fmt.md"; prc=$?
  diff "$OUT/$w.md" "$OUT/$w.fmt.md" > "$OUT/$w.diff"
  echo "PDOC $w prettier-rc=$prc hunks=$(grep -cE '^[0-9]' "$OUT/$w.diff") lines=$(grep -E '^[0-9]' "$OUT/$w.diff" | tr '\n' ' ')"
done
