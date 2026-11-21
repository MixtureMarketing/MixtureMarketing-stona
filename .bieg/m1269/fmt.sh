#!/usr/bin/env bash
# MIX-1269: co zmieniłby prettier projektu w dokumencie (diff na stdout).
set -u
npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1; echo "npm-ci rc=$?"
npx prettier --version
npx prettier docs/tresci/MIX-1269.md | diff docs/tresci/MIX-1269.md - ; echo "diff rc=$?"
