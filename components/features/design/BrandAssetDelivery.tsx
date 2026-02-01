import React from 'react';
import { PenTool, BookOpen, Monitor, Printer, FileBox, ShieldCheck, Download } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import SectionWrapper from '../../common/SectionWrapper';
import { BRAND_IDENTITY_CONTENT as CONTENT } from '../../../data/content';

const BrandAssetDelivery: React.FC = () => {
  const deliverables = CONTENT.deliverables.items.map((item, i) => {
    const icons = [
      <PenTool key="pen" size={20} />,
      <BookOpen key="book" size={20} />,
      <Monitor key="monitor" size={20} />,
      <Printer key="printer" size={20} />,
    ];
    return { ...item, icon: icons[i] };
  });

  return (
    <SectionWrapper variant="light-gray" containerClassName="max-w-screen-xl">
      <div className="flex flex-col md:flex-row gap-16 items-center">
        <div className="md:w-1/2">
          <SectionHeader
            align="left"
            title={CONTENT.deliverables.title}
            description={CONTENT.deliverables.description}
          />
          <div className="grid grid-cols-2 gap-4 mt-8">
            {deliverables.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-gray-100 bg-white hover:border-primary transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg shadow-sm text-secondary group-hover:text-primary">
                    {item.icon}
                  </div>
                  <span className="font-bold text-dark text-sm">{item.ext}</span>
                </div>
                <p className="text-xs text-gray-700 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="bg-dark p-8 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[60px] opacity-20"></div>
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <FileBox size={24} className="text-primary" />
              <span className="font-mono text-sm">brand_kit_v1.0.zip</span>
            </div>
            <div className="space-y-3 font-mono text-xs opacity-80">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-white/30 rounded"></div> /logo_vectors/
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-white/30 rounded"></div>{' '}
                /social_media_templates/
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-white/30 rounded"></div>{' '}
                /brand_book_guidelines.pdf
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-white/30 rounded"></div> /fonts_licenses/
              </div>
            </div>
            <div className="mt-8 flex justify-between items-end">
              <div>
                <div className="text-xxs uppercase text-gray-600 mb-1">Prawa Autorskie</div>
                <div className="font-bold flex items-center gap-2 text-success">
                  <ShieldCheck size={16} /> Pełne Przekazanie Praw (IP)
                </div>
              </div>
              <div className="bg-white/10 p-3 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer">
                <Download size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default BrandAssetDelivery;
