import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EntityTable from './EntityTable';
import { ENTITY_CONFIGS } from './libraryFields';
import type { PatchResult } from './useLibraryMutations';

// Logika edytora (§1: testujemy logikę, nie markup): diff — do PATCH idą TYLKO zmienione pola;
// brak zmian = brak wywołania; błędy walidacji serwera pokazane przy formularzu.

const aspectCfg = ENTITY_CONFIGS.find((c) => c.entity === 'aspect')!;
const row = {
  code: 'frontend',
  name: 'Frontend',
  client_name: 'Stara',
  category: 'A',
  description: 'granice',
  sort_order: 1,
};

type OnSave = (
  key: Record<string, unknown>,
  patch: Record<string, unknown>,
) => Promise<PatchResult>;
const renderTable = (onSave: OnSave, onSaved = vi.fn()) =>
  render(
    <EntityTable
      config={aspectCfg}
      rows={[row]}
      qmap={{}}
      saving={false}
      onSave={onSave}
      onSaved={onSaved}
    />,
  );

describe('EntityTable — edycja wiersza biblioteki', () => {
  it('zapisuje TYLKO zmienione pole (diff), z naturalnym kluczem', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    const onSaved = vi.fn();
    renderTable(onSave, onSaved);

    fireEvent.click(screen.getByText('Edytuj'));
    fireEvent.change(screen.getByDisplayValue('Stara'), { target: { value: 'Nowa' } });
    fireEvent.click(screen.getByText('Zapisz'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    // name/description/category NIE zmienione → nie ma ich w patchu
    expect(onSave).toHaveBeenCalledWith({ code: 'frontend' }, { client_name: 'Nowa' });
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('brak zmian → Zapisz nie woła onSave (nie ubijamy wiersza pustym patchem)', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    renderTable(onSave);

    fireEvent.click(screen.getByText('Edytuj'));
    fireEvent.click(screen.getByText('Zapisz'));

    // odczekaj mikrozadania — onSave nie powinien wejść
    await Promise.resolve();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('błędy walidacji serwera pokazane przy formularzu', async () => {
    const onSave = vi.fn().mockResolvedValue({
      ok: false,
      errors: ['Kategoria musi być z zakresu A..G.'],
    });
    renderTable(onSave);

    fireEvent.click(screen.getByText('Edytuj'));
    fireEvent.change(screen.getByDisplayValue('Frontend'), { target: { value: 'Frontend v2' } });
    fireEvent.click(screen.getByText('Zapisz'));

    expect(await screen.findByText('Kategoria musi być z zakresu A..G.')).toBeTruthy();
  });

  it('kod (code) NIE jest polem edytowalnym — pokazany jako plakietka, nie input', () => {
    renderTable(vi.fn());
    fireEvent.click(screen.getByText('Edytuj'));
    // „frontend" widoczne jako identyfikator, ale nie jako wartość inputa
    expect(screen.queryByDisplayValue('frontend')).toBeNull();
    expect(screen.getByTitle(/kontrakt danych/i).textContent).toContain('frontend');
  });
});

describe('EntityTable — edycja zakresu modułu (checkboxy, f2c-2b)', () => {
  const moduleCfg = ENTITY_CONFIGS.find((c) => c.entity === 'module')!;
  const moduleRow = {
    code: 'wishlist',
    name: 'Wishlist',
    hours_min: 8,
    hours_max: 16,
    risk: 'low',
    goals_json: '["sklep"]',
    archetypes_json: null,
  };
  const sources = {
    goals_json: [
      { value: 'sklep', label: 'Sklep' },
      { value: 'b2b', label: 'B2B' },
    ],
    archetypes_json: [{ value: 'woocommerce', label: 'woocommerce' }],
  };

  it('zaznaczenie celu → patch z goals_json (posortowany JSON)', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(
      <EntityTable
        config={moduleCfg}
        rows={[moduleRow]}
        qmap={{}}
        checkboxSources={sources}
        saving={false}
        onSave={onSave}
        onSaved={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Edytuj'));
    fireEvent.click(screen.getByLabelText('B2B')); // dołóż b2b do {sklep}
    fireEvent.click(screen.getByText('Zapisz'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const [key, patch] = onSave.mock.calls[0];
    expect(key).toEqual({ code: 'wishlist' });
    expect(patch).toEqual({ goals_json: '["b2b","sklep"]' }); // posortowane
  });

  it('odznaczenie wszystkich celów → goals_json = null („wszystkie")', async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(
      <EntityTable
        config={moduleCfg}
        rows={[moduleRow]}
        qmap={{}}
        checkboxSources={sources}
        saving={false}
        onSave={onSave}
        onSaved={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Edytuj'));
    fireEvent.click(screen.getByLabelText('Sklep')); // odznacz sklep → puste
    fireEvent.click(screen.getByText('Zapisz'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][1]).toEqual({ goals_json: null });
  });
});
