#!/usr/bin/env bash
# Mutants for MIX-1272, one file at a time, restored with git checkout -- <file>.
set -u
OUT=.bieg/r/mix1272
T="tests/seo/aiSystemsPage.test.tsx tests/routes.test.ts"
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
mut M1 routes.js "s#^  '/web-development/systemy-ai-aplikacje/',#  // removed#"
mut M2 routes.js "s#^  '/offers/',#  '/offers/',\n  '/web-development/systemy-ai-aplikacje/',#"
mut M3 components/pages/AiSystemsApps.tsx "0,/^        noindex\$/{/^        noindex\$/d}"
mut M4 data/content/services/web-development/ai-systems.ts "0,/clientName: null/s/clientName: null/clientName: 'AI Q-PLAST'/"
mut M5 components/pages/AiSystemsApps.tsx "0,/^        noindex\$/s//        noindex\n        faq={CONTENT.faqs.map((f) => ({ question: f.q, answer: f.a }))}/"
mut M10 components/pages/AiSystemsApps.tsx "/<FaqSection title=/d"
mut M6 data/content/services/web-development/ai-systems.ts "s#to: '/wycena/'#to: '/wycena'#"
mut M7 components/pages/CustomWebApp.tsx "\$a // systemy-ai-aplikacje"
mut M8 config/routes.tsx "/path: '\/web-development\/systemy-ai-aplikacje'/d"
mut M9 components/pages/AiSystemsApps.tsx "s#{ name: 'Systemy AI i aplikacje', item: AI_SYSTEMS_PATH }#{ name: 'Systemy AI i aplikacje', item: '/web-development/' }#"
cat "$OUT/mutants.txt" >> "$OUT/summary.txt"
