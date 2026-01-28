import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SectionHeader from '@/components/common/SectionHeader';
import { MARKETING_CONTENT } from '@/data/content';

const MarketingFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = MARKETING_CONTENT.faqs;

  return (
    <section className="py-20 md:py-24 bg-white relative z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Najczęstsze pytania" className="mb-12" />

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-primary/50 transition-colors shadow-sm sm:shadow-none"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex justify-between items-center p-5 md:p-6 text-left focus:outline-none"
              >
                <span className="font-bold text-dark text-base md:text-lg pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-primary transition-transform duration-300 shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-5 md:p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100/50 text-sm md:text-base">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketingFaq;
