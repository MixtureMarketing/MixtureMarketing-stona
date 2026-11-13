#!/usr/bin/env bash
# MIX-1613: mutanty (po commicie). Kazdy: zmiana jednego pliku, celowane testy, przywrocenie TEGO pliku.
set -u
OUT=.bieg/r/m1613
mkdir -p "$OUT"
T="tests/hooks/cmsSnapshotShape.test.tsx tests/services/articleListFallbackSort.test.ts tests/scripts/ciWorkflow.test.ts tests/components/KnowledgeBaseSnapshot.test.tsx"
run() { # id plik opis sed-expr
  local id=$1 f=$2 desc=$3 expr=$4
  sed -i "$expr" "$f"
  if git diff --quiet -- "$f"; then echo "| $id | $desc | NIE ZASTOSOWANY |"; return; fi
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$id.log" 2>&1; rc=$?
  git checkout -- "$f"
  n=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$id.log" | grep -aE "Tests " | head -1)
  if [ $rc -ne 0 ]; then echo "| $id | $desc | zabity ($n) |"; else echo "| $id | $desc | PRZEZYL |"; fi
}
H=hooks/useCmsDocument.ts
A=services/cms/articleService.ts
run M1 $H "readCmsSnapshot: bez walidacji ksztaltu" 's/return value !== undefined \&\& isValidSnapshotEntry(id, value) ? (value as T) : undefined;/return value as T | undefined;/'
run M2 $H "lista: every -> some (zla pozycja przechodzi)" 's/value.every((item) => isRecord(item)/value.some((item) => isRecord(item)/'
run M3 $H "lista: tablica nie wymagana (obiekt przechodzi)" 's/Array.isArray(value) \&\&$/true \&\&/'
run M4 $H "dokument: lista przechodzi jako dokument" 's/if (!fields) return isRecord(value);/if (!fields) return value !== null \&\& value !== undefined;/'
run M5 $A "awaria CMS: rejestr bez sortowania" 's/return newestFirst(LEGACY_ARTICLES);/return LEGACY_ARTICLES;/'
run M6 $A "awaria CMS: sortowanie rosnaco" 's/new Date(b.date).getTime() - new Date(a.date).getTime()/new Date(a.date).getTime() - new Date(b.date).getTime()/'
run M7 .github/workflows/ci.yml "CI: main wdraza tez z workflow_dispatch" "s/if: github.event_name == 'push' \&\& github.ref == 'refs\/heads\/main'/if: (github.event_name == 'push' || github.event_name == 'workflow_dispatch') \&\& github.ref == 'refs\/heads\/main'/"
run M8 .github/workflows/ci.yml "CI: dev wdraza tez z pull_request" "s/github.event_name == 'workflow_dispatch') \&\& github.ref == 'refs\/heads\/dev'/github.event_name == 'pull_request') \&\& github.ref == 'refs\/heads\/dev'/"
