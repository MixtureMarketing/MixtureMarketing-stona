import React, { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Building2,
  Copy,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import Container from '../common/Container';
import HeroBadge from '../common/HeroBadge';
import InlineContactForm from '../features/contact/InlineContactForm';
import { SITE_CONFIG } from '../../config/site';
import { CONTACT_PAGE_CONTENT as CONTENT } from '../../data/content';

const ContactPage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopyNip = () => {
    navigator.clipboard.writeText(CONTENT.invoiceData.nip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contactMethods = [
    {
      icon: Phone,
      label: CONTENT.contactMethods.phone.label,
      value: SITE_CONFIG.contact.phone,
      action: `tel:${SITE_CONFIG.contact.phoneFull}`,
      sub: CONTENT.contactMethods.phone.sub,
      color: '#61B6DE',
    },
    {
      icon: Mail,
      label: CONTENT.contactMethods.email.label,
      value: SITE_CONFIG.contact.email,
      action: `mailto:${SITE_CONFIG.contact.email}`,
      sub: CONTENT.contactMethods.email.sub,
      color: '#3F3D91',
    },
    {
      icon: MapPin,
      label: CONTENT.contactMethods.office.label,
      value: SITE_CONFIG.contact.address.city,
      action: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${SITE_CONFIG.contact.address.street}, ${SITE_CONFIG.contact.address.city}`,
      )}`,
      sub: `${SITE_CONFIG.contact.address.street} · pracujemy mobilnie — dojazd do klienta`,
      color: '#00C853',
    },
  ];

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
      />

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 bg-deep-dark text-white overflow-hidden">
        <AmbientBackground />

        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <HeroBadge accent="primary" className="mb-6">
              {CONTENT.hero.badge}
            </HeroBadge>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              {CONTENT.hero.title.line1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {CONTENT.hero.title.line2}
              </span>
            </h1>
            <p className="text-gray-300 text-lg">{CONTENT.hero.description}</p>
          </div>
        </Container>
      </section>

      {/* --- MAIN CONTENT GRID --- */}
      <section className="py-24 bg-gray-50 relative z-10">
        <Container className="max-w-screen-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* LEFT: INLINE CONTACT FORM (BH2 — eliminuje "klik na modal" friction) */}
            <div className="lg:col-span-7">
              <AnimateOnScroll className="h-full">
                <InlineContactForm type="general" />
              </AnimateOnScroll>
            </div>

            {/* RIGHT: CONTACT INFO & DATA */}
            <div className="lg:col-span-5 space-y-8">
              {/* Contact Cards */}
              <div className="space-y-4">
                {contactMethods.map((method, i) => (
                  <AnimateOnScroll key={i} delay={i * 100}>
                    <a
                      href={method.action}
                      target={method.action.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all group"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                        style={{ backgroundColor: method.color }}
                      >
                        <method.icon size={24} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                          {method.label}
                        </div>
                        <div className="text-lg font-bold text-dark group-hover:text-primary transition-colors">
                          {method.value}
                        </div>
                        {method.sub && <div className="text-sm text-gray-700">{method.sub}</div>}
                      </div>
                    </a>
                  </AnimateOnScroll>
                ))}
              </div>

              {/* Invoice Data Block (Tech Style) */}
              <AnimateOnScroll delay={300}>
                <div className="bg-dark rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FileText size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6 text-primary">
                      <Building2 size={20} />
                      <span className="font-bold uppercase tracking-widest text-sm">
                        {CONTENT.invoiceData.title}
                      </span>
                    </div>

                    <div className="space-y-6 font-mono text-sm text-gray-300">
                      <div>
                        <div className="flex items-center gap-2 text-xxs text-gray-200 uppercase mb-1">
                          <Briefcase size={12} /> Nazwa Firmy
                        </div>
                        <div className="text-white font-bold text-lg">
                          {CONTENT.invoiceData.companyName}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xxs text-gray-200 uppercase mb-1">
                          <MapPin size={12} /> Adres Siedziby
                        </div>
                        <div>{CONTENT.invoiceData.address.street}</div>
                        <div>{CONTENT.invoiceData.address.city}</div>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xxs text-gray-200 uppercase mb-1">
                            <FileText size={12} /> {CONTENT.invoiceData.nipLabel}
                          </div>
                          <div className="text-white font-bold text-xl tracking-wider text-primary">
                            {CONTENT.invoiceData.nip}
                          </div>
                        </div>
                        <button
                          onClick={handleCopyNip}
                          className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-primary relative group"
                          title="Skopiuj NIP"
                        >
                          {copied ? (
                            <CheckCircle2 size={20} className="text-green-400" />
                          ) : (
                            <Copy size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ContactPage;
