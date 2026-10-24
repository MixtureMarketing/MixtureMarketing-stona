import React from 'react';
import { AlertTriangle, CheckCircle2, RotateCw } from 'lucide-react';
import { deliveryFailureReason, type PdfDelivery } from './auditDelivery';

interface AuditPdfNoticeProps {
  delivery: PdfDelivery;
  email: string;
  onRetry: () => void;
}

/**
 * Komunikat nad raportem online, gdy raport PDF NIE poszedł mailem (403 captcha, 429,
 * 5xx, sieć, błąd generowania). Raport online jest kompletny — mówimy to wprost
 * i dajemy ponowienie albo kontakt. Po udanym ponowieniu — potwierdzenie.
 */
const AuditPdfNotice: React.FC<AuditPdfNoticeProps> = ({ delivery, email, onRetry }) => {
  const target = email ? ` na ${email}` : '';

  if (delivery.state === 'sent' && delivery.afterRetry) {
    return (
      <div
        role="status"
        className="max-w-3xl w-full mx-auto mb-6 flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-slate-900"
      >
        <CheckCircle2 size={20} className="text-emerald-600 shrink-0" aria-hidden="true" />
        Raport PDF wysłany{target}.
      </div>
    );
  }

  if (delivery.state !== 'failed') return null;

  return (
    <div
      role="alert"
      className="max-w-3xl w-full mx-auto mb-6 flex items-start gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 text-slate-900"
    >
      <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-sm">
        <p className="font-bold mb-1">Raport PDF nie został wysłany{target}.</p>
        <p className="text-slate-700 mb-3">
          {deliveryFailureReason(delivery.status)} Raport online poniżej jest kompletny. Spróbuj
          wysłać PDF ponownie albo napisz:{' '}
          <a href="mailto:info@mixturemarketing.pl" className="font-semibold underline">
            info@mixturemarketing.pl
          </a>
          .
        </p>
        <button
          type="button"
          onClick={onRetry}
          disabled={delivery.retrying}
          className="inline-flex items-center gap-2 rounded-full bg-dark px-4 py-2 text-xs font-semibold text-white hover:bg-dark/90 disabled:opacity-60 transition-colors"
        >
          <RotateCw
            size={14}
            className={delivery.retrying ? 'animate-spin' : undefined}
            aria-hidden="true"
          />
          {delivery.retrying ? 'Wysyłam…' : 'Wyślij PDF ponownie'}
        </button>
      </div>
    </div>
  );
};

export default AuditPdfNotice;
