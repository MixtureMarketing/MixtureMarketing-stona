import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CloseProjectForm, { type CloseRow } from './CloseProjectForm';

// Logika formularza zamknięcia (f3a): prefill z actualHours; zapis buduje payload actuals do
// quote-close; puste pole = hours null („nie mierzyliśmy"). Kody itemów module:/integration:.

const ROWS: CloseRow[] = [
  { code: 'frontend', name: 'Frontend', predMin: 40, predMax: 100 },
  { code: 'module:wishlist', name: 'Wishlist', predMin: 8, predMax: 16 },
];

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ ok: true, saved: 2, cleared: 0 }),
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const bodyOf = () => JSON.parse(fetchMock.mock.calls[0][1].body);

describe('CloseProjectForm', () => {
  it('prefill z actualHours + zapis buduje payload actuals', async () => {
    const onSaved = vi.fn();
    render(
      <CloseProjectForm
        quoteId={5}
        sessionToken="t"
        rows={ROWS}
        actualHours={{ frontend: { hours: 45, note: null } }}
        onSaved={onSaved}
      />,
    );
    // prefill: Frontend = 45
    expect((screen.getByLabelText('Realne godziny: Frontend') as HTMLInputElement).value).toBe(
      '45',
    );
    // wpisz godziny modułu
    fireEvent.change(screen.getByLabelText('Realne godziny: Wishlist'), {
      target: { value: '12' },
    });
    fireEvent.click(screen.getByText('Zapisz godziny'));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = bodyOf();
    expect(body.id).toBe(5);
    expect(body.actuals).toEqual([
      { code: 'frontend', hours: 45 },
      { code: 'module:wishlist', hours: 12 },
    ]);
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('puste pole → hours null (nie mierzyliśmy)', async () => {
    render(
      <CloseProjectForm
        quoteId={5}
        sessionToken="t"
        rows={ROWS}
        actualHours={{ frontend: { hours: 45, note: null } }}
        onSaved={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText('Realne godziny: Frontend'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Zapisz godziny'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = bodyOf();
    expect(body.actuals.find((a: { code: string }) => a.code === 'frontend').hours).toBeNull();
  });

  it('błąd serwera pokazany przy formularzu', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: ['Godziny dla „frontend" muszą być liczbą ≥ 0.'] }),
    });
    render(
      <CloseProjectForm
        quoteId={5}
        sessionToken="t"
        rows={ROWS}
        actualHours={{}}
        onSaved={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Zapisz godziny'));
    expect(await screen.findByText(/muszą być liczbą/)).toBeTruthy();
  });
});
