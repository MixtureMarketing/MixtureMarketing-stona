/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, ArrowRight, ShieldCheck, Zap, AlertTriangle, X } from 'lucide-react';
import { auditService, AuditResult } from '../../../services/auditService';
import Button from '../../common/Button';

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
  const [placeId, setPlaceId] = useState('');
  const [url, setUrl] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const deepLinkUrl = params.get('url');
    return deepLinkUrl ? decodeURIComponent(deepLinkUrl) : '';
  });
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autoCompleteRef = React.useRef<HTMLInputElement>(null);

  const fetchExistingAudit = React.useCallback(async (id: string) => {
    setError(null);
    try {
      const response = await auditService.getAuditResult(id);
      setResult(response.data);
      if (response.meta?.email) {
        setEmail(response.meta.email as string);
      }
      // Skip email gate for existing reports
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
        const data = await auditService.runAudit(targetUrl, competitorUrl, placeId, true);
        setResult(data);
      } catch (err) {
        console.error(err);
        setError('Nie udało się przeprowadzić audytu. Sprawź adres URL i spróbuj ponownie.');
        setStep('INPUT');
      }
    },
    [competitorUrl, placeId],
  );

  // Handle Deep Linking (URL param)
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
    startScanning(url);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep('RESULT');
  };

  const handleAnimationComplete = () => {
    if (result) {
      setStep('EMAIL_GATE');
    }
  };

  // ... (initAutocomplete and load script useEffect remain same as before) ...

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-dark skew-y-3 origin-top-left z-0"></div>

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 'INPUT' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Side: Features/Trust (Same as before) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-dark to-secondary p-12 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-blue-200 font-bold text-xs uppercase tracking-widest mb-8">
                      <Zap size={14} className="text-yellow-400" /> Mixture Digital Audit 360™
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                      Poznaj prawdę o swojej <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C853] to-emerald-400">
                        stronie WWW
                      </span>
                    </h1>
                    <div className="space-y-6">
                      {[
                        {
                          icon: Zap,
                          title: 'Wydajność',
                          desc: 'Testujemy Core Web Vitals i szybkość ładowania.',
                        },
                        {
                          icon: Search,
                          title: 'SEO',
                          desc: 'Sprawdzamy widoczność w Google i strukturę treści.',
                        },
                        {
                          icon: ShieldCheck,
                          title: 'Bezpieczeństwo',
                          desc: 'Weryfikacja SSL i standardów ochrony danych.',
                        },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                            <item.icon size={24} className="text-success" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                            <p className="text-sm text-blue-200/80">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: URL Form */}
                <div className="lg:col-span-7 p-8 md:p-16">
                  <div className="max-w-xl mx-auto">
                    <div className="mb-10">
                      <h2 className="text-3xl font-black text-dark mb-2">
                        Rozpocznij darmowy audyt
                      </h2>
                      <p className="text-gray-500 font-medium">
                        Podaj adres strony, którą chcesz przeanalizować.
                      </p>
                    </div>

                    <form onSubmit={handleUrlSubmit} className="space-y-6">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                            Adres strony WWW
                          </label>
                          <div className="relative group">
                            <Globe
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors"
                              size={20}
                            />
                            <input
                              type="text"
                              placeholder="np. twoja-strona.pl"
                              className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-gray-100 focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all text-lg font-medium"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                            Nazwa Firmy (Opcjonalnie)
                          </label>
                          <div className="relative group">
                            <Search
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors"
                              size={20}
                            />
                            <input
                              ref={autoCompleteRef}
                              type="text"
                              placeholder="Wyszukaj firmę w Google..."
                              className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-gray-100 focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all text-lg font-medium"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2 border border-red-100">
                          <AlertTriangle size={18} /> {error}
                        </div>
                      )}

                      <div className="pt-4">
                        <Button className="w-full h-16 text-xl justify-center shadow-2xl shadow-[#00C853]/20 hover:scale-[1.02] transition-all rounded-2xl">
                          Sprawdź błędy <ArrowRight className="ml-2" />
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'SCANNING' && (
            <AuditProgress
              targetUrl={url}
              onComplete={handleAnimationComplete}
              isDataReady={!!result}
            />
          )}

          {step === 'EMAIL_GATE' && (
            <motion.div
              key="email-gate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00C853] to-emerald-400"></div>

              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShieldCheck size={40} className="text-success" />
              </div>

              <h2 className="text-3xl font-black text-dark mb-4">Analiza zakończona!</h2>
              <p className="text-gray-600 mb-10 text-lg">
                Twój raport PDF jest gotowy do pobrania. Podaj e-mail, na który mamy go wysłać.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <input
                  type="email"
                  placeholder="twoj@email.pl"
                  className="w-full px-8 py-5 rounded-2xl border-2 border-gray-100 focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all text-xl font-medium text-center"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <Button className="w-full h-16 text-xl justify-center rounded-2xl">
                  Pokaż raport i wyślij PDF <ArrowRight className="ml-2" />
                </Button>
                <p className="text-xxs text-gray-400 uppercase font-bold tracking-widest">
                  Nie wysyłamy spamu. Tylko Twój darmowy raport.
                </p>
              </form>
            </motion.div>
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
                email={email}
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
