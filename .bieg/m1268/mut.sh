#!/usr/bin/env bash
# MIX-1268: mutanty (po commicie, w kopii biegu). Kazdy: zmiana JEDNEGO pliku, celowane testy,
# przywrocenie TEGO pliku (git checkout -- plik). Sciezki wzgledne.
set -u
OUT=.bieg/r/m1268
mkdir -p "$OUT"
echo "legacy-peer-deps=true" > .npmrc
[ -d node_modules ] || { npm ci --no-audit --no-fund > "$OUT/mut-ci.log" 2>&1; echo "npm-ci rc=$?"; }
T="tests/utils/related.test.ts tests/components/Powiazane.test.tsx tests/components/powiazaneTemplates.test.tsx tests/hooks/cmsSnapshotShape.test.tsx"
run() { # id plik opis sed-expr
  local id=$1 f=$2 desc=$3 expr=$4
  sed -i "$expr" "$f"
  if git diff --quiet -- "$f"; then echo "| $id | $desc | NIE ZASTOSOWANY |"; return; fi
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$id.log" 2>&1; rc=$?
  git checkout -- "$f"
  n=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$id.log" | grep -aE "Tests " | head -1)
  if [ $rc -ne 0 ] && grep -aq " failed" "$OUT/mut-$id.log"; then echo "| $id | $desc | zabity ($n) |"; else echo "| $id | $desc | PRZEZYL |"; fi
}
npx vitest run --maxWorkers=2 $T > "$OUT/mut-base.log" 2>&1; echo "baza rc=$? $(sed "s/\x1b\[[0-9;]*m//g" "$OUT/mut-base.log" | grep -aE "Tests " | head -1)"
R=utils/related.ts
run M1 $R "link do siebie: bieżący nie w zbiorze seen" 's/const seen = new Set<string>(\[`${self._type}|${self.slug}`\]);/const seen = new Set<string>();/'
run M2 $R "brak dopasowania przechodzi (score >= 0)" 's/.filter((s) => s.score > 0)/.filter((s) => s.score >= 0)/'
run M3 $R "limit bez górnej granicy 4" 's/Math.min(RELATED_LIMIT, Math.floor(limit))/Math.floor(limit)/'
run M4 $R "slug bez allowlisty" 's/  isSafeSlug(item.slug) \&\&/  typeof item.slug === "string" \&\&/'
run M5 $R "pusty tytuł przechodzi" "s/  item.title.trim() !== '' \&\&/  true \&\&/"
run M6 $R "remis: bez porządku cyklicznego" 's/(slug > current.slug ? 0 : 1)/(slug > current.slug ? 0 : 0)/'
run M7 $R "ten sam rodzaj bez limitu (max - 1)" 's/...same.slice(0, max - 1),/...same.slice(0, max),/'
P=components/common/Powiazane.tsx
run M8 $P "pusta lista renderuje sekcję" 's/if (items.length === 0) return null;/if (items.length < 0) return null;/'
run M9 $P "blok bez limitu w widoku" 's/links.slice(0, RELATED_LIMIT)/links.slice(0)/'
S=hooks/cmsSnapshotSchema.ts
run M10 $S "zrzut: slug bez allowlisty" 's/slug: req(isSafeSlug), \/\/ adres/slug: req(text), \/\/ adres/'
F=config/flags.ts
run M11 $F "przełącznik: każda niepusta wartość" "s/import.meta.env.VITE_MM_POWIAZANE === '1'/!!import.meta.env.VITE_MM_POWIAZANE/"
V=services/cms/relatedService.ts
run M12 $V "błąd CMS = pusta lista (do zrzutu)" 's/throw new CmsUnavailableError(`getRelatedFor: ${key}`, error);/return [];/'
run M13 $V "makiety nie odfiltrowane" 's/if (type === .caseStudy. \&\& !hasRealScreenshot(row.slug)) return null;//'
