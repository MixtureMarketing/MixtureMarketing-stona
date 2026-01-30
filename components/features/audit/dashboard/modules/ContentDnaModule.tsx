import React from 'react';
import { BarChart3 } from 'lucide-react';
import LazyHydrate from '../../../../common/LazyHydrate';

interface ContentDnaModuleProps {
  content: {
    word_count: number;
    h1_count: number;
    images_count: number;
    images_no_alt: number;
  };
}

const ContentDnaModule: React.FC<ContentDnaModuleProps> = ({ content }) => {
  const stats = [
    {
      label: 'Objętość Treści',
      val: content.word_count,
      unit: 'Słów',
      sub: 'Zalecane: >600',
      color: content.word_count < 300 ? 'rose' : 'emerald',
    },
    {
      label: 'Struktura H1',
      val: content.h1_count,
      unit: 'Nagłówek',
      sub: 'Zalecane: 1',
      color: content.h1_count !== 1 ? 'rose' : 'emerald',
    },
    {
      label: 'Multimedia',
      val: content.images_count,
      unit: 'Grafik',
      sub: 'Wizualny przekaz',
      color: 'blue',
    },
    {
      label: 'Dostępność (ALT)',
      val: content.images_no_alt,
      unit: 'Brak opisu',
      sub: 'Błędy SEO',
      color: content.images_no_alt > 0 ? 'rose' : 'emerald',
    },
  ];

  return (
    <div className="col-span-1 md:col-span-2 xl:col-span-3">
      <LazyHydrate minHeight="300px">
        <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner group transition-all duration-500">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <BarChart3 size={20} />
            </div>
            <h4 className="text-2xl font-black text-dark">
              Content DNA{' '}
              <span className="text-gray-400 font-medium text-lg leading-none">
                / Analiza Treści
              </span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:scale-105 transition-transform group/card"
              >
                <div className="text-xxs text-gray-400 font-black uppercase tracking-[0.2em] mb-3 group-hover/card:text-secondary transition-colors">
                  {stat.label}
                </div>
                <div
                  className={`text-4xl font-black mb-1 tracking-tighter ${stat.color === 'rose' ? 'text-rose-500' : stat.color === 'emerald' ? 'text-emerald-500' : 'text-blue-500'}`}
                >
                  {stat.val} <span className="text-lg text-gray-300 font-bold">{stat.unit}</span>
                </div>
                <div className="text-xxs text-gray-400 font-bold italic">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </LazyHydrate>
    </div>
  );
};

export default ContentDnaModule;
