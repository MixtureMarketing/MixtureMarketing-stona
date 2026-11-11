import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { auditService, type AuditResult } from '@/services/auditService';

/**
 * MIX-1300: audit_request (GA4 key event) idzie z prawdziwego przepływu /audyt-360/
 * (AuditWizard), w chwili wysłania bramki e-mail z wynikiem audytu. Wcześniej wysyłała go
 * tylko martwa gałąź ModalContext (openModal('audit'), której nikt nie wołał).
 */

// Animacja skanowania: kończy się od razu, gdy dane są gotowe.
vi.mock('@/components/features/audit/steps/AuditProgress', async () => {
  const R = await import('react');
  return {
    default: ({ onComplete, isDataReady }: { onComplete: () => void; isDataReady: boolean }) => {
      R.useEffect(() => {
        if (isDataReady) onComplete();
      }, [isDataReady, onComplete]);
      return null;
    },
  };
});
vi.mock('@/components/features/audit/steps/AuditDashboard', () => ({ default: () => null }));
vi.mock('@/services/auditPdfService', () => ({
  generateAuditPdf: () => Promise.resolve(new Blob(['%PDF'])),
}));
vi.mock('@/components/features/contact/TurnstileWidget', async () => {
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

const RESULT = { client: { url: 'https://sklep.pl', total_score: 72 } } as unknown as AuditResult;

let track: Mock<(event: string, data?: Record<string, unknown>) => void>;
const calls = (name: string) => track.mock.calls.filter((c) => c[0] === name);

const origUrl = window.location.href;
beforeEach(() => {
  track = vi.fn<(event: string, data?: Record<string, unknown>) => void>();
  window.zaraz = { track, consent: { set: vi.fn() } };
  window.history.pushState({}, '', '/audyt-360/?url=https://sklep.pl');
  vi.spyOn(auditService, 'runAudit').mockResolvedValue(RESULT);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  delete window.zaraz;
  window.history.pushState({}, '', origUrl);
  vi.restoreAllMocks();
});

async function reachEmailGate() {
  const { default: AuditWizard } = await import('@/components/features/audit/AuditWizard');
  const { container } = render(<AuditWizard />);
  const input = await waitFor(() => {
    const el = container.querySelector('input[type="email"]');
    if (!el) throw new Error('brak bramki e-mail');
    return el as HTMLInputElement;
  });
  return input;
}

describe('AuditWizard — audit_request', () => {
  it('po wysłaniu bramki e-mail: dokładnie jedno audit_request ze ścieżką i wynikiem, bez e-maila', async () => {
    const capture = vi.spyOn(auditService, 'captureLead').mockResolvedValue({ ok: true, status: 200 });
    const input = await reachEmailGate();
    // Sam audyt (skan + bramka) jeszcze nie jest zgłoszeniem.
    expect(calls('audit_request')).toHaveLength(0);

    fireEvent.change(input, { target: { value: 'jan@firma.pl' } });
    fireEvent.click(screen.getByRole('button', { name: /Pokaż raport/ }));

    expect(calls('audit_request')).toHaveLength(1);
    const data = calls('audit_request')[0][1];
    expect(data).toEqual({ source: '/audyt-360/', score: 72 });
    expect(JSON.stringify(data)).not.toContain('jan@firma.pl');
    await waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
  });

  it('ponowienie wysyłki PDF po błędzie nie wysyła drugiego audit_request', async () => {
    const capture = vi
      .spyOn(auditService, 'captureLead')
      .mockResolvedValue({ ok: false, status: 500 });
    const input = await reachEmailGate();
    fireEvent.change(input, { target: { value: 'jan@firma.pl' } });
    fireEvent.click(screen.getByRole('button', { name: /Pokaż raport/ }));
    const retry = await screen.findByRole('button', { name: /Wyślij PDF ponownie/ });
    fireEvent.click(retry);
    await waitFor(() => expect(capture).toHaveBeenCalledTimes(2));
    expect(calls('audit_request')).toHaveLength(1);
  });

  it('negatyw: pusty e-mail nie wysyła audit_request', async () => {
    await reachEmailGate();
    const form = screen.getByRole('button', { name: /Pokaż raport/ }).closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);
    expect(calls('audit_request')).toHaveLength(0);
  });
});
