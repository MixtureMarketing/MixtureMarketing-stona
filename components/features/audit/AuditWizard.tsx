import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { auditService, AuditResult } from '../../../services/auditService';
import AuditInputStep from './AuditInputStep';
import AuditEmailGateStep from './AuditEmailGateStep';

// --- COMPONENTS (Lazy Loaded) ---
const AuditProgress = lazy(() => import('./steps/AuditProgress'));
const AuditDashboard = lazy(() => import('./steps/AuditDashboard'));

type Step = 'INPUT' | 'SCANNING' | 'EMAIL_GATE' | 'RESULT';

const AuditWizard: React.FC = () => {
  const [step, setStep] = useState<Step>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('url') || params.get('auditId') ? 'SCANNING' : 'INPUT';
  });
  const [companyName, setCompanyName] = useState('');
  const [url, setUrl] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const deepLinkUrl = params.get('url');
    return deepLinkUrl ? decodeURIComponent(deepLinkUrl) : '';
  });
  const [competitorUrl] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchExistingAudit = React.useCallback(async (id: string) => {
    setError(null);
    try {
      const response = await auditService.getAuditResult(id);
      setResult(response.data);
      if (response.meta?.email) setEmail(response.meta.email as string);
      setStep('RESULT');
    } catch (err) {
      console.error(err);
      setError('Nie udało się pobrać wyników audytu.');
      setStep('INPUT');
    }
  }, []);

  const startScanning = React.useCallback(
    async (targetUrl: string) => {
      setError(null);
      try {
        const data = await auditService.runAudit(targetUrl, competitorUrl, '', true);
        setResult(data);
      } catch (err) {
        console.error(err);
        setError('Nie udało się przeprowadzić audytu. Sprawź adres URL i spróbuj ponownie.');
        setStep('INPUT');
      }
    },
    [competitorUrl],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auditIdParam = params.get('auditId');
    const deepLinkUrl = params.get('url');

    if (auditIdParam) {
      setTimeout(() => fetchExistingAudit(auditIdParam), 0);
    } else if (deepLinkUrl) {
      setTimeout(() => startScanning(decodeURIComponent(deepLinkUrl)), 0);
    }
  }, [fetchExistingAudit, startScanning]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setStep('SCANNING');
    startScanning(url);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep('RESULT');
  };

  const handleAnimationComplete = () => {
    if (result) setStep('EMAIL_GATE');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-dark skew-y-3 origin-top-left z-0"></div>
      <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
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
      </div>
    </div>
  );
};

export default AuditWizard;
