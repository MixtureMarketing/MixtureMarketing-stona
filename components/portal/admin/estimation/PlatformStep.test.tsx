import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PlatformStep from './PlatformStep';
import type { EstimationLibrary } from './useEstimationLibrary';

// REALNE reguły recommend (1:1 z migrations/seed/rules.sql) — nie mock. Strażnik integracji silnik↔UI.
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
    id: 38,
    name: 'Medusa',
    condition_json:
      '{"all":[{"q":"project_goal","op":"eq","val":"sklep"},{"q":"frontend_headless","op":"eq","val":true},{"q":"custom_logic","op":"eq","val":true}]}',
    actions_json: '[{"type":"recommend_archetype","code":"medusa","reason":"Headless-first"}]',
    reason_template: 'x',
    priority: 0,
  },
  {
    id: 39,
    name: 'Laravel',
    condition_json:
      '{"any":[{"q":"project_goal","op":"eq","val":"aplikacja"},{"q":"project_goal","op":"eq","val":"b2b"}]}',
    actions_json: '[{"type":"recommend_archetype","code":"laravel","reason":"Aplikacja"}]',
    reason_template: 'x',
    priority: 0,
  },
  {
    id: 45,
    name: 'WP-portal',
    condition_json: '{"q":"project_goal","op":"eq","val":"portal_tresci"}',
    actions_json: '[{"type":"recommend_archetype","code":"wordpress","reason":"Waga tresci"}]',
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

const CATALOG_VIF = '{"q":"project_goal","op":"in","val":["sklep","b2b"]}';
const LIBRARY: EstimationLibrary = {
  aspects: [{ code: 'frontend', name: 'F', category: 'A', description: null }],
  levels: [],
  archetypes: [
    { code: 'woocommerce', name: 'WooCommerce', description: null, integration_mode: 'platform' },
    { code: 'medusa', name: 'Medusa', description: null, integration_mode: 'custom' },
    { code: 'laravel', name: 'Laravel', description: null, integration_mode: 'custom' },
    { code: 'wordpress', name: 'WordPress', description: null, integration_mode: 'platform' },
  ],
  archetypeDefaults: [],
  questions: [
    Q({
      code: 'project_goal',
      text: 'Co ma robic projekt?',
      answer_type: 'select',
      options_json:
        '[{"value":"sklep","label":"Sklep"},{"value":"portal_tresci","label":"Portal tresci"},{"value":"aplikacja","label":"Aplikacja"}]',
      sort_order: 20,
    }),
    Q({
      code: 'products_count',
      text: 'Ile produktow?',
      answer_type: 'number',
      visible_if_json: CATALOG_VIF,
      sort_order: 30,
    }),
    Q({ code: 'custom_logic', text: 'Nietypowa logika?', answer_type: 'bool', sort_order: 230 }),
    Q({
      code: 'frontend_headless',
      text: 'Nowoczesnosc priorytetem?',
      answer_type: 'bool',
      sort_order: 240,
    }),
  ],
  rules: RULES,
  params: [],
};

const setSelect = (label: string, value: string) =>
  fireEvent.change(
    screen.getByText(label).closest('div')!.parentElement!.querySelector('select')!,
    { target: { value } },
  );
const setNumber = (label: string, value: string) =>
  fireEvent.change(screen.getByText(label).closest('div')!.parentElement!.querySelector('input')!, {
    target: { value },
  });
const setBool = (label: string, btn: 'Tak' | 'Nie') =>
  fireEvent.click(within(screen.getByText(label).closest('div')!.parentElement!).getByText(btn));
const recSection = () => screen.getByText('2. Rekomendacja platformy').closest('section')!;
const choiceSection = () => screen.getByText('3. Wybór archetypu').closest('section')!;

describe('PlatformStep — integracja silnik↔UI (realne reguły)', () => {
  it('Woo: sklep + 500 + custom NIE + headless NIE → WooCommerce (nie Medusa)', () => {
    render(<PlatformStep library={LIBRARY} onConfirm={() => {}} />);
    setSelect('Co ma robic projekt?', 'sklep');
    setNumber('Ile produktow?', '500');
    setBool('Nietypowa logika?', 'Nie');
    setBool('Nowoczesnosc priorytetem?', 'Nie');
    expect(within(recSection()).queryByText(/WooCommerce/)).not.toBeNull();
    expect(within(recSection()).queryByText(/Medusa/)).toBeNull();
  });

  it('Medusa: sklep + headless TAK + custom TAK → Medusa', () => {
    render(<PlatformStep library={LIBRARY} onConfirm={() => {}} />);
    setSelect('Co ma robic projekt?', 'sklep');
    setBool('Nietypowa logika?', 'Tak');
    setBool('Nowoczesnosc priorytetem?', 'Tak');
    expect(within(recSection()).queryByText(/Medusa/)).not.toBeNull();
  });

  it('nowoczesność=Tak SAMA (custom NIE) NIE przełącza Woo→Medusa (rule 38 wymaga obu sygnałów)', () => {
    render(<PlatformStep library={LIBRARY} onConfirm={() => {}} />);
    setSelect('Co ma robic projekt?', 'sklep');
    setNumber('Ile produktow?', '500');
    setBool('Nietypowa logika?', 'Nie'); // custom_logic=false
    setBool('Nowoczesnosc priorytetem?', 'Tak'); // sam sygnał nowoczesności
    expect(within(recSection()).queryByText(/WooCommerce/)).not.toBeNull();
    expect(within(recSection()).queryByText(/Medusa/)).toBeNull(); // NIE przeskakuje
  });

  it('B.4 portal treści → WordPress (wcześniej pusto)', () => {
    render(<PlatformStep library={LIBRARY} onConfirm={() => {}} />);
    setSelect('Co ma robic projekt?', 'portal_tresci');
    expect(within(recSection()).queryByText(/WordPress/)).not.toBeNull();
  });

  it('C.8 widoczność warunkowa: „Ile produktow?" tylko dla sklepu/B2B', () => {
    render(<PlatformStep library={LIBRARY} onConfirm={() => {}} />);
    setSelect('Co ma robic projekt?', 'aplikacja');
    expect(screen.queryByText('Ile produktow?')).toBeNull(); // ukryte dla aplikacji
    setSelect('Co ma robic projekt?', 'sklep');
    expect(screen.queryByText('Ile produktow?')).not.toBeNull(); // widoczne dla sklepu
  });

  it('B.5 brak dopasowania: sklep + custom TAK (500) → komunikat, nie cisza', () => {
    render(<PlatformStep library={LIBRARY} onConfirm={() => {}} />);
    setSelect('Co ma robic projekt?', 'sklep');
    setNumber('Ile produktow?', '500');
    setBool('Nietypowa logika?', 'Tak'); // rule 35 wymaga custom=false → brak dopasowania
    expect(within(recSection()).queryByText(/Brak jednoznacznej rekomendacji/)).not.toBeNull();
  });

  it('C.9 wybór ręczny bez rekomendacji → wymaga powodu', () => {
    render(<PlatformStep library={LIBRARY} onConfirm={() => {}} />);
    // brak odpowiedzi → brak rekomendacji; klik archetypu = ręczny
    fireEvent.click(within(choiceSection()).getByText('Laravel'));
    expect(
      within(choiceSection()).queryByText(/Wybór ręczny z pominięciem doradcy/),
    ).not.toBeNull();
    // przycisk potwierdzenia zablokowany do podania powodu
    expect(screen.getByText(/Utwórz wycenę/).closest('button')!).toBeDisabled();
  });
});
