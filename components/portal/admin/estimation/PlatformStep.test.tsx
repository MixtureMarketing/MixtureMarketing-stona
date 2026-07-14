import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PlatformStep from './PlatformStep';
import type { EstimationLibrary } from './useEstimationLibrary';

// REALNE reguły recommend (kopiowane 1:1 z migrations/seed/rules.sql, id 35–40) — nie mock.
// Cel: test wykrywa martwą integrację silnik↔UI, której nie złapały testy jednostkowe/E2E.
const RULES = [
  {
    id: 35,
    name: 'Woo',
    condition_json:
      '{"all":[{"q":"project_goal","op":"eq","val":"sklep"},{"q":"products_count","op":"lt","val":2000},{"q":"custom_logic","op":"eq","val":false}]}',
    actions_json:
      '[{"type":"recommend_archetype","code":"woocommerce","reason":"Standardowy sklep"}]',
    reason_template: 'x',
    priority: 0,
  },
  {
    id: 37,
    name: 'Sylius',
    condition_json:
      '{"all":[{"q":"project_goal","op":"eq","val":"sklep"},{"any":[{"q":"products_count","op":"gte","val":10000},{"q":"product_variants","op":"eq","val":"masowe"}]},{"any":[{"q":"payments","op":"contains","val":"payu"},{"q":"shipping","op":"contains","val":"inpost"}]}]}',
    actions_json: '[{"type":"recommend_archetype","code":"sylius","reason":"Duza skala"}]',
    reason_template: 'x',
    priority: 0,
  },
  {
    id: 38,
    name: 'Medusa',
    condition_json:
      '{"all":[{"q":"project_goal","op":"eq","val":"sklep"},{"q":"frontend_headless","op":"eq","val":true},{"q":"custom_logic","op":"eq","val":true}]}',
    actions_json: '[{"type":"recommend_archetype","code":"medusa","reason":"Headless-first"}]',
    reason_template: 'x',
    priority: 0,
  },
];

const Q = (
  over: Partial<EstimationLibrary['questions'][0]>,
): EstimationLibrary['questions'][0] => ({
  code: '',
  text: '',
  help_text: null,
  answer_type: 'text',
  options_json: null,
  allow_unknown: 1,
  visibility: 'internal',
  unknown_weight: 1,
  visible_if_json: null,
  question_group: 'platforma',
  sort_order: 0,
  ...over,
});

const LIBRARY: EstimationLibrary = {
  aspects: [{ code: 'frontend', name: 'F', category: 'A', description: null }],
  levels: [],
  archetypes: [
    { code: 'woocommerce', name: 'WooCommerce', description: null, integration_mode: 'platform' },
    { code: 'sylius', name: 'Sylius', description: null, integration_mode: 'platform' },
    { code: 'medusa', name: 'Medusa', description: null, integration_mode: 'custom' },
  ],
  archetypeDefaults: [],
  questions: [
    Q({
      code: 'project_goal',
      text: 'Co ma robic projekt?',
      answer_type: 'select',
      options_json: '[{"value":"sklep","label":"Sklep"},{"value":"wizytowka","label":"Wizytowka"}]',
      sort_order: 20,
    }),
    Q({ code: 'products_count', text: 'Ile produktow?', answer_type: 'number', sort_order: 30 }),
    Q({
      code: 'product_variants',
      text: 'Warianty?',
      answer_type: 'select',
      options_json:
        '[{"value":"brak","label":"Brak"},{"value":"proste","label":"Proste"},{"value":"masowe","label":"Masowe"}]',
      sort_order: 40,
    }),
    Q({
      code: 'payments',
      text: 'Platnosci?',
      answer_type: 'multiselect',
      options_json: '[{"value":"payu","label":"PayU"}]',
      sort_order: 50,
    }),
    Q({
      code: 'shipping',
      text: 'Wysylka?',
      answer_type: 'multiselect',
      options_json: '[{"value":"inpost","label":"InPost"}]',
      sort_order: 60,
    }),
    Q({ code: 'custom_logic', text: 'Nietypowa logika?', answer_type: 'bool', sort_order: 70 }),
    Q({
      code: 'frontend_headless',
      text: 'Nowoczesny front?',
      answer_type: 'bool',
      sort_order: 80,
    }),
  ],
  rules: RULES,
  params: [],
};

function answerBool(questionText: string, label: 'Tak' | 'Nie') {
  const container = screen.getByText(questionText).closest('div')!.parentElement!;
  fireEvent.click(within(container).getByText(label));
}

describe('PlatformStep — rekomendacja (integracja silnik↔UI z realnymi regułami)', () => {
  it('scenariusz Woo: sklep + 500 + custom NIE + headless NIE → pokazuje WooCommerce, NIE Medusę', () => {
    render(<PlatformStep library={LIBRARY} onConfirm={() => {}} />);

    fireEvent.change(
      screen
        .getByText('Co ma robic projekt?')
        .closest('div')!
        .parentElement!.querySelector('select')!,
      {
        target: { value: 'sklep' },
      },
    );
    fireEvent.change(
      screen.getByText('Ile produktow?').closest('div')!.parentElement!.querySelector('input')!,
      {
        target: { value: '500' },
      },
    );
    answerBool('Nietypowa logika?', 'Nie');
    answerBool('Nowoczesny front?', 'Nie');

    // Sekcja 2 „Rekomendacja platformy" musi pokazać WooCommerce.
    const recSection = screen.getByText('2. Rekomendacja platformy').closest('section')!;
    expect(within(recSection).queryByText(/WooCommerce/)).not.toBeNull();
    expect(within(recSection).queryByText(/Medusa/)).toBeNull();
  });

  it('scenariusz Medusa: sklep + headless TAK + custom TAK → Medusa', () => {
    render(<PlatformStep library={LIBRARY} onConfirm={() => {}} />);
    fireEvent.change(
      screen
        .getByText('Co ma robic projekt?')
        .closest('div')!
        .parentElement!.querySelector('select')!,
      {
        target: { value: 'sklep' },
      },
    );
    answerBool('Nietypowa logika?', 'Tak');
    answerBool('Nowoczesny front?', 'Tak');
    const recSection = screen.getByText('2. Rekomendacja platformy').closest('section')!;
    expect(within(recSection).queryByText(/Medusa/)).not.toBeNull();
  });
});
