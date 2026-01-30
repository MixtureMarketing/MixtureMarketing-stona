import React, { useMemo } from 'react';
import { Zap, Search, Lock, Edit3, CheckCircle2 } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import LazyHydrate from '../../common/LazyHydrate';
import { WEB_DEV_CONTENT } from '../../../data/content';

const WebDevComparison: React.FC = () => {
  const comparisonData = useMemo(() => {
    const icons = [
      <Zap key="speed" size={18} />,
      <Search key="seo" size={18} />,
      <Lock key="security" size={18} />,
      <Edit3 key="content" size={18} />,
      <CheckCircle2 key="support" size={18} />,
    ];
    return WEB_DEV_CONTENT.comparison.data.map((row, index) => ({
      ...row,
      icon: icons[index],
    }));
  }, []);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          title={WEB_DEV_CONTENT.comparison.title}
          subtitle={WEB_DEV_CONTENT.comparison.subtitle}
          description={WEB_DEV_CONTENT.comparison.description}
          className="mb-16"
        />
        <LazyHydrate whenVisible>
          <div className="bg-[#0F172A] text-gray-200 rounded-3xl overflow-hidden shadow-2xl border border-[#1E293B]">
            <div className="divide-y divide-gray-800">
              {comparisonData.map((row, i) => (
                <div key={i} className="px-6 py-6 hover:bg-white/5 transition-colors group">
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-[#1E293B] text-primary">{row.icon}</div>
                      <span className="font-bold text-white">{row.label}</span>
                    </div>
                    <div className="col-span-6 md:col-span-4 text-center">
                      <span className="line-through text-red-400">{row.bad}</span>
                    </div>
                    <div className="col-span-6 md:col-span-4 text-center">
                      <span className="text-emerald-400 font-bold">{row.good}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LazyHydrate>
      </div>
    </section>
  );
};

export default WebDevComparison;
