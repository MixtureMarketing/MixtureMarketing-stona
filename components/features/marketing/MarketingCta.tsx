import React from 'react';
import { Compass } from 'lucide-react';
import Button from '@/components/common/Button';
import { useModal } from '@/context/ModalContext';
import { MARKETING_CONTENT } from '@/data/content';

const MarketingCta: React.FC = () => {
  const { openModal } = useModal();

  return (
    <section className="py-20 md:py-24 bg-[#0B1120] text-center text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="inline-block p-4 rounded-full bg-white/10 mb-6 backdrop-blur-sm animate-pulse">
          <Compass size={32} className="text-primary" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{MARKETING_CONTENT.cta.title}</h2>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium">
          {MARKETING_CONTENT.cta.description}
        </p>
        <Button
          onClick={() => openModal('consultation')}
          variant="white"
          size="lg"
          className="w-full sm:w-auto"
        >
          {MARKETING_CONTENT.cta.button}
        </Button>
      </div>
    </section>
  );
};

export default MarketingCta;
