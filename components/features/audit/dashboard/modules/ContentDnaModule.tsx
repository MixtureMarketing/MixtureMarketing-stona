import React from 'react';
import { BarChart3 } from 'lucide-react';
import LazyHydrate from '../../../../common/LazyHydrate';
import { cardCls, IconTile } from '../ui';

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
      label: 'Objętość treści',
      val: content.word_count,
      unit: 'słów',
      sub: 'zalecane > 600',
      bad: content.word_count < 300,
    },
    {
      label: 'Struktura H1',
      val: content.h1_count,
      unit: content.h1_count === 1 ? 'nagłówek' : 'nagłówki',
      sub: content.h1_count === 1 ? 'idealnie' : 'zalecane: 1',
      bad: content.h1_count !== 1,
    },
    {
      label: 'Multimedia',
      val: content.images_count,
      unit: 'grafik',
      sub: 'przekaz wizualny',
      bad: false,
    },
    {
      label: 'Dostępność (ALT)',
      val: content.images_no_alt,
      unit: 'bez opisu',
      sub: 'błąd SEO',
      bad: content.images_no_alt > 0,
    },
  ];

  return (
    <LazyHydrate minHeight="220px">
      <div className={`${cardCls} p-6 bg-[#fbfcfd] hover:-translate-y-0`}>
        <div className="flex items-center gap-3 mb-5">
          <IconTile tone="green">
            <BarChart3 size={20} />
          </IconTile>
          <h4 className="text-[17px] font-bold text-dark">
            Content DNA{' '}
            <span className="text-gray-400 font-medium text-[13px]">/ analiza treści</span>
          </h4>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="px-4 py-3.5 bg-white border border-gray-100 rounded-xl">
              <div className="text-[10.5px] text-gray-400 font-bold uppercase tracking-[0.06em] mb-1.5">
                {stat.label}
              </div>
              <div
                className={`text-[30px] font-extrabold leading-none tabular-nums tracking-tight ${
                  stat.bad ? 'text-[#be123c]' : 'text-dark'
                }`}
              >
                {stat.val}
              </div>
              <div className="text-[11.5px] text-gray-400 font-medium mt-1.5">
                {stat.unit} · {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </LazyHydrate>
  );
};

export default ContentDnaModule;
