import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { primeCmsDocument, useCmsDocument } from '../../hooks/useCmsDocument';

describe('useCmsDocument', () => {
  it('null z fetchera → notfound; wyjątek → error (nie notfound)', async () => {
    const fetcher = vi.fn(async (slug: string) => {
      if (slug === 'brak') return null;
      throw new Error('Sanity 503');
    });
    const { result, rerender } = renderHook(({ slug }) => useCmsDocument(slug, fetcher), {
      initialProps: { slug: 'brak' },
    });
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('notfound'));

    rerender({ slug: 'awaria' });
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('zmiana sluga po błędzie resetuje stan (kolejny artykuł nie dziedziczy błędu)', async () => {
    const fetcher = vi.fn(async (slug: string) => {
      if (slug === 'a') throw new Error('timeout');
      return { slug };
    });
    const { result, rerender } = renderHook(({ slug }) => useCmsDocument(slug, fetcher), {
      initialProps: { slug: 'a' },
    });
    await waitFor(() => expect(result.current.status).toBe('error'));
    rerender({ slug: 'b' });
    await waitFor(() => expect(result.current.status).toBe('ok'));
    expect(result.current.data).toEqual({ slug: 'b' });
  });

  it('retry ponawia pobranie po błędzie', async () => {
    const fetcher = vi
      .fn<(slug: string) => Promise<{ ok: boolean } | null>>()
      .mockRejectedValueOnce(new Error('429'))
      .mockResolvedValueOnce({ ok: true });
    const { result } = renderHook(() => useCmsDocument('x', fetcher));
    await waitFor(() => expect(result.current.status).toBe('error'));
    act(() => result.current.retry());
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ok'));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('ignoruje spóźnioną odpowiedź poprzedniego sluga (A→B)', async () => {
    let resolveA: (v: { id: string }) => void = () => {};
    const fetcher = vi.fn((slug: string) =>
      slug === 'a'
        ? new Promise<{ id: string }>((r) => {
            resolveA = r;
          })
        : Promise.resolve({ id: 'b' }),
    );
    const { result, rerender } = renderHook(({ slug }) => useCmsDocument(slug, fetcher), {
      initialProps: { slug: 'a' },
    });
    rerender({ slug: 'b' });
    await waitFor(() => expect(result.current.data).toEqual({ id: 'b' }));
    await act(async () => resolveA({ id: 'a' }));
    expect(result.current.data).toEqual({ id: 'b' });
  });

  it('primeCmsDocument: pierwszy render ma dane od razu (bez loading) i bez drugiego żądania', async () => {
    const fetcher = vi.fn(async (slug: string) => ({ slug }));
    await primeCmsDocument(fetcher, 'medycyna');
    expect(fetcher).toHaveBeenCalledTimes(1);

    const { result } = renderHook(() => useCmsDocument('medycyna', fetcher));
    expect(result.current.status).toBe('ok');
    expect(result.current.data).toEqual({ slug: 'medycyna' });
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Dane z preloadu są jednorazowe — kolejny montaż pobiera normalnie.
    const second = renderHook(() => useCmsDocument('medycyna', fetcher));
    expect(second.result.current.status).toBe('loading');
    await waitFor(() => expect(second.result.current.status).toBe('ok'));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('primeCmsDocument połyka błąd — hook pobiera sam i pokazuje stan błędu', async () => {
    const fetcher = vi.fn(async (_slug: string): Promise<{ id: string } | null> => {
      throw new Error('Sanity 503');
    });
    await expect(primeCmsDocument(fetcher, 'x')).resolves.toBeUndefined();
    const { result } = renderHook(() => useCmsDocument('x', fetcher));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});
