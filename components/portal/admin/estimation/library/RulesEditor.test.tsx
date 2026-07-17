import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RulesEditor from './RulesEditor';
import type { RawRuleRow } from './ruleAdapter';
import type { EstimationLibrary } from '../useEstimationLibrary';

// Logika edytora reguł: edycja WARTOŚCI w liściu drzewa → zapis wysyła patch z przebudowanym
// condition_json (przez adapter). Sam serwer waliduje spójność — tu pilnujemy ścieżki wartość→patch.

const ROWS: RawRuleRow[] = [
  {
    id: 1,
    name: 'Krytyczność',
    priority: 10,
    is_active: 1,
    reason_template: 'x',
    condition_json: JSON.stringify({ q: 'downtime_tolerance', op: 'eq', val: 'srednia' }),
    actions_json: JSON.stringify([{ type: 'multiplier', code: 'hard_deadline' }]),
  },
];

const LIB = {
  aspects: [],
  levels: [],
  archetypes: [
    { code: 'woocommerce', name: 'Woo', description: null, integration_mode: 'platform' },
  ],
  archetypeDefaults: [],
  questions: [],
  rules: [],
  modules: [],
  integrations: [],
  multipliers: [{ code: 'hard_deadline', name: 'Deadline', value: 0.1 }],
  costItemTypes: [],
  params: [],
} as unknown as EstimationLibrary;

describe('RulesEditor — edycja wartości progu', () => {
  it('zmiana val liścia → patch z nowym condition_json', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    const onSaved = vi.fn();
    render(
      <RulesEditor rows={ROWS} library={LIB} saving={false} onSave={onSave} onSaved={onSaved} />,
    );

    fireEvent.click(screen.getByText('Edytuj'));
    fireEvent.change(screen.getByDisplayValue('srednia'), { target: { value: 'krytyczne' } });
    fireEvent.click(screen.getByText('Zapisz'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const [key, patch] = onSave.mock.calls[0];
    expect(key).toEqual({ id: 1 });
    expect(JSON.parse(patch.condition_json).val).toBe('krytyczne');
    expect(JSON.parse(patch.actions_json)[0].code).toBe('hard_deadline');
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('błędy serwera (sierota) pokazane przy formularzu', async () => {
    const onSave = vi.fn().mockResolvedValue({
      ok: false,
      errors: ['Akcja multiplier: nieistniejący kod „ghost".'],
    });
    render(
      <RulesEditor rows={ROWS} library={LIB} saving={false} onSave={onSave} onSaved={vi.fn()} />,
    );
    fireEvent.click(screen.getByText('Edytuj'));
    fireEvent.change(screen.getByDisplayValue('srednia'), { target: { value: 'x' } });
    fireEvent.click(screen.getByText('Zapisz'));
    expect(await screen.findByText(/nieistniejący kod/)).toBeTruthy();
  });
});
