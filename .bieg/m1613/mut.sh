#!/usr/bin/env bash
# MIX-1613 r2: mutanty (po commicie). Kazdy: zmiana JEDNEGO pliku, celowane testy, przywrocenie TEGO pliku.
set -u
OUT=.bieg/r/m1613
mkdir -p "$OUT"
echo "legacy-peer-deps=true" > .npmrc
npm ci --no-audit --no-fund > "$OUT/mut-ci.log" 2>&1; echo "npm-ci rc=$?"
T="tests/services/articleListFallbackSort.test.ts tests/hooks/cmsSnapshotShape.test.tsx tests/scripts/ciWorkflow.test.ts tests/scripts/ciDeployGuard.test.ts tests/components/KnowledgeBaseSnapshot.test.tsx"
run() { # id plik opis sed-expr
  local id=$1 f=$2 desc=$3 expr=$4
  sed -i "$expr" "$f"
  if git diff --quiet -- "$f"; then echo "| $id | $desc | NIE ZASTOSOWANY |"; return; fi
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$id.log" 2>&1; rc=$?
  git diff --stat -- "$f" | tail -1 > "$OUT/mut-$id.diff"
  git checkout -- "$f"
  n=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$id.log" | grep -aE "Tests " | head -1)
  if [ $rc -ne 0 ] && grep -aq " failed" "$OUT/mut-$id.log"; then echo "| $id | $desc | zabity ($n) |"; else echo "| $id | $desc | PRZEZYL |"; fi
}
npx vitest run --maxWorkers=2 $T > "$OUT/mut-base.log" 2>&1; echo "baza rc=$? $(sed "s/\x1b\[[0-9;]*m//g" "$OUT/mut-base.log" | grep -aE "Tests " | head -1)"
S=hooks/cmsSnapshotSchema.ts
G=scripts/ci-deploy-guard.sh
Y=.github/workflows/ci.yml
run V1 $S "articleList.category wymagane -> opcjonalne" 's/category: req(text), \/\/ filtr kategorii/category: opt(text), \/\/ filtr kategorii/'
run V2 $S "articleList.tags wymagane -> opcjonalne" 's/tags: req(textList), \/\/ tags.slice/tags: opt(textList), \/\/ tags.slice/'
run V3 $S "caseStudyList.subcategory: dowolny typ" 's/subcategory: opt(textList)/subcategory: opt(() => true)/'
run V4 $S "industryList.forWho: dowolny typ" 's/forWho: opt(textOrNull)/forWho: opt(() => true)/'
run V5 $S "limit listy x20" 's/value.length > MAX_SNAPSHOT_LIST_ITEMS)/value.length > MAX_SNAPSHOT_LIST_ITEMS * 20)/'
run V6 $S "mainImage: format _ref nie sprawdzany" 's/SANITY_IMAGE_REF.test(v.asset._ref)/true/'
run V7 $S "lista: every -> some" 's/return value.every((item) => isRecord(item)/return value.some((item) => isRecord(item)/'
run V8 $S "dokument: kazda wartosc" 's/if (!schema) return isRecord(value);/if (!schema) return true;/'
run V9 $S "brak wymaganego pola przechodzi" 's/if (!present) return !rule.required;/if (!present) return true;/'
run V10 $S "textList: elementy nie sprawdzane" 's/v.every((x) => typeof x === .string.)/v.every(() => true)/'
run V11 $S "limit tablicy tekstow x20" 's/v.length <= MAX_SNAPSHOT_STRING_ARRAY/v.length <= MAX_SNAPSHOT_STRING_ARRAY * 20/'
run G1 $G "target: wielkosc liter nie sprawdzana" 's/if \[ "\$ref" != "\$want" \] \&\& \[ "\$(lower "\$ref")" = "\$want" \]; then/if false; then/'
run G2 $G "main-tip: SHA nie porownywany z koncem main" 's/\[ "\$sha" = "\$tip" \] || fail/true || fail/'
run G3 $G "main-tip: wzorzec zamiast dokladnego refs/heads/main" 's/\$2 == "refs\/heads\/main"/$2 ~ \/refs\\\/heads\\\/main\//'
run G4 $G "main-tip: format SHA biegu nie sprawdzany" 's/printf .%s. "\$sha" | grep -Eq .\^\[0-9a-f\]{40}\$. ||/true ||/'
run G5 $G "target: prod takze z workflow_dispatch" 's/if \[ "\$event" = "push" \] \&\& \[ "\$ref" = "refs\/heads\/main" \]; then/if [ "$ref" = "refs\/heads\/main" ]; then/'
run G6 $G "target: pusty ref przechodzi" 's/\[ -n "\$ref" \] || fail "puste GITHUB_REF"/true/'
run G7 $G "main-tip: blad ls-remote ignorowany" 's/ || fail "git ls-remote .\$remote. nie powiódł się: \$out"/ || true/'
run C1 $Y "ci.yml: strażnik powtorek zastapiony echo" 's/run: bash scripts\/ci-deploy-guard.sh main-tip/run: echo skip/'
run C3 $Y "ci.yml: TESTIMONIALS tylko na prod" "s/VITE_MM_TESTIMONIALS: \\\${{ steps.target.outputs.target == 'preview'/VITE_MM_TESTIMONIALS: \${{ steps.target.outputs.target == 'prod'/"
run C4 $Y "ci.yml: VIEW_TRANSITIONS usuniety z buildu" '/VITE_MM_VIEW_TRANSITIONS:/d'
run C5 $Y "ci.yml: deploy dev z warunkiem github.ref" "s/if: steps.target.outputs.target == 'preview'\$/if: github.ref == 'refs\/heads\/dev'/"
run C6 $Y "ci.yml: LIVE_PRICE_BAR wlaczony na stale" "s/VITE_MM_LIVE_PRICE_BAR: .*/VITE_MM_LIVE_PRICE_BAR: '1'/"
run C2 $Y "ci.yml: deploy main na target=preview" "/Deploy to Cloudflare Pages\$/,/uses:/ s/target == 'prod'/target == 'preview'/"
run A1 services/cms/articleService.ts "articleService: description bez excerpt nie zamieniany na pusty tekst" 's/description: art.excerpt ?? ..,/description: art.excerpt,/'
