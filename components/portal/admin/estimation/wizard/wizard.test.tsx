import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuoteProvider } from '../QuoteContext';
import type { QuoteState } from '../useQuoteState';
import type { EstimationLibrary, LibQuestion } from '../useEstimationLibrary';
import type {
  QuoteComputation,
  ValidationOverrides,
  Totals,
  ConfidenceResult,
} from '@/lib/estimation/types';
import ValidationScreen from './ValidationScreen';
import WizardSteps from './WizardSteps';

const EMPTY_OV: ValidationOverrides = {
  chosenLevels: {},
  overrideHours: {},
  levelReasons: {},
  disabledModules: [],
  disabledIntegrations: [],
  disabledMultipliers: [],
  extraCostItems: [],
};
const TOTALS: Totals = {
  base: { hoursMin: 0, hoursMax: 0 },
  afterItems: { hoursMin: 0, hoursMax: 0 },
  multiplierSum: 0,
  afterMultipliers: { hoursMin: 0, hoursMax: 0 },
  afterBuffer: { hoursMin: 0, hoursMax: 0 },
  price: { min: 0, max: 0 },
  offer: { min: 0, max: 0 },
  costs: 0,
  byCategory: {},
  engineVersion: '1.0',
};
const CONF: ConfidenceResult = {
  score: 100,
  band: 'green',
  breakdown: [],
  belowCompleteness: false,
};

const Q = (over: Partial<LibQuestion>): LibQuestion => ({
  code: '',
  text: '',
  help_text: null,
  answer_type: 'text',
  options_json: null,
  allow_unknown: 1,
  visibility: 'internal',
  unknown_weight: 1,
  visible_if_json: null,
  question_group: 'projekt',
  sort_order: 0,
  ...over,
});
const emptyLib = (questions: LibQuestion[]): EstimationLibrary => ({
  aspects: [],
  levels: [],
  archetypes: [],
  archetypeDefaults: [],
  questions,
  rules: [],
  modules: [],
  integrations: [],
  multipliers: [],
  params: [],
});

function mockState(
  computation: Partial<QuoteComputation>,
  overrides = EMPTY_OV,
  setOverrides = vi.fn(),
  setAnswer = vi.fn(),
  answers = {},
): QuoteState {
  return {
    answers,
    setAnswer,
    overrides,
    setOverrides,
    computation: {
      aspects: [],
      activeModules: [],
      activeIntegrations: [],
      activeMultipliers: [],
      costItems: [],
      warnings: [],
      recommendedArchetypes: [],
      totals: TOTALS,
      confidence: CONF,
      ...computation,
    },
    flush: vi.fn().mockResolvedValue(undefined),
    hasUnsavedOverrides: false,
  } as unknown as QuoteState;
}

describe('ValidationScreen — zmiana poziomu wymaga powodu', () => {
  const aspect = {
    code: 'frontend',
    category: 'A' as const,
    name: 'Frontend',
    suggestedLevel: 2,
    chosenLevel: 2,
    locked: false,
    hoursMin: 40,
    hoursMax: 100,
    reasons: ['Sklep'],
  };

  it('chosen == suggested → brak pola powodu', () => {
    render(
      <QuoteProvider state={mockState({ aspects: [aspect] })} library={emptyLib([])}>
        <ValidationScreen onBack={() => {}} />
      </QuoteProvider>,
    );
    expect(screen.queryByPlaceholderText(/Powód zmiany poziomu/)).toBeNull();
  });

  it('chosen != suggested bez powodu → pole + ostrzeżenie „wymaga powodu"', () => {
    render(
      <QuoteProvider
        state={mockState({ aspects: [{ ...aspect, chosenLevel: 4 }] })}
        library={emptyLib([])}
      >
        <ValidationScreen onBack={() => {}} />
      </QuoteProvider>,
    );
    expect(screen.getByPlaceholderText(/Powód zmiany poziomu/)).not.toBeNull();
    expect(screen.queryByText(/Zmiana poziomu wymaga powodu/)).not.toBeNull();
  });

  it('zmiana selecta poziomu woła setOverrides', () => {
    const setOverrides = vi.fn();
    render(
      <QuoteProvider
        state={mockState({ aspects: [aspect] }, EMPTY_OV, setOverrides)}
        library={emptyLib([])}
      >
        <ValidationScreen onBack={() => {}} />
      </QuoteProvider>,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } });
    expect(setOverrides).toHaveBeenCalled();
  });
});

describe('WizardSteps — widoczność warunkowa (visible_if)', () => {
  const questions = [
    Q({ code: 'a', text: 'Pytanie zawsze', question_group: 'projekt', sort_order: 10 }),
    Q({
      code: 'b',
      text: 'Pytanie warunkowe',
      question_group: 'projekt',
      sort_order: 20,
      visible_if_json: '{"q":"a","op":"eq","val":"tak"}',
    }),
  ];

  it('warunkowe ukryte gdy warunek niespełniony; widoczne gdy spełniony', () => {
    const { rerender } = render(
      <QuoteProvider
        state={mockState({}, EMPTY_OV, vi.fn(), vi.fn(), {})}
        library={emptyLib(questions)}
      >
        <WizardSteps onDone={() => {}} />
      </QuoteProvider>,
    );
    expect(screen.queryByText('Pytanie zawsze')).not.toBeNull();
    expect(screen.queryByText('Pytanie warunkowe')).toBeNull(); // a != 'tak'

    rerender(
      <QuoteProvider
        state={mockState({}, EMPTY_OV, vi.fn(), vi.fn(), { a: 'tak' })}
        library={emptyLib(questions)}
      >
        <WizardSteps onDone={() => {}} />
      </QuoteProvider>,
    );
    expect(screen.queryByText('Pytanie warunkowe')).not.toBeNull(); // a == 'tak'
  });
});

describe('WizardSteps — dedup: pytania kroku Platforma nie wracają w wizardzie (fix 1)', () => {
  // Reguła recommend_archetype pytająca o 'project_goal' → to pytanie należy do kroku Platforma
  // i NIE może pojawić się ponownie w wizardzie, mimo że siedzi w grupie 'projekt'.
  const platformRule = {
    id: 1,
    name: 'r',
    priority: 1,
    condition_json: '{"q":"project_goal","op":"eq","val":"sklep"}',
    actions_json: '[{"type":"recommend_archetype","archetype":"woocommerce"}]',
    reason_template: '',
  };
  const libWithRule = (questions: LibQuestion[]): EstimationLibrary => ({
    ...emptyLib(questions),
    rules: [platformRule],
  });

  it('project_goal (pytanie platformy) pominięte; zwykłe pytanie projektu widoczne', () => {
    const questions = [
      Q({
        code: 'project_goal',
        text: 'Co ma robić projekt?',
        question_group: 'projekt',
        sort_order: 20,
      }),
      Q({ code: 'views_count', text: 'Ile podstron?', question_group: 'projekt', sort_order: 30 }),
    ];
    render(
      <QuoteProvider
        state={mockState({}, EMPTY_OV, vi.fn(), vi.fn(), {})}
        library={libWithRule(questions)}
      >
        <WizardSteps onDone={() => {}} />
      </QuoteProvider>,
    );
    expect(screen.queryByText('Co ma robić projekt?')).toBeNull(); // dedup
    expect(screen.queryByText('Ile podstron?')).not.toBeNull();
  });
});
