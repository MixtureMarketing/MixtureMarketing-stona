#!/usr/bin/env bash
# MIX-1317 mutanty (wzór .bieg/m1269/mut.sh): każdy mutant zmienia jedno miejsce kodu/CSS/ci.yml,
# uruchamia testy karty (tests/process/processTimeline.test.tsx, tests/scripts/ciWorkflow.test.ts)
# i ma dać czerwień.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1317/mut
mkdir -p "$OUT"
T="tests/process/processTimeline.test.tsx tests/scripts/ciWorkflow.test.ts"
rep() { FROM="$2" TO="$3" node -e '
const fs=require("fs");const f=process.argv[1];let s=fs.readFileSync(f,"utf8");
const from=process.env.FROM; const i=s.indexOf(from);
if(i<0||s.indexOf(from,i+1)>=0)process.exit(3);
s=s.slice(0,i)+process.env.TO+s.slice(i+from.length);fs.writeFileSync(f,s)' "$1"; }
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
npx vitest run $T > "$OUT/base.log" 2>&1; brc=$?
echo "BASELINE rc=$brc $(clean "$OUT/base.log" | grep -aE '^ *Tests ')"
[ "$brc" -ne 0 ] && { echo "MUT ABORT: baseline red"; exit 1; }
K=0; S=0; N=0
mut() { local id=$1 f=$2 from=$3 to=$4 opis=$5
  rep "$f" "$from" "$to" || { echo "MUT $id NOMATCH ($opis)"; N=$((N+1)); git checkout -- "$f"; return; }
  local ns; ns=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  # shellcheck disable=SC2086
  npx vitest run $T > "$OUT/$id.log" 2>&1; local rc=$?
  local fl; fl=$(clean "$OUT/$id.log" | grep -aE '^ *Tests ' | head -1)
  git checkout -- "$f"
  if [ $rc -ne 0 ]; then K=$((K+1)); echo "MUT $id KILLED rc=$rc diff=$ns $fl ($opis)"; else S=$((S+1)); echo "MUT $id SURVIVED rc=$rc diff=$ns $fl ($opis)"; fi
}
FL=config/flags.ts; PT=components/common/ProcessTimeline.tsx; CSS=index.css; CI=.github/workflows/ci.yml
GA=components/pages/GoogleAds.tsx; SR=components/pages/SeoRzeszow.tsx; BP=components/features/design/BrandProcess.tsx
CA=components/features/web-development/CustomAppStart.tsx
mut M1 $FL "import.meta.env.VITE_MM_PROCESS_TIMELINE === '1'" "import.meta.env.VITE_MM_PROCESS_TIMELINE !== undefined" "przełącznik: każda zdefiniowana wartość"
mut M2 $GA "{isProcessTimelineEnabled() ? (" "{true ? (" "Google Ads: K1 zawsze, także wyłączony"
mut M3 $PT '<span className="mm-k1-nr" aria-hidden="true">' '<span className="mm-k1-nr">' "numer kroku czytany przez czytnik"
mut M4 $PT "{i + 1}" "{i}" "numeracja od 0"
mut M5 $CSS "  @media (prefers-reduced-motion: no-preference) {
    .mm-k1 {" "  @media all {
    .mm-k1 {" "animacje mimo „ogranicz ruch”"
mut M6 $CSS "animation: mm-k1-tekst linear both;" "animation: mm-k1-tekst linear;" "bez fill both: po przewinięciu kroki wracają do 0,2"
mut M7 $CSS "@media (min-width: 1280px) {
  .mm-k1::before," "@media (min-width: 99999px) {
  .mm-k1::before," "komputer bez rzędu na całą szerokość"
mut M8 $CI "VITE_MM_PROCESS_TIMELINE: \${{ steps.target.outputs.target == 'preview' && '1' || '' }}" "VITE_MM_PROCESS_TIMELINE: '1'" "przełącznik włączony na produkcji"
mut M9 $BP "            desc: s.desc," "            desc: s.title," "branding: zły opis kroku"
mut M10 $SR "<ProcessTimeline items={SEO_PROCESS_STEPS} />" "<ProcessTimeline items={SEO_PROCESS_STEPS.slice(0, 5)} />" "SEO Rzeszów: zgubiony krok"
mut M11 $CSS "@keyframes mm-k1-tekst-y {
  from {
    opacity: 0.2;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;" "@keyframes mm-k1-tekst-y {
  from {
    opacity: 0.2;
    transform: translateY(1rem);
  }
  to {
    opacity: 0.9;" "stan końcowy kroków na komputerze 0,9"
mut M12 $CA "on ? undefined : { transform:" "{ transform:" "custom-app: przesunięcie z --p (JS) przy K1"
mut M13 $CSS "@keyframes mm-k1-linia {
  from {
    transform: scaleY(0);" "@keyframes mm-k1-linia {
  from {
    height: 0;
    transform: scaleY(0);" "animacja właściwości układu (CLS)"
mut M14 $BP "overflow={!k1}" "overflow={true}" "branding: overflow-hidden zatrzymuje oś view()"
echo "MUT SUMA zabite=$K przezyte=$S nomatch=$N"
[ "$S" -eq 0 ] && [ "$N" -eq 0 ]
