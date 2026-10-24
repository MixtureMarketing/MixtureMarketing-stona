import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { auditService, AuditResult } from '../../../services/auditService';
import AuditInputStep from './AuditInputStep';
import AuditEmailGateStep from './AuditEmailGateStep';
import Container from '../../common/Container';
import TurnstileWidget from '../contact/TurnstileWidget';
import type { TurnstileWidgetHandle } from '../../../utils/turnstile';
import { SITE_CONFIG } from '../../../config/site';
import { reportError } from '../../../utils/errorReporter';
import AuditPdfNotice from './AuditPdfNotice';
import { readDeepLinkUrl, PDF_NOT_GENERATED, type PdfDelivery } from './auditDelivery';

// --- COMPONENTS (Lazy Loaded) ---
const AuditProgress = lazy(() => import('./steps/AuditProgress'));
const AuditDashboard = lazy(() => import('./steps/AuditDashboard'));

type Step = 'INPUT' | 'SCANNING' | 'EMAIL_GATE' | 'RESULT';

const AuditWizard: React.FC = () => {
  // Deep-link `?url=` czytany RAZ (bez podwójnego dekodowania — `%` w adresie wywracał stronę).
  const [deepLinkUrl] = useState(() => readDeepLinkUrl(window.location.search));
  const [step, setStep] = useState<Step>(deepLinkUrl ? 'SCANNING' : 'INPUT');
  const [companyName, setCompanyName] = useState('');
  const [url, setUrl] = useState(deepLinkUrl);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfDelivery, setPdfDelivery] = useState<PdfDelivery>({ state: 'idle' });
  // Niewidoczny Turnstile — serwer wymaga tokenu przed wysłaniem raportu mailem.
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);

  const startScanning = React.useCallback(
    async (targetUrl: string) => {
      setError(null);
      try {
        const data = await auditService.runAudit(targetUrl, companyName, true);
        setResult(data);
      } catch (err) {
        console.error(err);
        setError('Nie udało się przeprowadzić audytu. Sprawdź adres URL i spróbuj ponownie.');
        setStep('INPUT');
      }
    },
    [companyName],
  );

  useEffect(() => {
    if (deepLinkUrl) {
      setTimeout(() => startScanning(deepLinkUrl), 0);
    }
    // Uruchamiamy tylko raz na wejsciu z deep-linka (?url=); startScanning zalezy od companyName
    // (pustego przy deep-linku), wiec swiadomie pomijamy je w zaleznosciach.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setStep('SCANNING');
    startScanning(url);
  };

  // Zapis leada + wysyłka PDF do użytkownika (obietnica z bramki — realna od 2026-07-17).
  // Działa w tle (raport online pokazujemy od razu), ale WYNIK trafia do UI: przy porażce
  // (403 captcha, 429, 5xx, sieć, PDF się nie wygenerował) użytkownik widzi komunikat
  // z ponowieniem, zamiast czekać na maila, który nie przyjdzie.
  const sendReport = React.useCallback(
    async (data: AuditResult, mail: string, isRetry: boolean) => {
      let pdf: Blob | undefined;
      try {
        const { generateAuditPdf } = await import('../../../services/auditPdfService');
        pdf = await generateAuditPdf(data);
      } catch (err) {
        console.error('audit pdf generation failed:', err);
      }
      let captchaToken: string | undefined;
      try {
        captchaToken = await turnstileRef.current?.getToken();
      } catch (err) {
        console.error('audit turnstile failed:', err);
      }
      const res = await auditService.captureLead({
        captchaToken,
        email: mail,
        url: data.client.url || url,
        companyName: companyName || undefined,
        score: data.client.total_score,
        pdf,
      });
      if (res.ok && pdf) {
        setPdfDelivery({ state: 'sent', afterRetry: isRetry });
        return;
      }
      const status = res.ok ? PDF_NOT_GENERATED : res.status;
      reportError('audit_capture_lead', new Error(`capture-lead failed: ${status}`));
      setPdfDelivery({ state: 'failed', status });
    },
    [companyName, url],
  );

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (result) {
      setPdfDelivery({ state: 'sending' });
      void sendReport(result, email, false);
    }
    setStep('RESULT');
  };

  const retryReport = () => {
    if (!result) return;
    setPdfDelivery((d) => (d.state === 'failed' ? { ...d, retrying: true } : d));
    void sendReport(result, email, true);
  };

  const handleAnimationComplete = () => {
    if (result) setStep('EMAIL_GATE');
  };

  // Turnstile (api.js ~85 kB) dopiero przy pierwszej interakcji z kreatorem, nie przy
  // wejściu na stronę; wysyłka leada i tak poczeka na skrypt (getToken w trybie defer).
  const prepareCaptcha = () => turnstileRef.current?.prepare?.();

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden"
      onFocusCapture={prepareCaptcha}
      onPointerDownCapture={prepareCaptcha}
    >
      <TurnstileWidget ref={turnstileRef} siteKey={SITE_CONFIG.contact.turnstileSiteKey} defer />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-dark skew-y-3 origin-top-left z-0"></div>
      <Container className="relative z-10 py-12 flex-1 flex flex-col justify-center">
        {step === 'RESULT' && result && (
          <AuditPdfNotice delivery={pdfDelivery} email={email} onRetry={retryReport} />
        )}
        <AnimatePresence mode="wait">
          {step === 'INPUT' && (
            <AuditInputStep
              url={url}
              setUrl={setUrl}
              companyName={companyName}
              setCompanyName={setCompanyName}
              onSubmit={handleUrlSubmit}
              error={error}
            />
          )}

          {step === 'SCANNING' && (
            <AuditProgress
              targetUrl={url}
              onComplete={handleAnimationComplete}
              isDataReady={!!result}
            />
          )}

          {step === 'EMAIL_GATE' && (
            <AuditEmailGateStep email={email} setEmail={setEmail} onSubmit={handleEmailSubmit} />
          )}

          {step === 'RESULT' && result && (
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] shadow-xl h-[600px]">
                  <Zap className="animate-spin text-blue-500 mb-4" size={48} />
                  <p className="text-gray-500 font-bold">Generowanie raportu...</p>
                </div>
              }
            >
              <AuditDashboard
                data={result}
                onReset={() => {
                  setStep('INPUT');
                  setResult(null);
                  setPdfDelivery({ state: 'idle' });
                }}
              />
            </Suspense>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
};

export default AuditWizard;
