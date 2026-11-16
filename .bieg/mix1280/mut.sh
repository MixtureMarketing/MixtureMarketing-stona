#!/usr/bin/env bash
# Mutants for MIX-1280, one file at a time, restored with git checkout -- <file>.
set -u
OUT=.bieg/r/mix1280
T="tests/seo/aiSystemsArticle.test.tsx tests/routes.test.ts"
mut() { # id file sed-expr
  local id=$1 f=$2 expr=$3
  sed -i "$expr" "$f"
  if git diff --quiet -- "$f"; then echo "$id NOOP (sed changed nothing)" | tee -a "$OUT/mutants.txt"; return; fi
  npx vitest run --maxWorkers=2 $T > "$OUT/mut-$id.log" 2>&1; local rc=$?
  local first; first=$(grep -m1 -E "FAIL|AssertionError" "$OUT/mut-$id.log" | cut -c1-110)
  echo "$id | $f | rc=$rc | ${first}" | tee -a "$OUT/mutants.txt"
  git checkout -- "$f"
}
mkdir -p "$OUT"; git checkout -- public/sitemap.xml 2>/dev/null; : > "$OUT/mutants.txt"
mut M1 routes.js "s#^  '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/',#  // removed#"
mut M2 routes.js "s#^  '/offers/',#  '/offers/',\n  '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/',#"
mut M3 components/articles/AiSystemsArticle.tsx "/^    noindex\$/d"
mut M4 components/articles/ArticleShell.tsx "s/noindex = false,/noindex = true,/"
mut M5 components/articles/ArticleShell.tsx "/noindex={noindex}/d"
mut M6 data/content/articles/ai-systems.ts "s/Pierwszy przykład to zakład/Pierwszy przykład to AI Q-PLAST, zakład/"
mut M7 data/content/articles/ai-systems.ts "s#to: '/wycena/'#to: '/wycena'#"
mut M8 components/articles/AiSystemsArticle.tsx "/<StandardFaq/d"
mut M9 components/articles/AiSystemsArticle.tsx "/publishedDate={AI_ARTICLE_PUBLISHED}/d"
mut M10 config/routes.tsx "/path: '\/baza-wiedzy\/aplikacje-dedykowane-z-ai-kiedy-warto'/d"
mut M11 components/pages/CustomWebApp.tsx "\$a // aplikacje-dedykowane-z-ai"
mut M12 data/content/articles/ai-systems.ts "s#href=\"/web-development/systemy-ai-aplikacje/\"#href=\"/web-development/systemy-ai-aplikacje\"#"
cat "$OUT/mutants.txt" >> "$OUT/summary.txt"
