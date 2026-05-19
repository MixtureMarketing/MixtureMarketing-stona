import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import {
  Terminal,
  Calculator,
  Activity,
  CreditCard,
  Megaphone,
  Database,
  Truck,
} from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import { useModal } from '../../context/ModalContext';
import TechStack from '../sections/TechStack';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import { WEB_DEV_CONTENT } from '../../data/content';
import RelatedArticles from '../articles/RelatedArticles';
import StandardHero from '../common/StandardHero';
import BaseCta from '../common/BaseCta';
import IntegrationGrid from '../common/IntegrationGrid';
import Container from '../common/Container';
import { WebDevHeroVisual } from '../visuals/hero/WebDevVisual';

// Refactored Sub-components
import WebDevProjectTypes from '../features/web-development/WebDevProjectTypes';
import WebDevWpCustom from '../features/web-development/WebDevWpCustom';
import WebDevAdminPanel from '../features/web-development/WebDevAdminPanel';
import WebDevInfrastructure from '../features/web-development/WebDevInfrastructure';
import WebDevComparison from '../features/web-development/WebDevComparison';
import FaqSection from '../sections/FaqSection';

const WebDevelopment: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const integrationCategories = React.useMemo(() => {
    const icons = [
      <CreditCard key="payments" size={20} />,
      <Megaphone key="marketing" size={20} />,
      <Database key="erp" size={20} />,
      <Truck key="logistics" size={20} />,
    ];
    return WEB_DEV_CONTENT.integrations.categories.map((cat, index) => ({
      ...cat,
      icon: icons[index],
    }));
  }, []);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={WEB_DEV_CONTENT.seo.title}
        description={WEB_DEV_CONTENT.seo.description}
        image={WEB_DEV_CONTENT.seo.image}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: 'Web Development',
            provider: {
              '@type': 'Organization',
              name: 'Mixture Marketing',
              url: 'https://mixturemarketing.pl',
              logo: 'https://mixturemarketing.pl/assets/images/sygnet.png',
            },
            areaServed: 'PL',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Usługi Programistyczne',
              itemListElement: WEB_DEV_CONTENT.projectTypes.map((type) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: type.title,
                  url: `https://mixturemarketing.pl${type.path}`,
                  description: type.desc,
                },
              })),
            },
          },
        ]}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={WEB_DEV_CONTENT.hero.badge}
        badgeIcon={Terminal}
        title={{ line1: WEB_DEV_CONTENT.hero.title, line2: WEB_DEV_CONTENT.hero.titleAccent }}
        description={WEB_DEV_CONTENT.hero.description}
        ctaPrimaryText="Umów się na konsultację"
        ctaPrimaryOnClick={() => openModal('web')}
        ctaSecondaryText="Wyceń projekt"
        ctaSecondaryOnClick={() => navigate('/offers#calculator?type=webApp')}
        ctaSecondaryIcon={Calculator}
        backLinkPath="/"
        backLinkLabel="System.Return_To_Home()"
        visual={<WebDevHeroVisual />}
      />

      <section className="bg-light-gray pb-24">
        <Container className="relative z-10">
          <div className="pt-10 border-t border-gray-200/60 flex flex-wrap gap-x-8 gap-y-4 justify-center lg:justify-start">
            {['Next.js', 'React', 'TypeScript', 'WordPress Headless', 'Laravel', 'AWS Cloud'].map(
              (tech) => (
                <span
                  key={tech}
                  className="text-xs font-bold font-mono tracking-wider text-gray-600 hover:text-dark transition-colors flex items-center gap-2 cursor-default"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> {tech}
                </span>
              ),
            )}
          </div>
        </Container>
      </section>

      <WebDevProjectTypes />

      <TechStack />

      <WebDevWpCustom />

      <WebDevAdminPanel />

      {/* --- ECOSYSTEM & INTEGRATIONS --- */}
      <section className="py-24 bg-light-gray relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>
        <Container className="relative z-10 text-center">
          <SectionHeader
            title={WEB_DEV_CONTENT.integrations.title}
            description={WEB_DEV_CONTENT.integrations.description}
            className="mb-16"
          />
          <LazyHydrate whenVisible>
            <IntegrationGrid categories={integrationCategories} />
          </LazyHydrate>
        </Container>
      </section>

      <WebDevInfrastructure />

      <WebDevComparison />

      {/* --- FAQ --- */}
      <FaqSection
        title={WEB_DEV_CONTENT.faq.title}
        subtitle={WEB_DEV_CONTENT.faq.subtitle}
        items={WEB_DEV_CONTENT.faqs}
      />

      {/* --- LOKALNY LANDING — LINK DO SPOKE RZESZÓW --- */}
      <Container className="py-12">
        <Link
          to="/web-development/rzeszow/"
          className="group block bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-2xl p-6 md:p-8 transition-colors"
        >
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-700 flex-shrink-0">
              <MapPin size={28} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                Lokalna oferta
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-dark mb-1 group-hover:text-primary transition-colors">
                Tworzenie stron internetowych dla firm z Rzeszowa →
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                Dedykowany cennik, lokalne case studies, spotkania w biurze przy Al. Piłsudskiego
                17/4.
              </p>
            </div>
          </div>
        </Link>
      </Container>

      {/* --- RELATED ARTICLES --- */}
      <LazyHydrate minHeight="600px">
        <RelatedArticles category="web" layout="service" />
      </LazyHydrate>

      {/* --- FINAL CTA --- */}
      <BaseCta
        title={WEB_DEV_CONTENT.ctaSection.title}
        description={WEB_DEV_CONTENT.ctaSection.description}
        buttonText={WEB_DEV_CONTENT.ctaSection.buttonText}
        icon={Activity}
        onClick={() => openModal('consultation')}
        variant="gradient"
      />
    </div>
  );
};

export default WebDevelopment;
