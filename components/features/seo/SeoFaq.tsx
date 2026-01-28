import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import { SEO_CONTENT as CONTENT } from '../../../data/content';

const SeoFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#F9FAFB]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Pytania o Pozycjonowanie" className="mb-12" />

        <div className="space-y-4" role="region" aria-label="FAQ">
          {CONTENT.faqs.map((faq, i) => (
            <div
              key={i}
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === i ? 'bg-white border-success shadow-md' : 'bg-white border-gray-200 hover:border-success/50'}`}
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                aria-expanded={openFaq === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span
                  className={`font-bold text-base md:text-lg pr-4 transition-colors ${openFaq === i ? 'text-secondary' : 'text-dark'}`}
                >
                  {faq.q}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === i ? 'bg-success text-white rotate-180' : 'bg-gray-100 text-gray-700'}`}
                >
                  <ChevronDown size={18} />
                </div>
              </button>
              <div
                id={`faq-answer-${i}`}
                className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-gray-600 leading-relaxed text-sm md:text-base border-t border-gray-100/50 bg-gray-50/50">
                  <div className="flex gap-3">
                    <div className="w-0.5 min-h-full bg-success"></div>
                    <p>{faq.a}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SeoFaq;
