import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, TrendingUp, Search, Megaphone, ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button';
import AmbientBackground from '@/components/common/AmbientBackground';
import LazyHydrate from '@/components/common/LazyHydrate';
import { useCounter } from '@/hooks/useCounter';
import { useModal } from '@/context/ModalContext';
import { MARKETING_CONTENT } from '@/data/content';

const MarketingHero: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const revenue = useCounter(124500, {
    increment: 150,
    tickInterval: 3000,
  });

  return (
    <section className="relative py-20 lg:py-28 bg-[#0B1120] text-white overflow-hidden">
      <AmbientBackground />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center text-sm font-semibold text-gray-300 hover:text-primary mb-12 transition-colors uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1"
          aria-label="Wróć do strony głównej"
        >
          <ArrowLeft
            className="mr-2 group-hover:-translate-x-1 transition-transform"
            size={16}
            aria-hidden="true"
          />
          Wróć do głównej
        </button>

        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* LEFT SIDE: Text Content */}
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-6">
              <Target size={14} aria-hidden="true" /> {MARKETING_CONTENT.hero.badge}
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
              {MARKETING_CONTENT.hero.title} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
                {MARKETING_CONTENT.hero.titleAccent}
              </span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-lg">
              {MARKETING_CONTENT.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => openModal('marketing')}
                variant="primary"
                icon={<ArrowRight size={18} />}
              >
                {MARKETING_CONTENT.hero.cta}
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE: Live Metrics Dashboard */}
          <div
            className="lg:w-1/2 w-full relative animate-fade-in-up mt-8 lg:mt-0"
            style={{ animationDelay: '0.3s' }}
          >
            <LazyHydrate>
              <div className="relative z-10 bg-[#0F172A] rounded-2xl border border-[#1E293B] shadow-2xl p-5 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <div className="text-xxs text-gray-300 uppercase font-bold tracking-widest mb-1">
                      {MARKETING_CONTENT.hero.revenueLabel}
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white">
                      {revenue.toLocaleString()} PLN
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-success bg-success/10 px-3 py-1 rounded-full text-xs font-bold">
                    <TrendingUp size={14} /> +12.5%
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Animated Bars */}
                  {[
                    {
                      label: 'Google Ads (ROAS 8.5)',
                      icon: <Search size={14} />,
                      val: 80,
                      col: 'from-[#4285F4] to-[#34A853]',
                    },
                    {
                      label: 'Meta Ads (CPA 12zł)',
                      icon: <Megaphone size={14} />,
                      val: 65,
                      col: 'from-[#E1306C] to-[#833AB4]',
                    },
                    {
                      label: 'SEO Organic',
                      icon: <TrendingUp size={14} />,
                      val: 45,
                      col: 'from-[#00C853] to-[#00C853]',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[#1E293B] flex items-center justify-center text-gray-600 shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xxs font-bold text-gray-300 uppercase tracking-tight">
                            {item.label}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${item.col} animate-pulse`}
                            style={{ width: `${item.val}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </LazyHydrate>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketingHero;
