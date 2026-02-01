import React from 'react';
import { ShieldAlert, BarChart3 } from 'lucide-react';
import { LEAD_MAGNET_CONTENT as CONTENT } from '../../data/content';
import BaseCard from '../common/BaseCard';

export const AuditVisual: React.FC = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-primary rounded-full blur-[100px] opacity-20 animate-pulse"></div>
    <BaseCard
      variant="glass"
      padding="lg"
      rounded="3xl"
      className="relative border border-white/20 backdrop-blur-xl shadow-2xl"
    >
      {/* Fake UI Chart */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xxs font-black text-gray-300 uppercase tracking-widest">
          {CONTENT.visual.label}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-end gap-2 h-24">
          {[40, 70, 45, 90, 65, 80].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t-md transition-all duration-1000"
              style={{ height: `${h}%` }}
            ></div>
          ))}
        </div>

        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <ShieldAlert className="text-red-500 shrink-0" size={20} />
          <div>
            <div className="text-xs font-bold text-white mb-1">{CONTENT.visual.error.title}</div>
            <div className="text-xxs text-gray-300 leading-snug">{CONTENT.visual.error.desc}</div>
          </div>
        </div>

        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
          <BarChart3 className="text-green-500 shrink-0" size={20} />
          <div>
            <div className="text-xs font-bold text-white mb-1">{CONTENT.visual.growth.title}</div>
            <div className="text-xxs text-gray-300 leading-snug">{CONTENT.visual.growth.desc}</div>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
);
