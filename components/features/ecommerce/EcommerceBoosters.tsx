import React, { useMemo } from 'react';
import { Search, MousePointerClick } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../../common/SectionHeader';
import GlassCard from '../../common/GlassCard';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { ECOMMERCE_CONTENT as CONTENT } from '../../../data/content';

const EcommerceBoosters: React.FC = () => {
  const navigate = useNavigate();

  const boosterIcons = useMemo(
    () => [
      <Search key="search" size={12} className="mr-2 text-gray-600" />,
      <div key="plus" className="text-success font-bold text-xl">
        +
      </div>,
      <MousePointerClick key="click" size={12} className="mr-1" />,
    ],
    [],
  );

  return (
    <SectionWrapper variant="light-gray" overflow={true}>
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div className="max-w-2xl">
          <SectionHeader
            align="left"
            title={CONTENT.boosters.title}
            description={CONTENT.boosters.description}
          />
          <button
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors group cursor-pointer"
            onClick={() => navigate('/baza-wiedzy/audyt-ux-sklepu-internetowego/')}
          >
            <span>{CONTENT.boosters.articleLink}</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {CONTENT.boosters.items.map((item, i) => (
          <AnimateOnScroll key={i} delay={i * 100} className="h-full">
            <GlassCard className="p-8 h-full bg-white group hover:border-secondary transition-colors flex flex-col">
              <div className="mb-6 bg-gray-50 rounded-lg p-4 relative overflow-hidden border border-gray-100 min-h-[140px] flex flex-col justify-center">
                {i === 0 && (
                  <div className="flex items-center bg-white rounded border border-gray-200 px-3 py-2 text-xs text-gray-800 mb-2 shadow-sm">
                    {boosterIcons[0]} Buty spor...
                  </div>
                )}
                {i === 1 && (
                  <div className="flex items-center gap-2 justify-center">{boosterIcons[1]}</div>
                )}
                {i === 2 && (
                  <div className="flex flex-col gap-2">
                    <div className="h-8 bg-dark rounded flex items-center justify-center text-white text-xs font-bold mt-2 shadow-lg shadow-[#213261]/20">
                      {boosterIcons[2]} Kupuję (1-click)
                    </div>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </GlassCard>
          </AnimateOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default EcommerceBoosters;
