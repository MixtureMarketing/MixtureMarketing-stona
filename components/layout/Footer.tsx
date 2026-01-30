import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { SITE_CONFIG } from '../../config/site';
import { FOOTER_CONTENT as CONTENT } from '../../data/content';

// Refactored Sub-components
import FooterBranding from './footer/FooterBranding';
import FooterLinks from './footer/FooterLinks';
import FooterSocials from './footer/FooterSocials';
import FooterTrustBox from './footer/FooterTrustBox';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { scrollToId } = useSmoothScroll();

  const handleScrollTo = (id: string) => {
    if (window.location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
    } else {
      scrollToId(id);
    }
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_CONFIG.companyName,
    image: SITE_CONFIG.domain + '/assets/images/logo.svg',
    '@id': SITE_CONFIG.domain,
    url: SITE_CONFIG.domain,
    telephone: SITE_CONFIG.contact.phoneFull,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.contact.address.street,
      addressLocality: SITE_CONFIG.contact.address.city,
      postalCode: SITE_CONFIG.contact.address.postalCode,
      addressCountry: SITE_CONFIG.contact.address.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 50.0411,
      longitude: 21.9991,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    sameAs: [
      SITE_CONFIG.social.linkedin,
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.instagram,
    ],
  };

  return (
    <footer className="relative bg-[#0B1120] text-white overflow-hidden pt-24 pb-12 border-t border-white/5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="absolute inset-0 bg-tech-grid opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          <FooterBranding about={CONTENT.about} />

          <FooterLinks
            title={CONTENT.columns.offer.title}
            links={CONTENT.columns.offer.links}
            showSparkles
            showCalculator
          />

          <FooterLinks
            title={CONTENT.columns.company.title}
            links={CONTENT.columns.company.links}
            onScroll={handleScrollTo}
          />

          <div className="lg:col-span-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8">
              {CONTENT.columns.community.title}
            </h3>
            <FooterSocials />
            <FooterTrustBox
              badge={CONTENT.trustBox.badge}
              text={CONTENT.trustBox.text}
              cta={CONTENT.trustBox.cta}
            />
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-300 text-xs font-medium">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.companyName} NIP:{' '}
            {SITE_CONFIG.contact.vatID}.
          </div>
          <div className="flex gap-8 text-xxs font-black uppercase tracking-widest text-gray-300">
            <span className="hover:text-white cursor-default transition-colors">
              {CONTENT.bottom.copy}
            </span>
            <span className="hover:text-white cursor-default transition-colors">
              {SITE_CONFIG.contact.address.city}, {SITE_CONFIG.contact.address.countryCode}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
