#!/usr/bin/env bash
# MIX-1722 r2: what prettier would still change in the touched files (diff printed, tree not committed).
set -u
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1
F="components/features/portfolio/PortfolioGrid.tsx tests/components/portfolioImageProportions.test.tsx tests/hooks/cmsSnapshotShape.test.tsx"
npx prettier --write $F > /dev/null 2>&1
git diff -- $F | cut -c1-200
npx eslint $F --max-warnings 0 2>&1 | cut -c1-200 | head -20
echo "### end"
