import React from 'react';
import { Layers, Music, Linkedin, CheckCircle2 } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import GlassCard from '../../common/GlassCard';
import SectionWrapper from '../../common/SectionWrapper';
import { META_ADS_CONTENT as CONTENT } from '../../../data/content';

const MetaAdsEcosystem: React.FC = () => {
  return (
    <SectionWrapper variant="light-gray">
      <SectionHeader
        title={CONTENT.ecosystem.title}
        description={CONTENT.ecosystem.description}
        className="mb-12"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {CONTENT.ecosystem.platforms.map((platform, i) => {
          const icons = [
            <Layers key="meta" size={28} />,
            <Music key="tt" size={28} />,
            <Linkedin key="li" size={28} />,
          ];
          const colors = ['#E1306C', 'black', '#0077B5'];
          return (
            <GlassCard
              key={i}
              className={`p-8 border-t-4 transition-transform hover:-translate-y-1`}
              style={{ borderTopColor: colors[i] }}
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${colors[i]}15`, color: colors[i] }}
                >
                  {icons[i]}
                </div>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xxs font-bold uppercase">
                  {platform.tag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">{platform.name}</h3>
              <p className="text-sm text-gray-600 mb-6">{platform.desc}</p>
              <ul className="space-y-2 text-sm text-gray-700">
                {platform.features.map((feat, j) => (
                  <li key={j} className="flex gap-2">
                    <CheckCircle2 size={16} style={{ color: colors[i] }} /> {feat}
                  </li>
                ))}
              </ul>
            </GlassCard>
          );
        })}
      </div>
    </SectionWrapper>
  );
};

export default MetaAdsEcosystem;
