#!/usr/bin/env bash
# Wrapper e2e leady → Linear: eksportuje dane Access i sekret ponowień z plików konfiguracji
# (bez wypisywania) i uruchamia skrypt. Uruchamiać z katalogu repo (ścieżki względne).
# Brak pliku = zmienna pusta; skrypt odmówi (fail-closed) z komunikatem o braku danych.
set -u
set +x
export PATH="$HOME/bin:$PATH"
KONF="${LSYS_KONF:-$HOME/.config/lsys}"
wczytaj() { # plik -> stdout bez końcowego newline; brak pliku = pusty
  [ -r "$1" ] && tr -d '\r\n' < "$1" || true
}
CF_ACCESS_CLIENT_ID="$(wczytaj "$KONF/cf-access-preview-id")"
CF_ACCESS_CLIENT_SECRET="$(wczytaj "$KONF/cf-access-preview-secret")"
E2E_PONOW_SECRET="$(wczytaj "$KONF/leady-ponow-sekret-preview")"
export CF_ACCESS_CLIENT_ID CF_ACCESS_CLIENT_SECRET E2E_PONOW_SECRET
exec node scripts/test-e2e-linear-lead.mjs "$@"
