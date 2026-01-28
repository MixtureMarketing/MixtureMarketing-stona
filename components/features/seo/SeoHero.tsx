import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, Search, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '../../common/AmbientBackground';
import Button from '../../common/Button';
import { SEO_CONTENT as CONTENT } from '../../../data/content';
import { useModal } from '../../../context/ModalContext';

const SeoHero: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [rankPosition, setRankPosition] = useState(6);

  useEffect(() => {
    const rankInterval = setInterval(() => {
      setRankPosition((prev) => (prev <= 1 ? 6 : prev - 1));
    }, 2000);

    return () => clearInterval(rankInterval);
  }, []);

  return (
    <section className="relative py-20 lg:py-28 bg-[#F9FAFB] overflow-hidden">
      <AmbientBackground />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <button
          onClick={() => navigate('/marketing/')}
          className="group flex items-center text-sm font-semibold text-gray-700 hover:text-success mb-8 transition-colors"
          aria-label="Wróć do menu marketingu"
        >
          <ArrowLeft
            className="mr-2 group-hover:-translate-x-1 transition-transform"
            size={16}
            aria-hidden="true"
          />
          Wróć do Marketingu
        </button>

        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-success text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in border border-success/20 shadow-sm">
              <TrendingUp size={14} aria-hidden="true" /> {CONTENT.hero.badge}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark mb-6 leading-tight animate-fade-in-up">
              {CONTENT.hero.title.line1}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark to-[#00C853]">
                {CONTENT.hero.title.line2}
              </span>
            </h1>

            <p
              className="text-xl text-gray-700 mb-8 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
              dangerouslySetInnerHTML={{ __html: CONTENT.hero.description }}
            />

            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Button
                onClick={() => openModal('marketing', { specificType: 'seo' })}
                icon={<ArrowRight size={18} />}
              >
                {CONTENT.hero.cta}
              </Button>
              <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-full border border-gray-100 text-sm font-bold text-gray-600 shadow-sm cursor-default">
                <Globe size={16} className="text-success" /> {CONTENT.hero.microCopy}
              </div>
            </div>
          </div>

          <div
            className="lg:w-1/2 w-full relative h-[500px] flex items-center justify-center perspective-1000"
            aria-label="Symulacja wyników wyszukiwania Google"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#00C853]/10 to-transparent rounded-full blur-3xl opacity-50"></div>

            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-y-6 rotate-x-6 hover:rotate-0 transition-transform duration-700">
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-xxs text-gray-600 shadow-inner flex items-center">
                  <Search size={10} className="mr-2" /> najlepsza firma w branży
                </div>
              </div>

              <div className="p-4 bg-white relative min-h-[380px] flex flex-col gap-3">
                {[1, 2, 3, 4, 5, 6].map((position) => {
                  const isHero = position === rankPosition;
                  if (isHero) {
                    return (
                      <div
                        key="hero"
                        className="bg-[#E8F5E9] border border-success rounded-xl p-4 shadow-lg transition-all duration-500 ease-in-out flex items-start gap-3 z-20 scale-105"
                      >
                        <div className="mt-1 min-w-[24px] h-6 bg-success text-white rounded-md flex items-center justify-center text-xs font-bold shadow-md">
                          #{position}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full bg-dark"></div>
                            <span className="text-xs text-dark font-bold">TwojaFirma.pl</span>
                            <CheckCircle2 size={12} className="text-success" />
                          </div>
                          <h3 className="text-[#1a0dab] font-medium text-sm hover:underline cursor-pointer">
                            Lider Rynku | Gwarancja Jakości | Sprawdź Ofertę
                          </h3>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            Zwiększ sprzedaż i wyprzedź konkurencję. Profesjonalne usługi dla
                            Twojego biznesu. Kliknij i zobacz...
                          </p>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={position}
                        className="flex gap-3 opacity-40 hover:opacity-60 transition-opacity p-2 border-b border-gray-50 last:border-0"
                      >
                        <div className="mt-1 min-w-[24px] text-xs font-bold text-gray-300 text-center">
                          #{position}
                        </div>
                        <div className="w-full">
                          <div className="h-2 w-32 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 w-3/4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-2 w-full bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoHero;
