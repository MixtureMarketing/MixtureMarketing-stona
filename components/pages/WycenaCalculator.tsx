// Strona /wycena/ — publiczny kalkulator wyceny (f4b). Intro jest PRERENDEROWANE (SEO/pSEO);
// interaktywny kalkulator montuje się wyłącznie w przeglądarce (guard isPrerendering — w Puppeteerze
// nie ma żywego API, więc nie renderujemy stanu błędu do statycznego HTML).
import React from 'react';
import Seo from '../common/Seo';
import Container from '../common/Container';
import PublicCalculator from '../features/calculator/PublicCalculator';

const isPrerendering =
  typeof window !== 'undefined' &&
  (window.navigator.userAgent.includes('Headless') || window.isPrerendering === true);

const TRUST = [
  'Widełki z realnego modelu wyceny, nie z sufitu.',
  'Zero zobowiązań — dokładną ofertę ustalamy w rozmowie.',
  'Kilka pytań, kilka minut.',
];

const WycenaCalculator: React.FC = () => (
  <div className="bg-deep-dark text-white pt-20 min-h-screen font-sans">
    <Seo
      title="Kalkulator wyceny strony i aplikacji — Mixture Marketing"
      description="Policz orientacyjny koszt strony internetowej lub aplikacji w kilka minut. Widełki na podstawie realnego modelu wyceny — bez zobowiązań."
    />

    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none" />
      <Container className="relative z-10">
        <div className="max-w-3xl mb-10">
          <p className="text-sm uppercase tracking-wider text-primary/80 mb-3">Kalkulator wyceny</p>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Ile kosztuje <span className="text-primary">Twój projekt?</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Odpowiedz na kilka pytań o stronie lub aplikacji, którą masz w głowie — pokażemy
            orientacyjne widełki kosztu. To zgrubny przedział na start, nie wiążąca oferta.
          </p>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-400">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="max-w-2xl">
          {isPrerendering ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center text-gray-400">
              Kalkulator uruchomi się w Twojej przeglądarce.
            </div>
          ) : (
            <PublicCalculator />
          )}
        </div>
      </Container>
    </section>
  </div>
);

export default WycenaCalculator;
