import React, { useEffect } from 'react';
import {
  Linkedin,
  Facebook,
  Instagram,
  Music,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Organization } from 'schema-dts';
import { COLORS } from '../../types';
import { SITE_CONFIG } from '../../config/site';
import { FOOTER_CONTENT as CONTENT } from '../../data/content';

const TikTokIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="m195.19 512c-37.27 0-72.42-11.89-101.65-34.39-5.46-4.2-10.71-8.79-15.61-13.63-34.12-33.72-51.29-78.63-48.34-126.46 2.23-36.15 16.79-71 41.02-98.13 32.09-35.93 76.33-55.72 124.59-55.72 8.29 0 16.66.62 24.9 1.84l12.8 1.9v113.59l-19.71-6.51c-5.74-1.9-11.71-2.86-17.75-2.86-15.26 0-29.55 5.98-40.24 16.83-10.64 10.8-16.37 25.08-16.15 40.23.29 19.53 10.58 37.23 27.52 47.37 7.8 4.66 16.68 7.39 25.7 7.89 7.12.39 14.15-.54 20.91-2.77 23.11-7.63 38.64-29.07 38.64-53.34l.1-117.8v-230.04h108.56l.13 14.86c.06 6.73.75 13.46 2.05 19.98 5.1 25.64 19.48 48.49 40.49 64.33 18.65 14.07 40.91 21.5 64.35 21.5.55 0 .55 0 5.56.35l13.95.98v92 15l-5-.01h-9.97c-.08 0-.16 0-.25 0h-4.79c-.02 0-.05 0-.08 0-28.91 0-56-5.51-82.85-16.84-8-3.38-15.79-7.24-23.31-11.55l.34 147.81c-.18 43.72-17.46 84.73-48.65 115.56-25.31 25.01-57.25 40.99-92.37 46.19-8.19 1.22-16.56 1.84-24.89 1.84zm0-298.33c-39.59 0-75.89 16.23-102.21 45.7-19.76 22.13-31.64 50.54-33.46 79.99-2.4 39.05 11.62 75.73 39.49 103.27 4.03 3.98 8.34 7.75 12.82 11.2 23.94 18.43 52.77 28.17 83.36 28.17 6.86 0 13.75-.51 20.5-1.51 28.77-4.26 54.94-17.35 75.68-37.85 25.48-25.18 39.59-58.65 39.74-94.25l-.47-206.39 24.23 18.69c12.51 9.65 26.27 17.67 40.88 23.84 19.97 8.43 40.1 13.11 61.25 14.22v-48.45c-26.14-1.96-50.83-11.25-71.92-27.16-26.9-20.28-45.31-49.56-51.85-82.43-.7-3.53-1.27-7.1-1.69-10.7h-49.63v200.04l-.1 117.8c0 37.23-23.8 70.11-59.23 81.81-10.33 3.41-21.08 4.83-31.96 4.24-13.86-.76-27.5-4.95-39.46-12.1-25.93-15.51-41.68-42.68-42.12-72.67-.34-23.24 8.45-45.16 24.77-61.73 16.37-16.62 38.25-25.77 61.61-25.77 2.5 0 4.98.11 7.46.32v-48.07c-2.56-.14-5.13-.21-7.69-.21z" />
  </svg>
);

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleScrollTo = (id: string) => {
    navigate('/', { state: { scrollTo: id } });
  };

  return (
    <footer className="relative bg-[#0B1120] text-white overflow-hidden pt-24 pb-12 border-t border-white/5">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-tech-grid opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          {/* Column 1: Branding & Contact (4 cols) */}
          <div className="lg:col-span-4">
            <div className="flex items-center mb-8">
              <img
                src="/assets/images/logo.svg"
                alt={`${SITE_CONFIG.name} Logo`}
                className="h-10 w-auto brightness-0 invert"
                width="102"
                height="40"
              />
            </div>
            <p className="text-gray-300 text-base leading-relaxed mb-10 max-w-sm">
              {CONTENT.about}
            </p>

            <div className="space-y-5">
              <a
                href={`tel:${SITE_CONFIG.contact.phoneFull}`}
                className="flex items-center gap-4 group text-gray-300 hover:text-primary transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                  <Phone size={18} className="text-primary" />
                </div>
                <span className="font-bold">{SITE_CONFIG.contact.phone}</span>
              </a>
              <a
                href={`mailto:${SITE_CONFIG.contact.email}`}
                className="flex items-center gap-4 group text-gray-300 hover:text-primary transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                  <Mail size={18} className="text-primary" />
                </div>
                <span className="font-bold">{SITE_CONFIG.contact.email}</span>
              </a>
              <div className="flex items-start gap-4 text-gray-300">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-gray-300" />
                </div>
                <div className="text-sm">
                  {SITE_CONFIG.contact.address.street}
                  <br />
                  {SITE_CONFIG.contact.address.postalCode} {SITE_CONFIG.contact.address.city},{' '}
                  {SITE_CONFIG.contact.address.country}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Offer (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
              <Sparkles size={14} className="text-primary" /> {CONTENT.columns.offer.title}
            </h3>
            <ul className="space-y-4 text-gray-300 text-sm font-medium">
              {CONTENT.columns.offer.links.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
                    />{' '}
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/offers#calculator"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight
                    size={12}
                    className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
                  />{' '}
                  Kalkulator Wycen
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8">
              {CONTENT.columns.company.title}
            </h3>
            <ul className="space-y-4 text-gray-300 text-sm font-medium">
              {CONTENT.columns.company.links.map((link, i) => (
                <li key={i}>
                  {link.type === 'scroll' ? (
                    <button
                      onClick={() => handleScrollTo(link.path)}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link to={link.path} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Social & Trust (4 cols) */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8">
              {CONTENT.columns.community.title}
            </h3>
            <div className="flex space-x-4 mb-10">
              <a
                href={SITE_CONFIG.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#0077b5] hover:shadow-[0_0_20px_rgba(0,119,181,0.4)] transition-all group"
              >
                <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#1877f2] hover:shadow-[0_0_20px_rgba(24,119,242,0.4)] transition-all group"
              >
                <Facebook size={20} className="group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#e1306c] hover:shadow-[0_0_20px_rgba(225,48,108,0.4)] transition-all group"
              >
                <Instagram size={20} className="group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={SITE_CONFIG.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#000000] hover:shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all group"
              >
                <TikTokIcon size={20} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>

            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-dark to-secondary border border-white/10 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-primary text-xxs font-black uppercase tracking-widest mb-2">
                  <ShieldCheck size={12} /> {CONTENT.trustBox.badge}
                </div>
                <p className="text-xs text-white/80 leading-relaxed mb-4">
                  {CONTENT.trustBox.text}
                </p>
                <Link
                  to="/contact/"
                  className="inline-flex items-center gap-2 text-sm font-bold text-white hover:underline underline-offset-4 transition-all"
                >
                  {CONTENT.trustBox.cta} <ArrowRight size={14} />
                </Link>
              </div>
              {/* Decoration */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            </div>
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
