import React, { useState } from 'react';
import { Calculator, Coins } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import { SEO_CONTENT as CONTENT } from '../../../data/content';

const SeoRoiCalculator: React.FC = () => {
  const [keywordVol, setKeywordVol] = useState(1000);
  const [keywordCpc, setKeywordCpc] = useState(3.5);

  return (
    <section className="py-24 bg-white relative z-10">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={CONTENT.roi.title}
          description={CONTENT.roi.description}
          className="mb-12"
        />

        <div className="bg-[#F9FAFB] rounded-3xl p-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/2 space-y-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label id="keyword-vol-label" className="text-sm font-bold text-dark">
                    {CONTENT.roi.labels.volume}
                  </label>
                  <span className="bg-white border border-gray-200 px-3 py-1 rounded text-success font-bold">
                    {keywordVol}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={keywordVol}
                  onChange={(e) => setKeywordVol(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00C853]"
                  aria-labelledby="keyword-vol-label"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label id="keyword-cpc-label" className="text-sm font-bold text-dark">
                    {CONTENT.roi.labels.cpc}
                  </label>
                  <span className="bg-white border border-gray-200 px-3 py-1 rounded text-success font-bold">
                    {keywordCpc} PLN
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={keywordCpc}
                  onChange={(e) => setKeywordCpc(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00C853]"
                  aria-labelledby="keyword-cpc-label"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-success/10 rounded-lg text-success">
                      <Calculator size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-dark">
                      {CONTENT.roi.labels.potential}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-700 uppercase font-bold">
                        {CONTENT.roi.labels.traffic}
                      </div>
                      <div className="text-2xl font-black text-dark">
                        ~{(keywordVol * 0.3).toFixed(0)}
                      </div>
                      <div className="text-xxs text-gray-600">przy CTR 30%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-700 uppercase font-bold">
                        {CONTENT.roi.labels.equivalent}
                      </div>
                      <div className="text-2xl font-black text-success">
                        {(keywordVol * 0.3 * keywordCpc).toFixed(0)} PLN
                      </div>
                      <div className="text-xxs text-gray-600">{CONTENT.roi.labels.saving}</div>
                    </div>
                  </div>
                </div>
                <Coins size={120} className="absolute -bottom-4 -right-4 text-success/5 z-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoRoiCalculator;
