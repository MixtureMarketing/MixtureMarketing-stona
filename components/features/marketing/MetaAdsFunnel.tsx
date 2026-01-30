import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, MousePointerClick, ShoppingCart, Heart } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import { META_ADS_CONTENT as CONTENT } from '../../../data/content';
import FunnelVisual from './funnel/FunnelVisual';
import FunnelCommandCenter from './funnel/FunnelCommandCenter';

interface MetaAdsFunnelProps {
  onCta: () => void;
}

const MetaAdsFunnel: React.FC<MetaAdsFunnelProps> = ({ onCta }) => {
  const [funnelStep, setFunnelStep] = useState(0);
  const [particles] = useState(() =>
    [...Array(20)].map((_, i) => ({
      left: (i * 7) % 100,
      top: (i * 13) % 100,
      delay: (i * 0.2) % 5,
      duration: 3 + ((i * 0.5) % 2),
    })),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setFunnelStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const funnelStages = CONTENT.funnel.stages.map((stage, i) => {
    const icons = [
      <ImageIcon key="eye" size={20} />,
      <MousePointerClick key="click" size={20} />,
      <ShoppingCart key="cart" size={20} />,
      <Heart key="heart" size={20} />,
    ];
    const colors = ['#61B6DE', '#E1306C', '#00C853', '#833AB4'];
    return { ...stage, icon: icons[i], color: colors[i] };
  });

  return (
    <section className="py-24 bg-white relative z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader
          title={CONTENT.funnel.title}
          description={CONTENT.funnel.description}
          className="mb-24"
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <FunnelVisual funnelStep={funnelStep} particles={particles} funnelStages={funnelStages} />
          <FunnelCommandCenter funnelStep={funnelStep} funnelStages={funnelStages} onCta={onCta} />
        </div>
      </div>
    </section>
  );
};

export default MetaAdsFunnel;
