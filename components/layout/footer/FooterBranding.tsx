import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '../../../config/site';

interface FooterBrandingProps {
  about: string;
}

const FooterBranding: React.FC<FooterBrandingProps> = ({ about }) => {
  return (
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
      <p className="text-gray-300 text-base leading-relaxed mb-10 max-w-sm">{about}</p>

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
  );
};

export default FooterBranding;
