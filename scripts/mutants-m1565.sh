#!/usr/bin/env bash
# MIX-1565: mutanty pierwszego renderu w kawałkach (utils/bootRender.ts, index.tsx). Każdy mutant
# zmienia JEDEN plik, puszcza testy startu i przywraca dokładnie ten plik (git checkout -- <plik>).
# Uruchamiać na zatwierdzonym drzewie.
#   bash scripts/mutants-m1565.sh <katalog-wynikow>
# Wynik: <katalog>/mutanty.tsv (mutant, plik, rc testów, wynik). rc 0 = każdy mutant zabity.
set -u
OUT="${1:?katalog wynikow}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain -- utils tests index.tsx)" ]; then
  echo "ODMOWA: niezatwierdzone zmiany w utils/, tests/ lub index.tsx" >&2
  exit 2
fi
TESTS=(tests/utils/bootRender.test.tsx tests/indexBootRender.test.tsx tests/indexBoot.test.tsx)
: > "$OUT/mutanty.tsv"
survivors=0

# id|plik|szukany tekst|zamiana  (\n = nowa linia; zamieniane tylko pierwsze wystąpienie)
while IFS='|' read -r id file from to; do
  [ -z "$id" ] && continue
  from="${from//\\n/$'\n'}"
  to="${to//\\n/$'\n'}"
  FROM="$from" TO="$to" perl -0pi -e 's/\Q$ENV{FROM}\E/$ENV{TO}/' "$file"
  if git diff --quiet -- "$file"; then
    echo -e "$id\t$file\t-\tBRAK_MUTACJI" | tee -a "$OUT/mutanty.tsv"
    survivors=$((survivors + 1))
    continue
  fi
  git diff -U0 -- "$file" | grep '^[-+][^-+]' > "$OUT/mut-$id.diff"
  npx vitest run "${TESTS[@]}" --maxWorkers=2 > "$OUT/mut-$id.log" 2>&1
  rc=$?
  git checkout -- "$file"
  if [ "$rc" -ne 0 ]; then res=zabity; else res=przezyl; survivors=$((survivors + 1)); fi
  echo -e "$id\t$file\t$rc\t$res" | tee -a "$OUT/mutanty.tsv"
done << 'EOF'
M1-bez-transition|utils/bootRender.ts|startTransition(() => root.render(node));|root.render(node);
M2-transition-zawsze|utils/bootRender.ts|  if (fromPrerender) {|  if (true) {
M3-transition-odwrotnie|utils/bootRender.ts|  if (fromPrerender) {|  if (!fromPrerender) {
M4-index-flaga-zawsze|index.tsx|    </React.StrictMode>,\n    fromPrerender,|    </React.StrictMode>,\n    true,
M5-index-flaga-nigdy|index.tsx|    </React.StrictMode>,\n    fromPrerender,|    </React.StrictMode>,\n    false,
M6-index-bez-warunku-prerenderu|index.tsx|const fromPrerender = !window.isPrerendering && rootElement.hasChildNodes();|const fromPrerender = rootElement.hasChildNodes();
EOF

echo "PRZEZYLO=$survivors" | tee -a "$OUT/mutanty.tsv"
[ "$survivors" -eq 0 ]
