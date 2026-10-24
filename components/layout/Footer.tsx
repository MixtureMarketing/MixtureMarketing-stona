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
import Container from '../common/Container';

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

  return (
    <footer className="relative bg-[#0B1120] text-white overflow-hidden pt-24 pb-12 border-t border-white/5">
      {/* JSON-LD firmy NIE tutaj — jedna encja #organization emitowana w App.tsx (GlobalSchema). */}
      <div className="absolute inset-0 bg-tech-grid opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          <FooterBranding about={CONTENT.about} />

          <FooterLinks
            title={CONTENT.columns.offer.title}
            links={CONTENT.columns.offer.links}
            showSparkles
            showCalculator
          />

          <FooterLinks title={CONTENT.columns.local.title} links={CONTENT.columns.local.links} />

          <FooterLinks
            title={CONTENT.columns.company.title}
            links={CONTENT.columns.company.links}
            onScroll={handleScrollTo}
          />

          <div className="lg:col-span-3">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8">
              {CONTENT.columns.community.title}
            </p>
            <FooterSocials />
            <FooterTrustBox
              badge={CONTENT.trustBox.badge}
              text={CONTENT.trustBox.text}
              cta={CONTENT.trustBox.cta}
            />
          </div>
        </div>

        {/* Pelne dane prawne sp. z o.o. — trust signal dla B2B (PL) + RODO */}
        <div className="pt-12 border-t border-white/5">
          <div className="grid md:grid-cols-2 gap-6 text-gray-300 text-xs font-medium mb-6">
            <div className="space-y-1">
              <p className="font-bold text-white text-sm mb-2">{SITE_CONFIG.companyName}</p>
              <p>
                {SITE_CONFIG.contact.address.street},<br />
                {SITE_CONFIG.contact.address.postalCode} {SITE_CONFIG.contact.address.city},{' '}
                {SITE_CONFIG.contact.address.country}
              </p>
              <p className="pt-1">
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {SITE_CONFIG.contact.email}
                </a>
                {' · '}
                <a
                  href={`tel:${SITE_CONFIG.contact.phoneFull}`}
                  className="hover:text-white transition-colors"
                >
                  {SITE_CONFIG.contact.phone}
                </a>
              </p>
            </div>
            <div className="space-y-1 md:text-right">
              <p>
                NIP: <span className="text-white font-mono">{SITE_CONFIG.contact.vatID}</span>
              </p>
              <p>
                KRS: <span className="text-white font-mono">{SITE_CONFIG.contact.krs}</span>
              </p>
              <p>
                REGON: <span className="text-white font-mono">{SITE_CONFIG.contact.regon}</span>
              </p>
              <p className="pt-1 text-gray-400">{SITE_CONFIG.contact.registryCourt}</p>
              <p className="text-gray-400">Kapitał zakładowy: {SITE_CONFIG.contact.shareCapital}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xxs font-black uppercase tracking-widest text-gray-400 pt-4 border-t border-white/5">
            <span>
              &copy; {new Date().getFullYear()} {SITE_CONFIG.companyName}
            </span>
            <div className="flex gap-6">
              <span>{CONTENT.bottom.copy}</span>
              <span>
                {SITE_CONFIG.contact.address.city}, {SITE_CONFIG.contact.address.countryCode}
              </span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
