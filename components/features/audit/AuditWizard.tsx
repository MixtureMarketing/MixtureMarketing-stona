import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { auditService, AuditResult } from '../../../services/auditService';
import AuditInputStep from './AuditInputStep';
import AuditEmailGateStep from './AuditEmailGateStep';
import Container from '../../common/Container';

// --- COMPONENTS (Lazy Loaded) ---
const AuditProgress = lazy(() => import('./steps/AuditProgress'));
const AuditDashboard = lazy(() => import('./steps/AuditDashboard'));

type Step = 'INPUT' | 'SCANNING' | 'EMAIL_GATE' | 'RESULT';

const AuditWizard: React.FC = () => {
  const [step, setStep] = useState<Step>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('url') ? 'SCANNING' : 'INPUT';
  });
  const [companyName, setCompanyName] = useState('');
  const [url, setUrl] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const deepLinkUrl = params.get('url');
    return deepLinkUrl ? decodeURIComponent(deepLinkUrl) : '';
  });
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    const params = new URLSearchParams(window.location.search);
    const deepLinkUrl = params.get('url');
    if (deepLinkUrl) {
      setTimeout(() => startScanning(decodeURIComponent(deepLinkUrl)), 0);
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

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Zapis leada + wysyłka PDF do użytkownika (obietnica z bramki — realna
    // od 2026-07-17). Best-effort w tle, nie blokuje pokazania raportu online.
    if (result) {
      void (async () => {
        let pdf: Blob | undefined;
        try {
          const { generateAuditPdf } = await import('../../../services/auditPdfService');
          pdf = await generateAuditPdf(result);
        } catch (err) {
          console.error('audit pdf generation failed:', err);
        }
        await auditService.captureLead({
          email,
          url: result.client.url || url,
          companyName: companyName || undefined,
          score: result.client.total_score,
          pdf,
        });
      })();
    }
    setStep('RESULT');
  };

  const handleAnimationComplete = () => {
    if (result) setStep('EMAIL_GATE');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-dark skew-y-3 origin-top-left z-0"></div>
      <Container className="relative z-10 py-12 flex-1 flex flex-col justify-center">
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
