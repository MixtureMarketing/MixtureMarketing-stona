import React from 'react';
import { Zap, Target, CheckCircle2 } from 'lucide-react';
import Button from '../../../common/Button';
import { META_ADS_CONTENT as CONTENT } from '../../../../data/content';

interface FunnelCommandCenterProps {
  funnelStep: number;
  funnelStages: {
    icon: React.ReactNode;
    color: string;
    step: string;
    label: string;
    desc: string;
  }[];
  onCta: () => void;
}

const FunnelCommandCenter: React.FC<FunnelCommandCenterProps> = ({
  funnelStep,
  funnelStages,
  onCta,
}) => {
  return (
    <div className="lg:col-span-5">
      <div className="bg-deep-dark rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Zap size={14} className="fill-current" />
              <span className="text-xxs font-black uppercase tracking-widest">
                System Operational
              </span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight">
              {CONTENT.funnel.commandCenter.title}
              <br />
              {CONTENT.funnel.commandCenter.subtitle}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-success animate-ping"></div>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
            <h3 className="text-primary font-bold text-sm mb-4 flex items-center gap-2">
              <Target size={16} /> {CONTENT.funnel.commandCenter.goalsLabel}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
              "{funnelStages[funnelStep].desc}"
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-xxs text-gray-300 uppercase block mb-1">Key Metric</span>
                <span className="text-sm font-bold text-white">
                  {funnelStep === 0
                    ? 'CTR / CPM'
                    : funnelStep === 1
                      ? 'Video Views'
                      : funnelStep === 2
                        ? 'ROAS / CPA'
                        : 'Retention'}
                </span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-xxs text-gray-300 uppercase block mb-1">Priority</span>
                <span className="text-sm font-bold text-[#FFD700]">CRITICAL</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-300">
              <span>{CONTENT.funnel.commandCenter.efficiencyLabel}</span>
              <span className="text-success">98.2%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-[#00C853] transition-all duration-1000 ease-out"
                style={{ width: `${85 + funnelStep * 4}%` }}
              ></div>
            </div>
          </div>

          <ul className="space-y-4 pt-4">
            {CONTENT.funnel.commandCenter.features.map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-primary" /> {feat}
              </li>
            ))}
          </ul>

          <Button
            onClick={onCta}
            variant="primary"
            className="w-full justify-center !bg-white !text-deep-dark hover:!bg-primary hover:!text-white border-none py-6 text-lg shadow-xl shadow-primary/20"
          >
            {CONTENT.funnel.commandCenter.button}
          </Button>
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      </div>
    </div>
  );
};

export default FunnelCommandCenter;
