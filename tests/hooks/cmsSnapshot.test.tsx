import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  CMS_SNAPSHOT_ID,
  readCmsSnapshot,
  recordCmsSnapshot,
  serializeCmsSnapshot,
  useCmsDocument,
} from '../../hooks/useCmsDocument';

// MIX-922: dane CMS z prerenderu osadzone w HTML (zrzut) — po JS bez ponownego
// pobrania z Sanity, więc treść/title/canonical zostają także przy awarii Sanity.

const putSnapshot = (text: string) => {
  const el = document.createElement('script');
  el.setAttribute('type', 'application/json');
  el.id = CMS_SNAPSHOT_ID;
  el.textContent = text;
  document.body.appendChild(el);
  return el;
};

const sanityDown = () => vi.fn(async (_slug: string): Promise<{ name: string } | null> => {
  throw new Error('Sanity 503');
});

afterEach(() => {
  document.getElementById(CMS_SNAPSHOT_ID)?.remove();
  window.isPrerendering = undefined;
  vi.restoreAllMocks();
});

describe('zrzut CMS: zapis w prerenderze', () => {
  it('prerender: pobrany dokument trafia do <script type="application/json"> poza #root, bez `<`', async () => {
    window.isPrerendering = true;
    const doc = { name: 'Medycyna', html: '</script><script>alert(1)</script>  ' };
    const fetcher = vi.fn(async () => doc);
    const { result } = renderHook(() => useCmsDocument('medycyna', fetcher, 'industry'));
    await waitFor(() => expect(result.current.status).toBe('ok'));

    const el = document.getElementById(CMS_SNAPSHOT_ID);
    expect(el).not.toBeNull();
    expect(el?.parentElement).toBe(document.body);
    expect(el?.getAttribute('type')).toBe('application/json');
    expect(el?.textContent).not.toContain('<');
    expect(el?.textContent).not.toContain(' ');
    expect(JSON.parse(el?.textContent || '{}')).toEqual({ 'industry|medycyna': doc });
  });

  it('prerender: kilka dokumentów na stronie — wszystkie w jednym zrzucie', () => {
    window.isPrerendering = true;
    recordCmsSnapshot('industry', 'a', { n: 1 });
    recordCmsSnapshot('industryList', 'list', [{ n: 2 }]);
    const parsed = JSON.parse(document.getElementById(CMS_SNAPSHOT_ID)?.textContent || '{}');
    expect(parsed).toEqual({ 'industry|a': { n: 1 }, 'industryList|list': [{ n: 2 }] });
  });

  it('ujemne: notfound i błąd Sanity w prerenderze NIE trafiają do zrzutu', async () => {
    window.isPrerendering = true;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const nf = renderHook(() => useCmsDocument('brak', vi.fn(async () => null), 'industry'));
    await waitFor(() => expect(nf.result.current.status).toBe('notfound'));
    const er = renderHook(() => useCmsDocument('awaria', sanityDown(), 'industry'));
    await waitFor(() => expect(er.result.current.status).toBe('error'));
    expect(document.getElementById(CMS_SNAPSHOT_ID)).toBeNull();
  });

  it('ujemne: poza prerenderem (zwykła wizyta) nic nie jest zapisywane do DOM', async () => {
    const fetcher = vi.fn(async () => ({ name: 'X' }));
    const { result } = renderHook(() => useCmsDocument('x', fetcher, 'industry'));
    await waitFor(() => expect(result.current.status).toBe('ok'));
    expect(document.getElementById(CMS_SNAPSHOT_ID)).toBeNull();
  });

  it('serializacja: `</script>` i `<!--` nie mogą zamknąć tagu, JSON wraca 1:1', () => {
    const v = { a: '</script><!-- x -->', b: 'ąę ' };
    const s = serializeCmsSnapshot(v);
    expect(s).not.toMatch(/[<  ]/);
    expect(JSON.parse(s)).toEqual(v);
  });
});

describe('zrzut CMS: odczyt po JS', () => {
  it('Sanity niedostępne + zrzut w HTML → pierwszy render ma treść (ok), bez żądania do Sanity', async () => {
    putSnapshot(serializeCmsSnapshot({ 'industry|medycyna': { name: 'Medycyna' } }));
    const fetcher = sanityDown();
    const { result } = renderHook(() => useCmsDocument('medycyna', fetcher, 'industry'));
    expect(result.current.status).toBe('ok');
    expect(result.current.data).toEqual({ name: 'Medycyna' });
    await new Promise((r) => setTimeout(r, 20));
    expect(result.current.status).toBe('ok');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('ujemne: bez zrzutu i przy awarii Sanity → stan błędu (tak było przed MIX-922)', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetcher = sanityDown();
    const { result } = renderHook(() => useCmsDocument('medycyna', fetcher, 'industry'));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('ujemne: zrzut innego sluga albo innego rodzaju nie jest używany', async () => {
    putSnapshot(serializeCmsSnapshot({ 'industry|inna': { name: 'Inna' } }));
    const fetcher = vi.fn(async (slug: string) => ({ name: slug }));
    const a = renderHook(() => useCmsDocument('medycyna', fetcher, 'industry'));
    expect(a.result.current.status).toBe('loading');
    await waitFor(() => expect(a.result.current.data).toEqual({ name: 'medycyna' }));
    const b = renderHook(() => useCmsDocument('inna', fetcher, 'location'));
    expect(b.result.current.status).toBe('loading');
    await waitFor(() => expect(b.result.current.data).toEqual({ name: 'inna' }));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('ujemne: uszkodzony zrzut = brak zrzutu (pobranie z Sanity)', async () => {
    putSnapshot('{"industry|medycyna": {nie-json');
    const fetcher = vi.fn(async () => ({ name: 'Z Sanity' }));
    const { result } = renderHook(() => useCmsDocument('medycyna', fetcher, 'industry'));
    await waitFor(() => expect(result.current.data).toEqual({ name: 'Z Sanity' }));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('w trakcie prerenderu zrzut nie jest źródłem danych (zawsze świeże pobranie)', () => {
    putSnapshot(serializeCmsSnapshot({ 'industry|medycyna': { name: 'Stare' } }));
    window.isPrerendering = true;
    expect(readCmsSnapshot('industry', 'medycyna')).toBeUndefined();
    window.isPrerendering = undefined;
    expect(readCmsSnapshot('industry', 'medycyna')).toEqual({ name: 'Stare' });
  });

  it('„Spróbuj ponownie” omija zrzut i pyta Sanity', async () => {
    putSnapshot(serializeCmsSnapshot({ 'industry|medycyna': { name: 'Zrzut' } }));
    const fetcher = vi.fn(async () => ({ name: 'Świeże' }));
    const { result } = renderHook(() => useCmsDocument('medycyna', fetcher, 'industry'));
    expect(result.current.data).toEqual({ name: 'Zrzut' });
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.data).toEqual({ name: 'Świeże' }));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('nawigacja A → B → A: powrót na slug ze zrzutu bez żądania', async () => {
    putSnapshot(serializeCmsSnapshot({ 'industry|a': { name: 'A' } }));
    const fetcher = vi.fn(async (slug: string) => ({ name: slug.toUpperCase() + '!' }));
    const { result, rerender } = renderHook(
      ({ slug }) => useCmsDocument(slug, fetcher, 'industry'),
      { initialProps: { slug: 'a' } },
    );
    expect(result.current.data).toEqual({ name: 'A' });
    rerender({ slug: 'b' });
    await waitFor(() => expect(result.current.data).toEqual({ name: 'B!' }));
    rerender({ slug: 'a' });
    await waitFor(() => expect(result.current.data).toEqual({ name: 'A' }));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
