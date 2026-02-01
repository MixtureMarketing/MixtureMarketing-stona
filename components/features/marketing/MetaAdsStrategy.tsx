import React, { useState } from 'react';
import {
  ShoppingCart,
  Briefcase,
  Terminal,
  Sparkles,
  Repeat,
  FileText,
  MessageSquare,
} from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import SectionWrapper from '../../common/SectionWrapper';
import { META_ADS_CONTENT as CONTENT } from '../../../data/content';

const MetaAdsStrategy: React.FC = () => {
  const [strategyType, setStrategyType] = useState<'ecommerce' | 'b2b'>('ecommerce');

  return (
    <SectionWrapper variant="dark" overflow={true}>
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      <div className="flex flex-col lg:flex-row gap-16 items-start">
        <div className="lg:w-2/5">
          <SectionHeader
            align="left"
            lightMode
            title={CONTENT.strategySelector.title}
            description={CONTENT.strategySelector.description}
            className="mb-10"
          />

          <div className="space-y-4">
            <button
              onClick={() => setStrategyType('ecommerce')}
              aria-label="Pokaż strategię dla E-commerce"
              aria-pressed={strategyType === 'ecommerce'}
              className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                strategyType === 'ecommerce'
                  ? 'bg-instagram/10 border-instagram shadow-[0_0_30px_rgba(225,48,108,0.2)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div
                className={`p-3 rounded-full ${strategyType === 'ecommerce' ? 'bg-instagram text-white' : 'bg-white/10 text-gray-600'}`}
              >
                <ShoppingCart size={24} aria-hidden="true" />
              </div>
              <div>
                <h3
                  className={`text-lg font-bold ${strategyType === 'ecommerce' ? 'text-white' : 'text-gray-600'}`}
                >
                  {CONTENT.strategySelector.ecommerce.label}
                </h3>
                <p className="text-xs text-gray-300">{CONTENT.strategySelector.ecommerce.desc}</p>
              </div>
              {strategyType === 'ecommerce' && (
                <div className="ml-auto w-2 h-2 bg-instagram rounded-full animate-pulse"></div>
              )}
            </button>

            <button
              onClick={() => setStrategyType('b2b')}
              aria-label="Pokaż strategię dla Usług i B2B"
              aria-pressed={strategyType === 'b2b'}
              className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                strategyType === 'b2b'
                  ? 'bg-[#833AB4]/10 border-[#833AB4] shadow-[0_0_30px_rgba(131,58,180,0.2)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div
                className={`p-3 rounded-full ${strategyType === 'b2b' ? 'bg-[#833AB4] text-white' : 'bg-white/10 text-gray-600'}`}
              >
                <Briefcase size={24} aria-hidden="true" />
              </div>
              <div>
                <h3
                  className={`text-lg font-bold ${strategyType === 'b2b' ? 'text-white' : 'text-gray-600'}`}
                >
                  {CONTENT.strategySelector.b2b.label}
                </h3>
                <p className="text-xs text-gray-300">{CONTENT.strategySelector.b2b.desc}</p>
              </div>
              {strategyType === 'b2b' && (
                <div className="ml-auto w-2 h-2 bg-[#833AB4] rounded-full animate-pulse"></div>
              )}
            </button>
          </div>
        </div>

        <div className="lg:w-3/5 w-full">
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col">
            <div className="bg-[#0F172A] px-4 py-3 flex justify-between items-center border-b border-[#334155]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-xxs font-mono text-gray-700 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12} /> Meta_Ads_Manager_v2.0
              </div>
              <div className="w-8"></div>
            </div>

            <div className="p-8 flex-1 relative">
              {strategyType === 'ecommerce' ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-deep-dark p-4 rounded-xl border border-[#334155]">
                      <div className="text-xxs text-gray-300 uppercase font-bold">ROAS</div>
                      <div className="text-2xl font-black text-instagram">8.4x</div>
                    </div>
                    <div className="bg-deep-dark p-4 rounded-xl border border-[#334155]">
                      <div className="text-xxs text-gray-300 uppercase font-bold">Purchases</div>
                      <div className="text-2xl font-black text-white">428</div>
                    </div>
                    <div className="bg-deep-dark p-4 rounded-xl border border-[#334155]">
                      <div className="text-xxs text-gray-300 uppercase font-bold">CPR</div>
                      <div className="text-2xl font-black text-success">12zł</div>
                    </div>
                  </div>

                  <div className="bg-instagram/10 border border-instagram/30 p-6 rounded-xl relative overflow-hidden group hover:bg-instagram/20 transition-colors">
                    <div className="absolute top-0 right-0 bg-instagram text-white text-xxs font-bold px-2 py-1 rounded-bl-lg">
                      AI POWERED
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-instagram/20 rounded-lg text-instagram">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">
                          {CONTENT.strategySelector.ecommerce.advantage.title}
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {CONTENT.strategySelector.ecommerce.advantage.desc}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <span className="text-xxs bg-instagram/20 text-instagram px-2 py-1 rounded font-mono">
                            DPA
                          </span>
                          <span className="text-xxs bg-instagram/20 text-instagram px-2 py-1 rounded font-mono">
                            Catalog Sales
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-deep-dark border border-[#334155] p-6 rounded-xl hover:border-[#405DE6] transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#1E293B] rounded-lg text-[#405DE6] group-hover:text-white group-hover:bg-[#405DE6] transition-colors">
                        <Repeat size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">
                          {CONTENT.strategySelector.ecommerce.remarketing.title}
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {CONTENT.strategySelector.ecommerce.remarketing.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-deep-dark p-4 rounded-xl border border-[#334155]">
                      <div className="text-xxs text-gray-300 uppercase font-bold">Leads</div>
                      <div className="text-2xl font-black text-[#833AB4]">142</div>
                    </div>
                    <div className="bg-deep-dark p-4 rounded-xl border border-[#334155]">
                      <div className="text-xxs text-gray-300 uppercase font-bold">CPL</div>
                      <div className="text-2xl font-black text-white">45zł</div>
                    </div>
                    <div className="bg-deep-dark p-4 rounded-xl border border-[#334155]">
                      <div className="text-xxs text-gray-300 uppercase font-bold">Qual. Ratio</div>
                      <div className="text-2xl font-black text-success">68%</div>
                    </div>
                  </div>

                  <div className="bg-[#833AB4]/10 border border-[#833AB4]/30 p-6 rounded-xl relative overflow-hidden group hover:bg-[#833AB4]/20 transition-colors">
                    <div className="absolute top-0 right-0 bg-[#833AB4] text-white text-xxs font-bold px-2 py-1 rounded-bl-lg">
                      HIGH VOLUME
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#833AB4]/20 rounded-lg text-[#833AB4]">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">
                          {CONTENT.strategySelector.b2b.forms.title}
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {CONTENT.strategySelector.b2b.forms.desc}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <span className="text-xxs bg-[#833AB4]/20 text-[#833AB4] px-2 py-1 rounded font-mono">
                            Native
                          </span>
                          <span className="text-xxs bg-[#833AB4]/20 text-[#833AB4] px-2 py-1 rounded font-mono">
                            CRM Sync
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-deep-dark border border-[#334155] p-6 rounded-xl hover:border-[#0084FF] transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#1E293B] rounded-lg text-[#0084FF] group-hover:text-white group-hover:bg-[#0084FF] transition-colors">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">
                          {CONTENT.strategySelector.b2b.messenger.title}
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {CONTENT.strategySelector.b2b.messenger.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default MetaAdsStrategy;
