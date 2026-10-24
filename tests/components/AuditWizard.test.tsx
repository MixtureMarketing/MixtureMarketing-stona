import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { readDeepLinkUrl, deliveryFailureReason } from '@/components/features/audit/auditDelivery';
import AuditPdfNotice from '@/components/features/audit/AuditPdfNotice';
import { auditService } from '@/services/auditService';

describe('readDeepLinkUrl — dekodowanie RAZ, bez wyjątku', () => {
  it.each([
    // `%25` → „%" — wcześniej drugi decodeURIComponent rzucał URIError i kładł stronę.
    ['?url=https://sklep.pl/promocja-50%25', 'https://sklep.pl/promocja-50%'],
    ['?url=https%3A%2F%2Fsklep.pl%2Fx', 'https://sklep.pl/x'],
    // `%2F` w ścieżce zostaje zakodowany (podwójne dekodowanie go psuło).
    ['?url=https://a.pl/a%252Fb', 'https://a.pl/a%2Fb'],
    // Link zakodowany podwójnie (stare kampanie) — jedna dodatkowa, bezpieczna próba.
    ['?url=https%253A%252F%252Fa.pl%252F', 'https://a.pl/'],
    ['?url=https%253A%252F%252Fa.pl%252F50%25', 'https%3A%2F%2Fa.pl%2F50%'],
    ['?url=%20https://a.pl%20', 'https://a.pl'],
    ['', ''],
    ['?foo=1', ''],
  ])('%s → %s', (search, expected) => {
    expect(readDeepLinkUrl(search)).toBe(expected);
  });
});

describe('auditService.captureLead — wynik wraca do UI', () => {
  afterEach(() => vi.unstubAllGlobals());
  const payload = { email: 'a@b.pl', url: 'https://a.pl' };

  it('2xx → ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
    expect(await auditService.captureLead(payload)).toEqual({ ok: true, status: 200 });
  });

  it.each([403, 429, 500])('%i → ok:false ze statusem', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })));
    expect(await auditService.captureLead(payload)).toEqual({ ok: false, status });
  });

  it('błąd sieci → status 0, bez wyjątku', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    expect(await auditService.captureLead(payload)).toEqual({ ok: false, status: 0 });
  });
});

describe('AuditPdfNotice', () => {
  it('porażka: czytelny komunikat, raport online nadal dostępny, ponowienie i kontakt', () => {
    const onRetry = vi.fn();
    render(
      <AuditPdfNotice
        delivery={{ state: 'failed', status: 403 }}
        email="jan@firma.pl"
        onRetry={onRetry}
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Raport PDF nie został wysłany na jan@firma.pl.');
    expect(alert).toHaveTextContent(deliveryFailureReason(403));
    expect(alert).toHaveTextContent('Raport online poniżej jest kompletny');
    expect(screen.getByRole('link', { name: 'info@mixturemarketing.pl' })).toHaveAttribute(
      'href',
      'mailto:info@mixturemarketing.pl',
    );
    fireEvent.click(screen.getByRole('button', { name: /Wyślij PDF ponownie/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('w trakcie ponowienia przycisk zablokowany', () => {
    render(
      <AuditPdfNotice
        delivery={{ state: 'failed', status: 429, retrying: true }}
        email="a@b.pl"
        onRetry={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /Wysyłam/ })).toBeDisabled();
  });

  it('sukces po ponowieniu → potwierdzenie; idle/sending/sent → nic', () => {
    const { rerender, container } = render(
      <AuditPdfNotice
        delivery={{ state: 'sent', afterRetry: true }}
        email="a@b.pl"
        onRetry={() => {}}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Raport PDF wysłany na a@b.pl.');
    for (const d of [{ state: 'idle' }, { state: 'sending' }, { state: 'sent' }] as const) {
      rerender(<AuditPdfNotice delivery={d} email="a@b.pl" onRetry={() => {}} />);
      expect(container).toBeEmptyDOMElement();
    }
  });
});

describe('AuditWizard — deep-link z `%`', () => {
  const origUrl = window.location.href;
  beforeEach(() => {
    window.history.pushState({}, '', '/audyt-360/?url=https://sklep.pl/promocja-50%25');
  });
  afterEach(() => {
    window.history.pushState({}, '', origUrl);
    vi.restoreAllMocks();
  });

  it('nie wywraca strony i uruchamia audyt z adresem zdekodowanym raz', async () => {
    const run = vi.spyOn(auditService, 'runAudit').mockReturnValue(new Promise(() => {}));
    const { default: AuditWizard } = await import('@/components/features/audit/AuditWizard');
    render(<AuditWizard />);
    await waitFor(() => expect(run).toHaveBeenCalled());
    expect(run.mock.calls[0][0]).toBe('https://sklep.pl/promocja-50%');
  });
});
