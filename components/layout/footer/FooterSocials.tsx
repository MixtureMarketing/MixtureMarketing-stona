import React from 'react';
import { Linkedin, Facebook, Instagram } from 'lucide-react';
import { SITE_CONFIG } from '../../../config/site';

const TikTokIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const FooterSocials: React.FC = () => {
  return (
    <div className="flex space-x-4 mb-10">
      <a
        href={SITE_CONFIG.social.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Odwiedź nasz profil na LinkedIn"
        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#0077b5] hover:shadow-[0_0_20px_rgba(0,119,181,0.4)] transition-all group"
      >
        <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
      </a>
      <a
        href={SITE_CONFIG.social.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Odwiedź nasz profil na Facebooku"
        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#1877f2] hover:shadow-[0_0_20px_rgba(24,119,242,0.4)] transition-all group"
      >
        <Facebook size={20} className="group-hover:scale-110 transition-transform" />
      </a>
      <a
        href={SITE_CONFIG.social.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Obserwuj nas na Instagramie"
        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#e1306c] hover:shadow-[0_0_20px_rgba(225,48,108,0.4)] transition-all group"
      >
        <Instagram size={20} className="group-hover:scale-110 transition-transform" />
      </a>
      <a
        href={SITE_CONFIG.social.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Obserwuj nas na TikToku"
        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#000000] hover:shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all group"
      >
        <TikTokIcon size={20} className="group-hover:scale-110 transition-transform" />
      </a>
    </div>
  );
};

export default FooterSocials;
