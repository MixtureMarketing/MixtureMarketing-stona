import React from 'react';
import { Star, ArrowRight } from 'lucide-react';

// Refactored sub-visuals
import BackendIcebergHero from './backend/BackendIcebergHero';
import RestaurantAnalogyVisual from './backend/RestaurantAnalogyVisual';
import ArchitectureComparisonVisual from './backend/ArchitectureComparisonVisual';

export { BackendIcebergHero, RestaurantAnalogyVisual, ArchitectureComparisonVisual };

// 3. TECHNOLOGY STARS TABLE
interface Technology {
  name: string;
  power: string;
  ttm: number;
  perf: number;
  label: string;
  dev: number;
}
interface TechnologyStarsTableProps {
  content: { technologies: Technology[] };
}

export const TechnologyStarsTable = ({ content }: TechnologyStarsTableProps) => {
  const renderStars = (count: number) => (
    <div className="flex gap-0.5 justify-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < count ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
        />
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-2xl bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-dark text-white">
            <th className="p-6 text-left font-bold uppercase tracking-wider text-xxs">
              Technologia
            </th>
            <th className="p-6 text-center font-bold uppercase tracking-wider text-xxs hidden md:table-cell">
              Główna Supermoc
            </th>
            <th className="p-6 text-center font-bold uppercase tracking-wider text-xxs">
              Time-to-Market
            </th>
            <th className="p-6 text-center font-bold uppercase tracking-wider text-xxs">
              Wydajność
            </th>
            <th className="p-6 text-center font-bold uppercase tracking-wider text-xxs hidden sm:table-cell">
              Rynek Pracy
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {content.technologies.map((tech) => (
            <tr key={tech.name} className="hover:bg-blue-50/30 transition-colors">
              <td className="p-6">
                <div className="font-bold text-dark">{tech.name}</div>
              </td>
              <td className="p-6 text-center hidden md:table-cell">
                <span className="text-xxs font-bold text-secondary px-3 py-1 bg-blue-50 rounded-full border border-blue-100 uppercase tracking-widest">
                  {tech.power}
                </span>
              </td>
              <td className="p-6 text-center">
                {renderStars(tech.ttm)}
                <div className="text-xxxs mt-1 text-gray-400 font-bold uppercase">
                  {tech.ttm === 5 ? 'Najszybciej' : ''}
                </div>
              </td>
              <td className="p-6 text-center">
                {renderStars(tech.perf)}
                <div className="text-xxxs mt-1 text-gray-400 font-bold uppercase">
                  {tech.perf === 5 ? 'Demon Prędkości' : ''}
                </div>
              </td>
              <td className="p-6 text-center hidden sm:table-cell">
                <div className="text-xxs font-bold text-gray-700 mb-1 uppercase tracking-tighter">
                  {tech.label}
                </div>
                {renderStars(tech.dev)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 5. BACKEND DECISION TREE
interface DecisionStep {
  step: string;
  q: string;
  ans: string;
}
interface BackendDecisionTreeProps {
  content: { steps: DecisionStep[] };
}

export const BackendDecisionTree = ({ content }: BackendDecisionTreeProps) => (
  <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-[3rem] p-8 md:p-12 border border-blue-100 shadow-inner relative overflow-hidden not-prose">
    <div
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage: 'radial-gradient(#61B6DE 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    ></div>
    <div className="relative z-10 space-y-10">
      {content.steps.map((step, i) => (
        <div key={i} className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-1/2 bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between group hover:border-blue-400 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-blue-600/20">
                {step.step}
              </div>
              <span className="font-bold text-dark">{step.q}</span>
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="flex-1 w-full">
            <div
              className={`p-5 rounded-2xl text-center shadow-xl transform hover:-translate-y-1 transition-transform border ${i === 0 ? 'bg-emerald-500 border-emerald-400' : i === 1 ? 'bg-blue-600 border-blue-500' : i === 2 ? 'bg-dark border-white/10' : 'bg-cyan-600 border-cyan-500'} text-white`}
            >
              <div className="text-xxxs font-black uppercase mb-1 tracking-widest opacity-80">
                Wybierz:
              </div>
              <div className="font-black text-lg">{step.ans}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
