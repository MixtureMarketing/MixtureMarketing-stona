// MIX-1816 (Z13) K2: przełącznik VITE_MM_NEW_CLIENT_TIMELINE. Wyłączony = DOM ekranu wyniku
// IDENTYCZNY jak przed zmianą (BASE_HTML to dosłowny zrzut z integracji 8933c5b), 0 elementów osi
// czasu. Włączony (tylko 1, MIX-1846) = ten sam ekran plus sekcja osi czasu na jego końcu.
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PublicQuestion } from '../../../services/calculatorService';
import { isNewClientTimelineEnabled } from './livePrice';

// Zrzut <div class="text-center space-y-6">…</div> z integracji 8933c5b (widełki 27500–53000).
const BASE_HTML =
  '<div class="text-center space-y-6"><p class="text-sm uppercase tracking-wider text-primary/80">Orientacyjne widełki</p><p class="text-4xl md:text-5xl font-extrabold text-white">27&nbsp;500&nbsp;–&nbsp;53&nbsp;000&nbsp;zł</p><p class="mx-auto max-w-md text-gray-300">To zgrubny przedział na podstawie Twoich odpowiedzi — <strong>nie wiążąca oferta</strong>. Dokładną wycenę przygotujemy po krótkiej rozmowie o szczegółach projektu.</p><div class="flex flex-col sm:flex-row gap-3 justify-center pt-2"><a class="px-6 py-3 rounded-xl bg-primary text-dark font-semibold hover:brightness-110 transition" href="/contact/" data-discover="true">Umów rozmowę</a><button type="button" class="px-6 py-3 rounded-xl border border-white/20 text-gray-200 hover:border-white/40 transition">Policz jeszcze raz</button></div></div>';

const QUESTIONS: PublicQuestion[] = [
  {
    code: 'project_goal',
    text: 'Jaki jest cel projektu?',
    help_text: null,
    answer_type: 'select',
    options: [{ value: 'sklep', label: 'Sklep' }],
    visible_if: null,
    group: 'projekt',
    sort_order: 1,
  },
];
const submitPublicQuote = vi.fn();
vi.mock('../../../services/calculatorService', () => ({
  fetchPublicQuestions: () => Promise.resolve(QUESTIONS),
  submitPublicQuote: (...a: unknown[]) => submitPublicQuote(...a),
}));
vi.mock('../contact/TurnstileWidget', async () => {
  const R = await import('react');
  return {
    default: R.forwardRef((_p: unknown, ref: React.Ref<unknown>) => {
      R.useImperativeHandle(ref, () => ({
        getToken: () => Promise.resolve('tok'),
        reset: () => {},
        prepare: () => {},
      }));
      return null;
    }),
  };
});
import PublicCalculator from './PublicCalculator';

async function reachResult() {
  const view = render(
    <MemoryRouter>
      <PublicCalculator />
    </MemoryRouter>,
  );
  await screen.findByText('Jaki jest cel projektu?');
  fireEvent.click(screen.getByRole('radio', { name: 'Sklep' }));
  fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
  fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@firma.pl' } });
  fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
  await waitFor(() => expect(screen.getByText('Orientacyjne widełki')).toBeInTheDocument());
  return view;
}
const resultHtml = (c: HTMLElement) => c.querySelector('div.text-center.space-y-6')!.outerHTML;

beforeEach(() => {
  submitPublicQuote.mockReset();
  submitPublicQuote.mockResolvedValue({
    ok: true,
    result: { priceRange: { min: 27500, max: 53000 } },
  });
  vi.stubEnv('VITE_MM_NEW_CLIENT_TIMELINE', '');
});
afterEach(() => vi.unstubAllEnvs());

describe('K2 parser przełącznika', () => {
  it('tylko 1 włącza; reszta wyłącza (także true, wielkie litery, spacje, 0, yes, on)', () => {
    expect(isNewClientTimelineEnabled('1')).toBe(true);
    for (const v of [undefined, '', '0', 'true', 'TRUE', ' 1', 'yes', 'on', 'false', 1, true, null])
      expect(isNewClientTimelineEnabled(v), String(v)).toBe(false);
  });

  it('brak zmiennej osi czasu nie dziedziczy VITE_MM_LIVE_PRICE_BAR (MIX-1885, mutant V4)', () => {
    vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '1');
    expect(isNewClientTimelineEnabled(undefined)).toBe(false);
    expect(isNewClientTimelineEnabled()).toBe(false);
  });
});

describe('K2 ekran wyniku', () => {
  it('wyłączony (brak, pusty, "0", "true", "TRUE", "yes"): DOM wyniku dosłownie jak przed zmianą, 0 osi czasu', async () => {
    for (const v of ['', '0', 'true', 'TRUE', ' 1', 'yes', 'on']) {
      vi.stubEnv('VITE_MM_NEW_CLIENT_TIMELINE', v);
      const { container, unmount } = await reachResult();
      expect(resultHtml(container)).toBe(BASE_HTML);
      expect(screen.queryByTestId('new-client-timeline')).not.toBeInTheDocument();
      expect(screen.queryByText('Co dostajesz i kiedy')).not.toBeInTheDocument();
      expect(document.body.dataset.timelineCookie).toBeUndefined();
      unmount();
    }
  }, 30_000);

  it('włączony (1): ten sam ekran plus sekcja osi czasu na końcu, ceny bez zmian', async () => {
    for (const v of ['1']) {
      vi.stubEnv('VITE_MM_NEW_CLIENT_TIMELINE', v);
      const { container, unmount } = await reachResult();
      const html = resultHtml(container);
      expect(html.startsWith(BASE_HTML.slice(0, -'</div>'.length))).toBe(true);
      expect(html).not.toBe(BASE_HTML);
      const section = screen.getByTestId('new-client-timeline');
      expect(section.parentElement!.lastElementChild).toBe(section);
      expect(screen.getByRole('heading', { level: 2, name: 'Co dostajesz i kiedy' })).toBeVisible();
      expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
        'Tydzień 1',
        'Miesiąc 1',
        '90 dni',
      ]);
      expect(screen.getByRole('link', { name: 'Umów rozmowę' })).toBeInTheDocument();
      unmount();
    }
  }, 30_000);

  it('oś czasu nie pojawia się na formularzu (tylko na ekranie wyniku)', async () => {
    vi.stubEnv('VITE_MM_NEW_CLIENT_TIMELINE', '1');
    render(
      <MemoryRouter>
        <PublicCalculator />
      </MemoryRouter>,
    );
    await screen.findByText('Jaki jest cel projektu?');
    expect(screen.queryByTestId('new-client-timeline')).not.toBeInTheDocument();
  });
});
