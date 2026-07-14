# Seedy modułu wycen (biblioteka wiedzy)

Wersjonowana baza wiedzy modułu wycen (`est_*`). Wszystkie seedy są **idempotentne**
(`ON CONFLICT DO UPDATE` / jawne id) — bezpieczne do wielokrotnego uruchomienia.

## Kolejność aplikowania (zależności FK)

`levels` i `archetypes` zależą od `aspects` (rozwiązują `aspect_id` po `code`), więc:

```
1. aspects.sql          # 31 obszarów (fundament — MUSI być pierwszy)
2. levels.sql           # 155 poziomów (0–4), zależy od aspects
3. archetypes.sql       # 8 archetypów + 104 domyślne poziomy, zależy od aspects
4. questions.sql        # 40 pytań biznesowych
5. rules.sql            # 34 reguły (draft v1)
6. modules.sql          # 27 modułów
7. integrations.sql     # 37 integracji (taryfy platform/custom)
8. multipliers.sql      # 4 mnożniki (stałe D6)
9. cost_item_types.sql  # 7 typów pozycji kosztowych
10. params.sql          # 8 parametrów globalnych
```

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
  górne granice poziomu 4 („X+" → `hours_max = hours_min`), `travel.unit_price` (1,15 zł/km).
- **Odłożone do F1**: reguły `recommend_archetype` / `archetype_warning` (krok „Platforma").
