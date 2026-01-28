import React from 'react';
import { ShoppingCart, Briefcase, Globe } from 'lucide-react';
import SectionHeader from '@/components/common/SectionHeader';
import GlassCard from '@/components/common/GlassCard';
import LazyHydrate from '@/components/common/LazyHydrate';
import { MARKETING_CONTENT } from '@/data/content';

const MarketingIndustries: React.FC = () => {
  const industryIcons = [
    <ShoppingCart key="ecommerce" size={24} className="md:w-7 md:h-7" />,
    <Briefcase key="b2b" size={24} className="md:w-7 md:h-7" />,
    <Globe key="saas" size={24} className="md:w-7 md:h-7" />,
  ];

  const industryItems = MARKETING_CONTENT.industries.items.map((item, index) => ({
    ...item,
    icon: industryIcons[index],
  }));

  return (
    <section className="py-20 md:py-24 bg-white relative z-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={MARKETING_CONTENT.industries.title}
          description={MARKETING_CONTENT.industries.description}
          className="mb-12"
        />
        <LazyHydrate>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {industryItems.map((item, i) => (
              <GlassCard
                key={i}
                className={`p-6 md:p-8 border-t-4 hover:shadow-xl transition-all ${i === 0 ? 'border-t-[#61B6DE] md:col-span-2 lg:col-span-1' : i === 1 ? 'border-t-[#3F3D91]' : 'border-t-[#E1306C]'}`}
              >
                <div
                  className={`mb-6 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 ${i === 0 ? 'bg-blue-50 text-primary' : i === 1 ? 'bg-indigo-50 text-secondary' : 'bg-pink-50 text-instagram'}`}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed font-medium">
                  {item.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, j) => (
                    <span
                      key={j}
                      className="text-xxs bg-gray-100 px-2 py-1 rounded text-gray-700 font-bold uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </LazyHydrate>
      </div>
    </section>
  );
};

export default MarketingIndustries;
