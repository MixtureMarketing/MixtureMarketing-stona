import React, { useMemo } from 'react';
import { Rocket, Building2, ShoppingCart, Database, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../../common/SectionHeader';
import GlassCard from '../../common/GlassCard';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { WEB_DEV_CONTENT } from '../../../data/content';

const WebDevProjectTypes: React.FC = () => {
  const navigate = useNavigate();

  const projectTypes = useMemo(() => {
    const icons = [
      <Rocket key="landing" size={24} />,
      <Building2 key="corporate" size={24} />,
      <ShoppingCart key="ecommerce" size={24} />,
      <Database key="custom" size={24} />,
    ];
    return WEB_DEV_CONTENT.projectTypes.map((type, index) => ({
      ...type,
      icon: icons[index],
      action: () => navigate(type.path),
    }));
  }, [navigate]);

  return (
    <SectionWrapper id="offer-grid" variant="light-gray">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-3xl">
          <SectionHeader
            align="left"
            title={WEB_DEV_CONTENT.offerGrid.title}
            subtitle={WEB_DEV_CONTENT.offerGrid.subtitle}
            description={WEB_DEV_CONTENT.offerGrid.description}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projectTypes.map((type, index) => (
          <AnimateOnScroll key={index} delay={index * 100} className="h-full">
            <GlassCard
              onClick={type.action}
              className={`p-8 h-full flex flex-col cursor-pointer transition-all duration-500 group relative overflow-hidden border-t-4 border-l-0 border-r-0 border-b-0 ${type.highlight ? 'border-t-[#3F3D91] shadow-[0_20px_50px_-12px_rgba(63,61,145,0.15)] bg-white' : 'border-t-transparent hover:border-t-[#61B6DE] bg-white/60'}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-light-gray border border-gray-100 shadow-sm flex items-center justify-center text-dark mb-8 group-hover:bg-dark group-hover:text-white transition-all duration-500">
                {type.icon}
              </div>

              <h3 className="font-bold text-xl text-dark mb-2 group-hover:text-secondary transition-colors">
                {type.title}
              </h3>
              <p className="text-xxs font-black text-[#0284C7] uppercase tracking-[0.2em] mb-6">
                {type.subtitle}
              </p>

              <p className="text-sm text-gray-700 leading-relaxed mb-8 flex-grow font-medium">
                {type.desc}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-8">
                {type.techs.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-50 text-xxs font-bold text-gray-600 rounded uppercase border border-gray-100 group-hover:border-primary/30 group-hover:text-dark transition-colors"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xxs font-bold text-gray-600 uppercase tracking-widest">
                    Main KPI
                  </span>
                  <span className="text-xs font-black text-dark">{type.kpi}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-secondary transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            </GlassCard>
          </AnimateOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default WebDevProjectTypes;
