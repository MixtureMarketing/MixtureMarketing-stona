import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator, Cpu, ExternalLink } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import BaseCta from '../common/BaseCta';
import Container from '../common/Container';
import FounderCard from '../common/FounderCard';
import StickyMobileBar from '../common/StickyMobileBar';
import FaqSection from '../sections/FaqSection';
import { SITE_CONFIG } from '../../config/site';
import {
  AI_SYSTEMS_CONTENT as CONTENT,
  AI_SYSTEMS_PATH,
} from '../../data/content/services/web-development/ai-systems';

/**
 * Strona usługi „Systemy AI i aplikacje” (MIX-1272, plan SEO A18). UKRYTA do akceptacji Jakuba:
 * `noindex`, trasa tylko w `prerenderOnlyRoutes` (poza sitemapą) i brak w menu.
 * Publikacja: zdjąć `noindex`, przenieść trasę do `routes`, dodać link w menu i na /web-development/custom-app/
 * (patrz docs/tresci/MIX-1272.md).
 * Nazwy klientów w przykładach: dopiero po zgodzie (A17); `clientName` w danych jest dziś `null`.
 */
const AiSystemsApps: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  const openConsult = () => openModal('web', { specificType: 'custom' });

  return (
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        noindex
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Web Development', item: '/web-development/' },
          { name: 'Systemy AI i aplikacje', item: AI_SYSTEMS_PATH },
        ]}
        service={{
          name: 'Systemy AI i aplikacje dedykowane',
          description:
            'Aplikacje webowe i systemy z elementami AI budowane pod proces klienta: asystent w pracy, obieg zgłoszeń, platformy dla uczestników, panele i integracje. Płatność etapami, kod i prawa autorskie po stronie klienta.',
          serviceType: 'AI and Custom Application Development',
        }}
      />
      {/* FAQPage JSON-LD emituje wyłącznie FaqSection (StandardFaq), jak u sióstr; `faq=` w <Seo> zdublowałoby blok. */}

      <div ref={heroRef}>
        <StandardHero
          tone="dark"
          title={CONTENT.hero.title}
          description={CONTENT.hero.description}
          priceHint={CONTENT.hero.priceHint}
          trustLine={<HeroTrustLine tone="dark" />}
          ctaPrimaryText="Umów darmową rozmowę"
          ctaPrimaryOnClick={openConsult}
          ctaSecondaryText="Wyceń aplikację"
          ctaSecondaryOnClick={() => navigate('/wycena/')}
          ctaSecondaryIcon={Calculator}
          backLinkPath="/web-development/"
          backLinkLabel="Web Development"
        />
      </div>

      <section className="relative bg-white py-20 md:py-28" aria-labelledby="ai-offer">
        <Container>
          <div className="max-w-3xl">
            <h2
              id="ai-offer"
              className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl"
            >
              {CONTENT.offer.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.offer.description}
            </p>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
            {CONTENT.offer.items.map((item) => (
              <li key={item.title} className="flex items-start gap-4">
                <Cpu size={22} className="mt-1 shrink-0 text-secondary" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-dark md:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="relative bg-light-gray py-20 md:py-28" aria-labelledby="ai-cases">
        <Container>
          <div className="max-w-3xl">
            <h2
              id="ai-cases"
              className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl"
            >
              {CONTENT.casesSection.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.casesSection.description}
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {CONTENT.cases.map((c) => (
              <article
                key={c.id}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
              >
                <h3 className="text-xl font-extrabold tracking-tight text-dark">
                  {c.clientName ?? c.label}
                </h3>
                <dl className="mt-4 space-y-4 text-[15px] leading-relaxed text-gray-700">
                  <div>
                    <dt className="font-bold text-dark">Problem</dt>
                    <dd>{c.problem}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-dark">Rozwiązanie</dt>
                    <dd>{c.solution}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-dark">Technologie</dt>
                    <dd>{c.tech}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-dark">Etap</dt>
                    <dd>{c.stage}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <div className="mt-10 max-w-3xl">
            <h3 className="text-xl font-extrabold tracking-tight text-dark">
              {CONTENT.proof.title}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
              {CONTENT.proof.description}
            </p>
            <Link
              to={CONTENT.proof.linkTo}
              className="mt-4 inline-flex items-center gap-2 font-bold text-secondary underline-offset-4 hover:underline"
            >
              {CONTENT.proof.linkLabel}
              <ExternalLink size={16} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>

      <section className="relative bg-white py-20 md:py-28" aria-labelledby="ai-process">
        <Container>
          <div className="max-w-3xl">
            <h2
              id="ai-process"
              className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl"
            >
              {CONTENT.process.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.process.description}
            </p>
          </div>
          <ol className="mt-12 divide-y divide-gray-100 rounded-3xl border border-gray-200 bg-white shadow-sm">
            {CONTENT.process.steps.map((step, i) => (
              <li key={step.title} className="flex gap-6 px-6 py-8 md:gap-10 md:px-10">
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-3xl leading-none font-extrabold tracking-tight text-primary/80 tabular-nums md:text-4xl"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-balance text-dark md:text-xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-gray-700">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="relative bg-light-gray py-20 md:py-28" aria-labelledby="ai-quality">
        <Container>
          <h2
            id="ai-quality"
            className="max-w-3xl text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl"
          >
            {CONTENT.quality.title}
          </h2>
          <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {CONTENT.quality.items.map((item) => (
              <li key={item.title}>
                <h3 className="text-lg font-extrabold tracking-tight text-dark">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <FaqSection title="Najczęstsze pytania" items={CONTENT.faqs} bgClassName="bg-white" />

      <section className="bg-light-gray py-20" aria-labelledby="ai-related">
        <Container>
          <div className="mx-auto mb-12 max-w-4xl">
            <FounderCard
              intro="Z kim pracujesz"
              bio={
                <>
                  Prowadzę projekty dedykowane od analizy biznesowej po wdrożenie. To ze mną
                  rozmawiasz na każdym etapie, bez handlowca-pośrednika. Koduje nasz zespół
                  developerów. Jeden punkt kontaktu, zero głuchego telefonu.
                </>
              }
            />
          </div>
          <div className="mx-auto max-w-5xl">
            <h2
              id="ai-related"
              className="mb-8 text-center text-2xl font-bold text-dark md:text-3xl"
            >
              {CONTENT.related.title}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {CONTENT.related.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-primary/40"
                  >
                    <span className="flex items-center gap-2 font-bold text-dark">
                      {item.label}
                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                        className="transition group-hover:translate-x-1"
                      />
                    </span>
                    <span className="mt-1 text-sm text-gray-700">{item.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <div ref={finalCtaRef}>
        <BaseCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.description}
          buttonText={CONTENT.cta.button}
          icon={Cpu}
          onClick={openConsult}
          variant="dark"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Darmowa rozmowa"
        sublabel="Wstępne widełki w 24h"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={openConsult}
      />
    </div>
  );
};

export default AiSystemsApps;
