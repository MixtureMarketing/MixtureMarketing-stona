import React from 'react';
import { Crosshair } from 'lucide-react';
import Button from '../../common/Button';
import { useModal } from '../../../context/ModalContext';
import { SEO_CONTENT as CONTENT } from '../../../data/content';

const SeoCta: React.FC = () => {
  const { openModal } = useModal();

  return (
    <section className="py-24 bg-success relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <div className="inline-block p-4 rounded-full bg-white/10 mb-6 backdrop-blur-sm animate-bounce">
          <Crosshair size={32} className="text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
        <p className="text-xl text-white/90 mb-10">{CONTENT.cta.description}</p>
        <Button
          onClick={() => openModal('audit', { specificType: 'seo' })}
          variant="white"
          size="lg"
          className="text-success"
        >
          {CONTENT.cta.button}
        </Button>
      </div>
    </section>
  );
};

export default SeoCta;
