#!/usr/bin/env bash
# MIX-1276: mutanty przełącznika VITE_MM_AI_SECTION i położenia sekcji AI. Każdy mutant zmienia JEDEN
# plik, puszcza testy sekcji i przywraca dokładnie ten plik (git checkout -- <plik>).
# Uruchamiać na zatwierdzonym drzewie.
#   bash scripts/mutants-m1276.sh <katalog-wynikow>
# Wynik: <katalog>/mutanty.tsv (mutant, plik, rc testów, wynik). rc 0 = każdy mutant zabity.
set -u
OUT="${1:?katalog wynikow}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain -- components config data tests .github)" ]; then
  echo "ODMOWA: niezatwierdzone zmiany w components/, config/, data/, tests/ lub .github/" >&2
  exit 2
fi
TESTS=(tests/components/aiSection.test.tsx tests/scripts/ciWorkflow.test.ts)
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
M1-flaga-odwrocona|config/flags.ts|VITE_MM_AI_SECTION === '1'|VITE_MM_AI_SECTION !== '1'
M2-flaga-zawsze-wlaczona|config/flags.ts|import.meta.env.VITE_MM_AI_SECTION === '1'|true
M3-flaga-przyjmuje-true|config/flags.ts|VITE_MM_AI_SECTION === '1'|VITE_MM_AI_SECTION === '1' ? true : import.meta.env.VITE_MM_AI_SECTION === 'true'
M4-sekcja-bez-bramki|components/sections/AiSystemsTeaser.tsx|  if (!isAiSectionEnabled()) return null;\n|
M5-link-bez-bramki|components/features/web-development/AiSystemsContextLink.tsx|  if (!isAiSectionEnabled()) return null;\n|
M6-cta-zly-cel|components/sections/AiSystemsTeaser.tsx|to={AI_SECTION_PATH}|to="/web-development/custom-app/"
M7-sekcja-nad-hero|components/pages/Home.tsx|      <div ref={heroRef} className="hero-runway relative">|      <AiSystemsTeaser />\n      <div ref={heroRef} className="hero-runway relative">
M8-sekcja-ze-stanem|components/sections/AiSystemsTeaser.tsx|  if (!isAiSectionEnabled()) return null;|  React.useEffect(() => {}, []);\n  if (!isAiSectionEnabled()) return null;
M9-preview-tylko-prod|.github/workflows/ci.yml|VITE_MM_AI_SECTION: ${{ steps.target.outputs.target == 'preview'|VITE_MM_AI_SECTION: ${{ steps.target.outputs.target == 'prod'
M10-link-custom-app-usuniety|components/pages/CustomWebApp.tsx|      <AiSystemsContextLink />\n|
M11-link-custom-app-za-start|components/pages/CustomWebApp.tsx|      <AiSystemsContextLink />\n\n      <CustomAppStart />|      <CustomAppStart />\n\n      <AiSystemsContextLink />
M12-sekcja-usunieta-z-home|components/pages/Home.tsx|<AiSystemsTeaser />\n          <FinalBand|<FinalBand
EOF

echo "PRZEZYLO=$survivors" | tee -a "$OUT/mutanty.tsv"
[ "$survivors" -eq 0 ]
