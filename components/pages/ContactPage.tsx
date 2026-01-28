import React, { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Zap,
  Clock,
  ShieldCheck,
  ArrowRight,
  FileText,
  Building2,
  Copy,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import { useModal } from '../../context/ModalContext';
import { SITE_CONFIG } from '../../config/site';
import { CONTACT_PAGE_CONTENT as CONTENT } from '../../data/content';

const ContactPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { openModal } = useModal();

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
      action: '#',
      sub: SITE_CONFIG.contact.address.street,
      color: '#00C853',
    },
  ];

  const features = [
    {
      ...CONTENT.ctaCard.features[0],
      icon: Zap,
    },
    {
      ...CONTENT.ctaCard.features[1],
      icon: Clock,
    },
    {
      ...CONTENT.ctaCard.features[2],
      icon: ShieldCheck,
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
      <section className="relative py-20 bg-[#0B1120] text-white overflow-hidden">
        <AmbientBackground />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
              <MessageSquare size={14} /> {CONTENT.hero.badge}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              {CONTENT.hero.title.line1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {CONTENT.hero.title.line2}
              </span>
            </h1>
            <p className="text-gray-300 text-lg">{CONTENT.hero.description}</p>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT GRID --- */}
      <section className="py-24 bg-gray-50 relative z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* LEFT: CTA CARD (Replaces Form) */}
            <div className="lg:col-span-7">
              <AnimateOnScroll className="h-full">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 h-full relative overflow-hidden flex flex-col justify-center items-start">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none blur-3xl"></div>

                  <div className="relative z-10 w-full">
                    <h2 className="text-3xl font-bold text-dark mb-4">{CONTENT.ctaCard.title}</h2>
                    <p className="text-gray-700 text-lg mb-8 leading-relaxed max-w-lg">
                      {CONTENT.ctaCard.description}
                    </p>

                    <div className="space-y-4 mb-10">
                      {features.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-5 p-5 bg-[#F9FAFB] rounded-2xl border border-gray-100 hover:border-primary/30 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-secondary shrink-0">
                            <feature.icon size={24} />
                          </div>
                          <div>
                            <div className="font-bold text-dark text-lg">{feature.title}</div>
                            <div className="text-sm text-gray-500 font-medium">{feature.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => openModal('general')}
                      variant="primary"
                      className="w-full sm:w-auto justify-center px-8 py-4 text-lg shadow-xl shadow-secondary/20 hover:scale-105 transition-transform"
                      icon={<ArrowRight size={20} />}
                    >
                      {CONTENT.ctaCard.button}
                    </Button>
                    <p className="mt-4 text-xs text-gray-600 text-center sm:text-left">
                      {CONTENT.ctaCard.microCopy}
                    </p>
                  </div>
                </div>
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
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
