import React, { useState } from 'react';
import { Cpu, Eye, DollarSign, Layers } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import { ECOMMERCE_CONTENT as CONTENT } from '../../../data/content';
import ConfiguratorVisual from './configurator/ConfiguratorVisual';
import ConfiguratorControls from './configurator/ConfiguratorControls';

interface EcommerceConfiguratorProps {
  onCta: () => void;
}

const EcommerceConfigurator: React.FC<EcommerceConfiguratorProps> = ({ onCta }) => {
  const [configColor, setConfigColor] = useState<'red' | 'blue' | 'black' | 'emerald'>('black');
  const [configMaterial, setConfigMaterial] = useState<'mesh' | 'leather'>('mesh');
  const [configHeadrest, setConfigHeadrest] = useState<boolean>(true);
  const [configArmrests, setConfigArmrests] = useState<boolean>(true);
  const [configBase, setConfigBase] = useState<'plastic' | 'chrome'>('plastic');

  const getConfigPrice = () => {
    let base = 899;
    if (configMaterial === 'leather') base += 250;
    if (configHeadrest) base += 100;
    if (configArmrests) base += 120;
    if (configBase === 'chrome') base += 180;
    return base;
  };

  const getColorHex = (color: string) => {
    switch (color) {
      case 'red':
        return '#EF4444';
      case 'blue':
        return '#3B82F6';
      case 'emerald':
        return '#10B981';
      default:
        return '#1F2937';
    }
  };

  return (
    <section className="py-24 bg-deep-dark text-white relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <Cpu size={14} /> {CONTENT.configurator.badge}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {CONTENT.configurator.title.line1} <br />
                <span className="text-primary">{CONTENT.configurator.title.line2}</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                {CONTENT.configurator.description}
              </p>

              <div className="space-y-4">
                {CONTENT.configurator.features.map((item, i) => {
                  const icons = [
                    <Eye key="eye" size={18} className="text-primary" />,
                    <DollarSign key="dollar" size={18} className="text-success" />,
                    <Layers key="layers" size={18} className="text-[#F4B400]" />,
                  ];
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-primary/30 transition-colors group"
                    >
                      <div className="mt-1">{icons[i]}</div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-300 group-hover:text-white transition-colors">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimateOnScroll>
          </div>

          <div className="lg:w-1/2 w-full flex justify-center">
            <AnimateOnScroll delay={200}>
              <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 w-full max-w-xl text-dark relative overflow-hidden flex flex-col md:flex-row gap-8 border border-gray-100">
                <ConfiguratorVisual
                  configBase={configBase}
                  configColor={configColor}
                  configArmrests={configArmrests}
                  configHeadrest={configHeadrest}
                  getColorHex={getColorHex}
                />
                <ConfiguratorControls
                  configColor={configColor}
                  setConfigColor={setConfigColor}
                  configMaterial={configMaterial}
                  setConfigMaterial={setConfigMaterial}
                  configHeadrest={configHeadrest}
                  setConfigHeadrest={setConfigHeadrest}
                  configArmrests={configArmrests}
                  setConfigArmrests={setConfigArmrests}
                  configBase={configBase}
                  setConfigBase={setConfigBase}
                  getConfigPrice={getConfigPrice}
                  getColorHex={getColorHex}
                  onCta={onCta}
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EcommerceConfigurator;
