import React from 'react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { WEB_DEV_CONTENT } from '../../../data/content';

/**
 * Sekcja „Ekosystem, nie samotna wyspa" — szyna przepływu zamówienia.
 *
 * Redesign 2026-07-15. Było: cztery identyczne karty ikona+nagłówek+tagi — czwarta
 * taka siatka na tej stronie („identical card grids" z listy absolutnych zakazów).
 * Gorzej niż brzydko: forma ilustrowała cztery odizolowane pudełka pod nagłówkiem
 * „nie samotna wyspa", czyli mówiła dokładnie odwrotnie niż copy.
 *
 * Prawda o tej treści: to nie są kategorie do wyboru, tylko ETAPY JEDNEJ DROGI.
 * Klient płaci → dane lecą do CRM → zamówienie ląduje w ERP → paczka idzie do
 * kuriera. Forma to pokazuje: jedna szyna, cztery przystanki.
 *
 * Ruch (The Motion Has A Job Rule): scroll RYSUJE szynę od Twojego serwisu na
 * zewnątrz. Ruch JEST tezą — „strona zaczyna rozmawiać z resztą biznesu" dzieje się
 * na oczach, zamiast być zadeklarowane. Bez tego ruchu połączenie jest tylko
 * napisane. Spoczynek = var(--p, 1) → szyna narysowana w całości, wszystkie
 * przystanki czytelne (prerender / no-JS / reduced-motion).
 *
 * Mechanizm: scaleX na pasku + transform-origin left. Zero SVG, zero biblioteki,
 * zero nowego JS (useSectionProgress jest już w bundlu). Nazwy systemów zostają
 * realnym DOM-em — zaznaczalne i czytane przez czytnik ekranu, nie tekstem w SVG.
 *
 * Rejestr JASNY: The Ciemnia Rule — nie ma tu zrzutu ani logo klienta, więc nie ma
 * powodu na granat.
 *
 * Kolor: jeden prąd (błękit). Cztery kolory kategorii wypadły i to nie jest strata —
 * nic nie znaczyły. Sekwencja ma jeden kolor, bo jest jednym przepływem.
 *
 * LOGOTYPY: świadomie nie. Nie mamy praw do znaków Stripe/InPost/Subiekt, a nawet
 * gdybyśmy mieli — ściana cudzych logotypów to „trusted by" z anty-referencji
 * SaaS-cream. Nazwa tekstem jest sprawdzalna i uczciwa.
 */
const WebDevEcosystem: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);
  const { origin, flow } = WEB_DEV_CONTENT.integrations;

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-20 md:py-24">
      <Container className="relative z-10">
        <div
          className="max-w-2xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {WEB_DEV_CONTENT.integrations.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            {WEB_DEV_CONTENT.integrations.description}
          </p>
        </div>

        <div className="relative mt-14 md:mt-16">
          {/* Szyna. Poziomo od desktopu, pionowo na mobile — droga zamówienia
              nie znika przy zwężeniu, tylko zmienia oś. */}
          <div
            className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200 md:left-0 md:right-0 md:top-[7px] md:bottom-auto md:h-px md:w-auto"
            aria-hidden="true"
          />
          {/* Warstwa rysująca. Dwie osobne, bo oś się zmienia: mobile rysuje w dół
              (scaleY), desktop w prawo (scaleX). Jedna warstwa z md: nie wystarczy —
              scaleY na poziomej szynie skalowałoby jej grubość, nie długość.
              Spoczynek = var(--p, 1) = 1 = szyna narysowana w całości. */}
          <div
            className="absolute left-[7px] top-2 bottom-2 w-px origin-top bg-primary md:hidden"
            style={{ transform: 'scaleY(var(--p, 1))' }}
            aria-hidden="true"
          />
          <div
            className="absolute left-0 right-0 top-[7px] hidden h-px origin-left bg-primary md:block"
            style={{ transform: 'scaleX(var(--p, 1))' }}
            aria-hidden="true"
          />

          <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
            {flow.map((step, i) => (
              <li key={step.stage} className="relative pl-8 md:pl-0">
                <span
                  className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-primary shadow-[0_0_0_2px_rgba(97,182,222,0.35)] md:left-0 md:top-0"
                  aria-hidden="true"
                />
                <div className="md:pt-8">
                  <p className="text-xs font-bold tracking-wide text-accent-dark">
                    {String(i + 1).padStart(2, '0')} · {step.stage}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                    {step.tools.map((t) => (
                      <li key={t} className="text-sm font-bold text-dark">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          {/* Punkt startowy szyny — to Twój serwis jest źródłem przepływu. */}
          <p className="mt-10 pl-8 text-sm text-gray-700 md:mt-8 md:pl-0">
            Start: <span className="font-bold text-dark">{origin}</span>. Każdy z tych systemów
            wpinamy przez API — bez przepisywania danych ręcznie.
          </p>
        </div>
      </Container>
    </section>
  );
};

export default WebDevEcosystem;
