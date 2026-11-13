#!/usr/bin/env bash
# MIX-1441: pomiar na prawdziwej sondzie (e2e-ga4-key-events) po `vite build`: zajęty port, zwykły
# bieg (0 procesów po biegu, port wolny), pusty port. Ścieżki względne do repo.
set -u
OUT="${1:-.bieg/m1441}"
PORT=4279
mkdir -p "$OUT"
npx vite build > "$OUT/build.log" 2>&1
echo "build rc $?"
node -e "require('http').createServer((q,r)=>r.end('foreign')).listen($PORT,'127.0.0.1')" &
FP=$!
echo "przed biegiem: $(pgrep -fc "bin/vite preview") procesow vite preview"
sleep 1
node scripts/e2e-ga4-key-events.mjs "$PORT" > "$OUT/real-busy.log" 2>&1
echo "port zajety: rc $?"
grep -v "^$" "$OUT/real-busy.log" | tail -n 3 | cut -c1-200
kill "$FP"
sleep 1
node scripts/e2e-ga4-key-events.mjs "$PORT" > "$OUT/real-run.log" 2>&1
echo "zwykly bieg: rc $?"
grep -v "^$" "$OUT/real-run.log" | tail -n 4 | cut -c1-200
sleep 1
echo "procesy vite preview po biegu: $(pgrep -fc "bin/vite preview")"; pgrep -af "bin/vite preview" | cut -c1-120
node -e "require('net').connect($PORT,'127.0.0.1').on('connect',()=>{console.log('port po biegu: ZAJETY');process.exit(0)}).on('error',()=>{console.log('port po biegu: wolny');process.exit(0)})"
node scripts/e2e-ga4-key-events.mjs "" > "$OUT/real-empty.log" 2>&1
echo "pusty port: rc $?"
grep -v "^$" "$OUT/real-empty.log" | tail -n 2 | cut -c1-200
