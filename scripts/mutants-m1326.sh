#!/usr/bin/env bash
# Mutanty MIX-1326: commit, mutuje jeden plik, uruchamia testy, przywraca TEN plik (git checkout -- plik).
cd "$(dirname "$0")/.." || exit 9
mkdir -p .bieg/m1326
TESTS="tests/components/testimonialsView.test.tsx tests/components/testimonialsSlot.test.tsx tests/components/testimonialsPages.test.tsx tests/seo/testimonialsNoReviewSchema.test.tsx tests/services/testimonials.test.ts"
SLOT=components/sections/testimonials/TestimonialsSlot.tsx
VIEW=components/sections/testimonials/TestimonialsView.tsx
UT=utils/testimonials.ts
run() { # id plik perl-wyrazenie opis; bez argumentow skryptu: wszystkie, z argumentami: tylko wskazane id
  local id="$1" file="$2" expr="$3" desc="$4"
  if [ $# -gt 0 ] && [ -n "$ONLY" ] && [[ " $ONLY " != *" $id "* ]]; then return; fi
  perl -0pi -e "$expr" "$file"
  if git diff --quiet -- "$file"; then echo "MUT $id | $desc | NIE ZASTOSOWANY"; return; fi
  npx vitest run $TESTS --maxWorkers=2 > ".bieg/m1326/mut-$id.log" 2>&1
  local rc=$?
  local failed; failed=$(grep -aE "Tests +[0-9]" ".bieg/m1326/mut-$id.log" | head -1)
  if [ $rc -ne 0 ]; then echo "MUT $id | $desc | zabity | $failed"; else echo "MUT $id | $desc | PRZEZYL | $failed"; fi
  git checkout -- "$file"
}
ONLY="$*"
if [ -z "$ONLY" ] || [[ " $ONLY " == *" K "* ]]; then
  npx vitest run $TESTS --maxWorkers=2 > .bieg/m1326/mut-K.log 2>&1
  echo "KONTROLA (bez mutacji) rc=$? $(grep -aE "Tests +[0-9]" .bieg/m1326/mut-K.log | head -1)"
fi
run M1 components/sections/testimonials/testimonialsFlag.ts "s/raw === '1' \|\| raw === 'true'/raw !== '0'/" "flaga: domyslnie wlaczona (raw !== '0')"
run M2 $SLOT 's/if \(!isTestimonialsEnabled\(\)\) return null;//' "Slot: brak bramki przelacznika"
run M3 $UT "s/url\.protocol === 'https:'/url.protocol !== 'data:'/" "safeReviewUrl: przepuszcza javascript:/http:"
run M4 $VIEW 's/rel="noopener noreferrer"/rel="noreferrer"/' "link: brak rel noopener"
run M5 $UT 's/if \(out\.length === MAX_TESTIMONIALS\) break;//' "normalize: bez limitu 5"
run M6 components/pages/Home.tsx 's/<TestimonialsSlot \/>//' "Home: bez TestimonialsSlot"
run M7 $VIEW 's/<figure className=/<figure itemProp="review" className=/' "widok: mikrodane review w DOM"
run M8 services/cms/testimonialService.ts 's/ && consentConfirmed == true//' "GROQ: bez filtra zgody klienta"
run M9 $VIEW 's/alt=\{`Logo firmy \$\{t\.companyName\}`\}/alt=""/' "logo: pusty alt"
run M10 $SLOT 's/(const Testimonials = lazy)/void import(".\/Testimonials");\n$1/' "Slot: moduł sekcji ładowany zawsze"
run M11 $VIEW 's/<h2(\s)/<h3$1/; s/<\/h2>/<\/h3>/' "widok: nagłówek h3 zamiast h2"
run M12 components/pages/PortfolioPage.tsx 's/<TestimonialsSlot \/>//' "Portfolio: bez TestimonialsSlot"
run M13 $VIEW 's/const shown = items\.slice\(0, MAX_TESTIMONIALS\);/const shown = items;/' "widok: bez limitu 5"
echo KONIEC-MUTANTOW
git status --short
