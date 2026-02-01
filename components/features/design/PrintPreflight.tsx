import React, { useState } from 'react';
import { Scan, Palette, Ruler, FileText, CheckCircle2 } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { PRINT_DESIGN_CONTENT as CONTENT } from '../../../data/content';

const PrintPreflight: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const toggleCheck = (index: number) => {
    if (checkedItems.includes(index)) {
      setCheckedItems((prev) => prev.filter((i) => i !== index));
    } else {
      setCheckedItems((prev) => [...prev, index]);
    }
  };

  const preflightChecklist = CONTENT.preflight.items.map((item, i) => {
    const icons = [
      <Scan key="scan" size={20} />,
      <Palette key="palette" size={20} />,
      <Ruler key="ruler" size={20} />,
      <FileText key="file" size={20} />,
    ];
    return { ...item, icon: icons[i] };
  });

  return (
    <SectionWrapper variant="light-gray" containerClassName="max-w-screen-xl">
      <SectionHeader
        title={CONTENT.preflight.title}
        description={CONTENT.preflight.description}
        className="mb-12"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {preflightChecklist.map((item, i) => {
          const isChecked = checkedItems.includes(i);
          return (
            <AnimateOnScroll key={i} delay={i * 100} className="h-full">
              <div
                onClick={() => toggleCheck(i)}
                className={`p-6 rounded-2xl border transition-all h-full group cursor-pointer relative overflow-hidden
                                ${isChecked ? 'bg-dark border-dark text-white shadow-lg transform -translate-y-1' : 'bg-white border-gray-100 hover:border-[#F4B400]'}
                            `}
              >
                {isChecked && (
                  <div className="absolute top-4 right-4 text-success">
                    <CheckCircle2 size={24} />
                  </div>
                )}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                                  ${isChecked ? 'bg-white/10 text-white' : 'bg-light-gray text-dark group-hover:text-[#F4B400]'}
                              `}
                >
                  {item.icon}
                </div>
                <h3
                  className={`font-bold mb-2 transition-colors ${isChecked ? 'text-white' : 'text-dark'}`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-sm transition-colors ${isChecked ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {item.desc}
                </p>
              </div>
            </AnimateOnScroll>
          );
        })}
      </div>
    </SectionWrapper>
  );
};
export default PrintPreflight;
