import React, { useState } from 'react';
import { Settings, MousePointerClick, ShoppingBag, TrendingUp } from 'lucide-react';
import { GOOGLE_ADS_CONTENT as CONTENT } from '../../../data/content';

const GoogleAdsCalculator: React.FC = () => {
  // Calculator State
  const [budget, setBudget] = useState(5000);
  const [cpc, setCpc] = useState(3.5);
  const [convRate, setConvRate] = useState(2.5); // %
  const [avgOrderValue, setAvgOrderValue] = useState(400); // PLN

  // Derived Metrics for Funnel
  const traffic = Math.floor(budget / cpc);
  const leads = Math.floor(traffic * (convRate / 100));
  const cpa = leads > 0 ? (budget / leads).toFixed(2) : 0;
  const potentialRevenue = leads * avgOrderValue;
  const roas = budget > 0 ? ((potentialRevenue / budget) * 100).toFixed(0) : 0;

  return (
    <div className="bg-[#F9FAFB] rounded-3xl border border-gray-200 overflow-hidden shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 p-8 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
          <h3 className="text-xl font-bold text-dark mb-8 flex items-center gap-2">
            <Settings size={20} className="text-primary" /> Parametry Kampanii
          </h3>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm font-bold text-dark mb-2">
                <label id="budget-label">{CONTENT.calculator.labels.budget}</label>
                <span className="text-[#34A853] bg-[#34A853]/10 px-3 py-1 rounded-md border border-[#34A853]/20">
                  {budget} PLN
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#34A853]"
                aria-labelledby="budget-label"
              />
              <p className="text-xs text-gray-600 mt-2">{CONTENT.calculator.labels.budgetDesc}</p>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold text-dark mb-2">
                <label id="cpc-label">{CONTENT.calculator.labels.cpc}</label>
                <span className="text-[#4285F4] bg-[#4285F4]/10 px-3 py-1 rounded-md border border-[#4285F4]/20">
                  {cpc} PLN
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.1"
                value={cpc}
                onChange={(e) => setCpc(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4285F4]"
                aria-labelledby="cpc-label"
              />
              <p className="text-xs text-gray-600 mt-2">{CONTENT.calculator.labels.cpcDesc}</p>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold text-dark mb-2">
                <label id="cr-label">{CONTENT.calculator.labels.cr}</label>
                <span className="text-[#EA4335] bg-[#EA4335]/10 px-3 py-1 rounded-md border border-[#EA4335]/20">
                  {convRate}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={convRate}
                onChange={(e) => setConvRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EA4335]"
                aria-labelledby="cr-label"
              />
              <p className="text-xs text-gray-600 mt-2">{CONTENT.calculator.labels.crDesc}</p>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold text-dark mb-2">
                <label id="aov-label">{CONTENT.calculator.labels.aov}</label>
                <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
                  {avgOrderValue} PLN
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={avgOrderValue}
                onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
                aria-labelledby="aov-label"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-8 bg-[#F9FAFB] flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="text-xs uppercase font-bold text-gray-600 mb-1">
                {CONTENT.calculator.labels.traffic}
              </div>
              <div className="text-2xl font-black text-[#4285F4] flex items-center gap-2">
                {traffic.toLocaleString()} <MousePointerClick size={16} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="text-xs uppercase font-bold text-gray-600 mb-1">
                {CONTENT.calculator.labels.leads}
              </div>
              <div className="text-2xl font-black text-dark flex items-center gap-2">
                {leads.toLocaleString()} <ShoppingBag size={16} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="text-xs uppercase font-bold text-gray-600 mb-1">
                {CONTENT.calculator.labels.cpa}
              </div>
              <div className="text-2xl font-black text-[#EA4335]">{cpa} PLN</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="text-xs uppercase font-bold text-gray-600 mb-1">
                {CONTENT.calculator.labels.roas}
              </div>
              <div className="text-2xl font-black text-[#34A853]">{roas}%</div>
            </div>
          </div>

          <div className="bg-dark text-white p-8 rounded-2xl shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10 text-center">
              <div className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
                {CONTENT.calculator.labels.revenue}
              </div>
              <div className="text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                {potentialRevenue.toLocaleString()}{' '}
                <span className="text-2xl text-gray-600">PLN</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold text-gray-300">
                <TrendingUp size={14} className="text-success" />
                {CONTENT.calculator.labels.profit}: {(potentialRevenue - budget).toLocaleString()}{' '}
                PLN
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAdsCalculator;
