import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../common/Seo';
import Container from '../common/Container';
import Button, { buttonClassName } from '../common/Button';
import { useModal } from '../../context/ModalContext';
import { isConfigLinkEnabled } from '../features/calculator/livePrice';
import { getPathBreadcrumbs } from '../../config/breadcrumbs';
import { buildFaqSchema } from '../../utils/seo/commonSchemas';
import { CENNIK_CONTENT as CONTENT, CENNIK_PATH } from '../../data/content/pages/cennik';

/**
 * /cennik/ (MIX-1855): widełki „od” dla stron WWW, kampanii, SEO i designu oraz FAQ z JSON-LD.
 * Trasa istnieje tylko przy VITE_MM_CENNIK=1 (config/routes.tsx). Strona celowo lekka: sam tekst,
 * bez obrazów, bez framer-motion, bez LazyHydrate (nic nie jest ukryte przed pierwszym malowaniem).
 * Link do kalkulatora wyceny tylko przy włączonym konfiguratorze (isConfigLinkEnabled).
 */
const Cennik: React.FC = () => {
  const { openModal } = useModal();
  const calculatorOn = isConfigLinkEnabled();
  const openContact = () => openModal('general', { specificType: 'cennik' });

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        canonical={CENNIK_PATH}
        image={CONTENT.seo.image}
        breadcrumbs={getPathBreadcrumbs(CENNIK_PATH)}
        // Bez speakable: selektory itemprop wskazywałyby w próżnię (jak na /web-development/rzeszow/).
        jsonLd={buildFaqSchema(
          CONTENT.faqs.map((f) => ({ question: f.q, answer: f.a })),
          { speakable: null },
        )}
      />

      <div className="bg-deep-dark text-white pt-40 pb-16">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              {CONTENT.hero.title}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl">{CONTENT.hero.lead}</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Button onClick={openContact}>{CONTENT.hero.cta}</Button>
              {calculatorOn && (
                <Link to="/wycena/" className={buttonClassName('white')}>
                  {CONTENT.hero.calculatorCta}
                </Link>
              )}
            </div>
          </div>
        </Container>
      </div>

      <section className="py-16" aria-label="Widełki cen usług">
        <Container>
          <p className="text-gray-700 max-w-3xl mb-12">{CONTENT.disclaimer}</p>
          <div className="space-y-16">
            {CONTENT.groups.map((group) => (
              <section key={group.id} aria-labelledby={`cennik-${group.id}`}>
                <h2 id={`cennik-${group.id}`} className="text-3xl font-extrabold mb-3">
                  {group.title}
                </h2>
                <p className="text-gray-700 max-w-3xl mb-8">{group.intro}</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {group.items.map((item) => (
                    <li
                      key={item.name}
                      className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col"
                    >
                      <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                      <p className="text-gray-700 leading-relaxed mb-4 grow">{item.desc}</p>
                      <p className="text-2xl font-extrabold text-secondary">{item.price}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 bg-white" aria-labelledby="cennik-faq">
        <Container>
          <h2 id="cennik-faq" className="text-3xl font-extrabold mb-10">
            {CONTENT.faqTitle}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 max-w-6xl">
            {CONTENT.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="text-xl font-bold mb-2">{f.q}</h3>
                <p className="text-gray-700 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 bg-deep-dark text-white">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold mb-4">{CONTENT.finalCta.title}</h2>
            <p className="text-gray-300 mb-8">{CONTENT.finalCta.text}</p>
            <Button onClick={openContact}>{CONTENT.finalCta.button}</Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Cennik;
