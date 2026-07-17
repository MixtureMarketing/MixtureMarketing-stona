# Seedy modułu wycen (biblioteka wiedzy)

Wersjonowana baza wiedzy modułu wycen (`est_*`). Wszystkie seedy są **idempotentne**
(`ON CONFLICT DO UPDATE` / jawne id) — bezpieczne do wielokrotnego uruchomienia.

## Kolejność aplikowania (zależności FK)

`levels` i `archetypes` zależą od `aspects` (rozwiązują `aspect_id` po `code`), więc:

```
1. aspects.sql          # 31 obszarów (fundament — MUSI być pierwszy)
2. levels.sql           # 155 poziomów (0–4), zależy od aspects
3. archetypes.sql       # 8 archetypów + 144 domyślne poziomy, zależy od aspects
4. questions.sql        # 41 pytań biznesowych
5. rules.sql            # 58 reguł (w tym recommend_archetype / archetype_warning z F1)
6. modules.sql          # 32 moduły
7. integrations.sql     # 37 integracji (taryfy platform/custom)
8. multipliers.sql      # 4 mnożniki (stałe D6)
9. cost_item_types.sql  # 7 typów pozycji kosztowych
10. params.sql          # 11 parametrów globalnych
```

Liczby zweryfikowane `COUNT(*)` na świeżej bazie (migracje 0001–0007 + seedy ×2, idempotentne).

## Uruchomienie (lokalnie, Miniflare)

```bash
# najpierw migracja schematu
npx wrangler d1 migrations apply DB --local --config wrangler.d1.toml
# potem seedy w kolejności powyżej
for f in aspects levels archetypes questions rules modules integrations multipliers cost_item_types params; do
  npx wrangler d1 execute DB --local --config wrangler.d1.toml --file="migrations/seed/$f.sql"
done
```

## Status treści (do korekty Jakuba — inwariant 2: wiedza = dane)

- **DRAFT**: reguły v1 (progi), `unknown_weight` pytań, taryfy `custom` integracji (×2),
  górne granice poziomu 4 („X+" → `hours_max = 1.5 × hours_min`), `travel.unit_price` (1,15 zł/km).
- **F1 — zrobione**: reguły `recommend_archetype` / `archetype_warning` (krok „Platforma") są w seedzie.
- **Treści klienckie (0007, f2c)**: `est_aspects.client_name` i `est_levels.client_description` są
  puste (NULL) → dokumenty klienckie używają na razie nazw/opisów wewnętrznych (fallback). Do
  uzupełnienia w panelu (zakładka Wyceny → Biblioteka) przy przeglądzie seedów — np. polskie nazwy
  obszarów zamiast wewnętrznych („Observability" → „Monitoring i niezawodność").
