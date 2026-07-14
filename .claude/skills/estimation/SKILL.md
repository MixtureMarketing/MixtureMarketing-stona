---
name: estimation
description: >
  ALWAYS use this skill when working on the estimation module (system wycen):
  any file under components/portal/admin/estimation/, functions/api/admin/estimation/,
  lib/estimation/, migrations/*estimation*, migrations/seed/, or any task mentioning
  wycena/wyceny, quote, pricing engine, obszary, poziomy, reguły, archetypes, Confidence,
  Karta decyzji. This skill contains the module's non-negotiable invariants — skipping it
  causes subtle correctness bugs (broken snapshots, UI/server calculation drift).
---

# Estimation module (System Wycen) — working knowledge

Deterministic expert system: business answers → rules → per-area technical decisions
(levels 0–4) → hours → price. **Decision support first, pricing second.** Lives inside the
existing admin panel. Full specification: `docs/estimation/` (map at the end of this file —
read the specific doc before implementing its domain; do NOT guess).

## Invariants (violating any of these = bug, no exceptions)

1. **Determinism.** Same answers ⇒ same result. No AI, no randomness, no time-dependent logic
   in the engine. Every suggested level carries a human-readable reason.
2. **Knowledge = data.** Areas, levels, hour ranges, questions, rules, modules, integrations,
   multipliers, params live in D1 (`est_*` tables) and are edited via the panel. Code only
   interprets. Never hardcode domain values in TS.
3. **Snapshot-first.** `quote_finalize` copies every value the quote uses (level hours, item
   hours, multipliers, rates, params) into the quote rows. Library edits must NEVER change a
   finalized quote. Quote-layer tables reference library by `code` strings, not FKs.
4. **One engine, two runtimes.** `lib/estimation/engine.ts` is pure TS (no React, no DOM, no
   D1 imports — data passed in). UI uses it for live preview; the Pages Function recomputes
   authoritatively at finalize and stores `totals_json` + `engine_version`. Any change to
   computation order or formulas ⇒ bump `engine_version`.
5. **Computation order is fixed:** area base hours → additive items (modules/integrations) →
   multipliers (additive sum, capped by `multiplier_cap`) → buffer → price per category →
   narrowed offer range → cost items separately (no multipliers/buffer on costs).
6. **Composition rule (D4):** area levels price the FOUNDATION only. Integrations are always
   additive library items; the `apis` area prices own-API work only and never scales with
   integration count. Module `includes/excludes` text resolves boundary disputes.
7. **Level 0 exists for every area** (0 h, "not applicable"). Rules only RAISE levels
   (`min_level` = max(current, rule)); humans may lower with a mandatory `override_reason`.
8. **Unknown answers** ("nie wiem") satisfy no rule condition except `unknown`, and feed the
   Confidence score. They never block the flow.
9. **Business-language questions only.** Every `est_questions` entry must be answerable by a
   business owner with no IT department (or answered "nie wiem"). Technical decisions are
   derived by rules, never asked of the user. Internal-only technical questions must be
   flagged "(wewnętrzne)". The platform (archetype) is RECOMMENDED by `recommend_archetype`
   rules after a tech-neutral question block; the user's choice is final and stored as
   recommended-vs-chosen with a reason when they differ.

## Data model quick map (full DDL: docs/estimation/02)

Library: `est_aspects` (31 areas, categories A–G) · `est_levels` (0–4 + hours) ·
`est_archetypes` + `est_archetype_defaults` (default levels, `is_locked` hides area) ·
`est_questions` (business language, `visible_if_json`, `allow_unknown`) · `est_rules`
(`condition_json`, `actions_json`, `reason_template`) · `est_modules` · `est_integrations` ·
`est_multipliers` · `est_cost_item_types` · `est_params` · `est_category_rates`.

Quotes (snapshot layer): `est_quotes` (status draft→review→sent→won|lost, won→closed;
`totals_json`, `params_json`, `engine_version`) · `est_quote_answers` · `est_quote_aspects`
(suggested vs chosen level, snapshot hours, override + reason, `rule_reasons_json`) ·
`est_quote_items` (module|integration|cost) · `est_quote_multipliers` · `est_actual_hours`.

## Rules engine essentials (full spec: docs/estimation/05)

Condition tree: `{ all: [...] } | { any: [...] } | { q, op, val }`;
ops: `eq neq gt gte lt lte in contains answered unknown`.
Actions: `min_level | multiplier | suggest_module | suggest_integration | cost_item`.
Evaluation: archetype defaults → all active rules (priority DESC, id ASC — stable) →
`min_level` is monotonic max → suggestions are pre-checked but user-removable.
Invalid rule (bad aspect code) ⇒ log + skip, never crash a quote.

## Repo integration (full details: docs/estimation/01)

- UI: new lazy tab in `components/portal/AdminDashboard.tsx` → module under
  `components/portal/admin/estimation/`. Deep links via `?tab=wyceny&quote=ID`
  (NOT new react-router routes; `/portal/*` SPA fallback added in `_redirects`).
- API: `functions/api/admin/estimation/*` — existing `functions/api/admin/_middleware.ts`
  authorizes (admin role). Do not add new auth.
- DB: migrations `0003+`, seeds in `migrations/seed/*.sql` (idempotent; versioned knowledge).
- PDF: client-side jspdf (lazy chunk), copy to R2 via endpoint (pattern:
  `functions/api/calculator-submit.ts`).
- Respect repo constraints from root CLAUDE.md: size-limit (everything lazy), ESLint
  `--max-warnings 0`, Vitest, no new TS errors (41-error legacy baseline must not grow),
  strip nothing from existing functionality. Do not modify existing functions except
  `_redirects` and the AdminDashboard tab registration.

## Testing requirements

Engine: Vitest unit tests are mandatory for every engine change — operators incl. `unknown`,
min_level monotonicity, cap reached, buffer, offer-range math (`Oferta_min ≥ P_min` etc.),
level 0, empty quote rejected, override min>max rejected, cost items excluded from
multipliers. Snapshot test: edit library after finalize ⇒ quote totals unchanged.
UI/server parity test: same answers through both paths ⇒ identical totals.

## Workflow

Phases F0–F3 with acceptance criteria: `docs/estimation/07`. Definition of done for any
task = the phase's checklist items it covers + `npm run build:full` green. Work on
`feat/estimation-fN` branches; preview deployments + preview D1 for testing; merge to
`main` only when phase criteria pass. Session prompts: `docs/estimation/PROMPTS.md`.

## Doc map (read before implementing that domain)

| Topic | File |
|---|---|
| Decisions register D1–D20, glossary | docs/estimation/00-przeglad.md |
| Repo integration, file placement, params | docs/estimation/01-architektura.md |
| Full DDL, consistency rules, seeds | docs/estimation/02-model-danych.md |
| Formulas, Confidence, calibration (MPE) | docs/estimation/03-model-obliczeniowy.md |
| 31 areas, level tables, boundaries | docs/estimation/04-katalog-obszarow.md |
| Questions, rule format, starter rules, archetype defaults | docs/estimation/05-silnik-regul.md |
| Integrations/modules library seed content | docs/estimation/06-biblioteka-startowa.md |
| Phases, steps, acceptance criteria, risks | docs/estimation/07-plan-wdrozenia.md |
