import React from 'react';

const PortalSupport: React.FC = () => {
  return (
    <div className="bg-dark rounded-3xl p-8 text-white relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary rounded-full blur-[60px] opacity-20"></div>
      <h3 className="text-xl font-bold mb-4">Potrzebujesz pilnej pomocy?</h3>
      <p className="text-gray-300 text-sm mb-8 leading-relaxed">
        Jesteśmy dostępni w dni robocze od 9:00 do 17:00. W sprawach krytycznych (awarie) reagujemy
        24/7 dla klientów z aktywnym pakietem SLA.
      </p>
      <a
        href="tel:+48794443551"
        className="block bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl mb-4 border border-white/10"
      >
        <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
          Infolinia
        </div>
        <div className="text-xl font-black">+48 794 443 551</div>
      </a>
      <a
        href="mailto:info@mixturemarketing.pl"
        className="block bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl border border-white/10"
      >
        <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Email</div>
        <div className="text-lg font-bold">info@mixturemarketing.pl</div>
      </a>
    </div>
  );
};

export default PortalSupport;
