// MIX-1326 kryterium 3 i 4: przełącznik VITE_MM_TESTIMONIALS. Wyłączony (domyślnie) = sekcji nie ma
// w DOM, a moduł sekcji (lazy) nie jest ładowany. Włączony = sekcja z danymi testowymi.
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { cmsItems } from '../fixtures/testimonials';
import { isTestimonialsEnabled } from '../../components/sections/testimonials/testimonialsFlag';
import TestimonialsSlot from '../../components/sections/testimonials/TestimonialsSlot';

const h = vi.hoisted(() => ({ items: [] as unknown[], loads: 0, getTestimonials: vi.fn() }));

vi.mock('../../services/cmsService', () => ({
  cmsService: { getTestimonials: (...a: unknown[]) => h.getTestimonials(...a) },
}));
vi.mock('../../services/cms/client', () => ({
  urlFor: () => ({
    width: () => ({ height: () => ({ url: () => 'https://example.com/logo.png' }) }),
  }),
}));
// Licznik ewaluacji modułu sekcji: ładowany tylko, gdy Slot faktycznie go zażąda.
vi.mock('../../components/sections/testimonials/Testimonials', async () => {
  h.loads += 1;
  const actual = await vi.importActual<
    typeof import('../../components/sections/testimonials/Testimonials')
  >('../../components/sections/testimonials/Testimonials');
  return actual;
});

afterEach(() => {
  vi.unstubAllEnvs();
  h.loads = 0;
  h.getTestimonials.mockReset();
  cleanup();
});

describe('isTestimonialsEnabled', () => {
  it.each([['1'], ['true']])('%p = włączony', (raw) => {
    expect(isTestimonialsEnabled(raw)).toBe(true);
  });
  it.each([[undefined], [''], ['0'], ['false'], ['TRUE'], [' 1'], ['yes'], [1], [true], [null]])(
    '%p = wyłączony (allowlista: tylko "1" i "true")',
    (raw) => {
      expect(isTestimonialsEnabled(raw)).toBe(false);
    },
  );
  it('domyślnie (bez zmiennej w środowisku budowy) = wyłączony', () => {
    vi.stubEnv('VITE_MM_TESTIMONIALS', undefined as unknown as string);
    expect(isTestimonialsEnabled()).toBe(false);
    vi.stubEnv('VITE_MM_TESTIMONIALS', '1');
    expect(isTestimonialsEnabled()).toBe(true);
  });
});

describe('TestimonialsSlot — przełącznik wyłączony', () => {
  it.each([[undefined], [''], ['0'], ['false']])(
    'VITE_MM_TESTIMONIALS=%p: DOM pusty, moduł sekcji nie załadowany, zero pobrań',
    async (raw) => {
      if (raw !== undefined) vi.stubEnv('VITE_MM_TESTIMONIALS', raw);
      else vi.stubEnv('VITE_MM_TESTIMONIALS', undefined as unknown as string);
      const { container } = render(<TestimonialsSlot />);
      await new Promise((r) => setTimeout(r, 30));
      expect(container.innerHTML).toBe('');
      expect(h.loads).toBe(0);
      expect(h.getTestimonials).not.toHaveBeenCalled();
    },
  );
});

describe('TestimonialsSlot — przełącznik włączony', () => {
  it('renderuje sekcję z danymi testowymi (po załadowaniu lazy chunka)', async () => {
    vi.stubEnv('VITE_MM_TESTIMONIALS', '1');
    h.getTestimonials.mockResolvedValue(cmsItems);
    const { container } = render(<TestimonialsSlot />);
    expect(await screen.findByRole('heading', { level: 2, name: 'Opinie klientów' })).toBeVisible();
    expect(h.loads).toBe(1);
    expect(container.querySelectorAll('li')).toHaveLength(3);
    expect(container.textContent).toContain('Firma Testowa Alfa');
  });

  it('0 pozycji z CMS = sekcji nie ma (fallback)', async () => {
    vi.stubEnv('VITE_MM_TESTIMONIALS', 'true');
    h.getTestimonials.mockResolvedValue([]);
    const { container } = render(<TestimonialsSlot />);
    await waitFor(() => expect(h.getTestimonials).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 30));
    expect(container.innerHTML).toBe('');
  });

  it('błąd pobrania = sekcji nie ma, bez wyjątku', async () => {
    vi.stubEnv('VITE_MM_TESTIMONIALS', '1');
    h.getTestimonials.mockRejectedValue(new Error('offline'));
    const { container } = render(<TestimonialsSlot />);
    await waitFor(() => expect(h.getTestimonials).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 30));
    expect(container.innerHTML).toBe('');
  });
});
