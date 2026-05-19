import React, { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Mail, LayoutDashboard, Phone, Sparkles } from 'lucide-react';
import Seo from '../../common/Seo';
import Container from '../../common/Container';
import AmbientBackground from '../../common/AmbientBackground';
import { trackEvent } from '../../../utils/analytics';

const PANEL_URL = 'https://panel.mixturemarketing.pl/login';

const AbonamentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sid');
  const tracked = useRef(false);

  // GA4 purchase event — odpalany raz po wejściu na success page
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent('purchase', {
      transaction_id: sessionId || 'unknown',
      currency: 'PLN',
      // UTM params zachowane w sessionStorage z modalu
      utm_source: searchParams.get('utm_source') || undefined,
      utm_medium: searchParams.get('utm_medium') || undefined,
      utm_campaign: searchParams.get('utm_campaign') || undefined,
    });
  }, [sessionId, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      <Seo
        title="Płatność zaakceptowana — startujemy"
        description="Twoja subskrypcja Strona w abonamencie jest aktywna. Sprawdź skrzynkę email — wysłaliśmy magic link do panelu klienta."
        canonical="/abonament/dziekujemy/"
        lcpImage="/assets/images/sygnet.png"
        noindex
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Strona w abonamencie', item: '/abonament/' },
          { name: 'Dziękujemy', item: '/abonament/dziekujemy/' },
        ]}
      />

      <AmbientBackground />

      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-gray-50 to-blue-50/30 pointer-events-none" />
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-8 shadow-lg">
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles size={14} />
              <span>Subskrypcja aktywna</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-dark leading-tight mb-6">
              Płatność{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-700">
                zaakceptowana
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed mb-12 max-w-2xl mx-auto">
              Twoja strona będzie gotowa w&nbsp;<strong className="text-dark">24 godziny</strong>.
              Zobacz co dalej.
            </p>
          </div>

          {/* Next steps */}
          <div className="max-w-3xl mx-auto space-y-4 mb-12">
            {[
              {
                icon: Mail,
                title: 'Sprawdź skrzynkę email',
                desc: 'Wysłaliśmy magic link do Twojego panelu klienta — bez hasła, jednym kliknięciem.',
              },
              {
                icon: LayoutDashboard,
                title: 'Wypełnij wizard onboardingu',
                desc: 'Godziny pracy, usługi, opinie, obszar działania — 5 minut w panelu.',
              },
              {
                icon: CheckCircle2,
                title: 'Strona live w 24h',
                desc: 'Dostaniesz email "Twoja strona jest live pod twojafirma.pl" + link do panelu.',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                  <step.icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xxs font-black uppercase tracking-[0.2em] text-gray-400">
                      Krok {i + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-dark mb-1">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={PANEL_URL}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold rounded-full shadow-lg hover:shadow-[0_8px_25px_-5px_rgba(4,120,87,0.5)] motion-safe:hover:-translate-y-1 transition-all"
              >
                <LayoutDashboard size={18} />
                Otwórz panel klienta
                <ArrowRight size={18} />
              </a>
              <a
                href="mailto:info@mixturemarketing.pl?subject=Zaplanuj%20konsultacje%20po%20zakupie"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold rounded-full transition-all"
              >
                Zaplanuj rozmowę z konsultantem
              </a>
            </div>

            {sessionId && (
              <p className="text-center text-xs text-gray-400 mt-8 font-mono break-all">
                Stripe session: {sessionId}
              </p>
            )}

            {/* Help footer */}
            <div className="mt-16 pt-8 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-3">Nie dostałeś emaila? Sprawdź spam lub:</p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <a
                  href="mailto:info@mixturemarketing.pl"
                  className="inline-flex items-center gap-2 text-emerald-700 hover:underline font-semibold"
                >
                  <Mail size={16} /> info@mixturemarketing.pl
                </a>
                <span className="text-gray-300">·</span>
                <a
                  href="tel:+48794443551"
                  className="inline-flex items-center gap-2 text-emerald-700 hover:underline font-semibold"
                >
                  <Phone size={16} /> +48 794 443 551
                </a>
                <span className="text-gray-300">·</span>
                <Link
                  to="/abonament/"
                  className="text-gray-500 hover:text-emerald-700 font-semibold"
                >
                  Wróć do oferty
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default AbonamentSuccess;
