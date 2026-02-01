import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import BaseCard from '../../common/BaseCard';

export const WebAppHeroVisual: React.FC = () => {
  const [randomHeights] = useState(() =>
    Array.from({ length: 20 }).map((_, i) => ((i * 17) % 80) + 10),
  );

  return (
    <BaseCard
      variant="dark"
      padding="md"
      rounded="xl"
      className="relative z-10 border-[#334155] shadow-2xl overflow-hidden group hover:shadow-[0_0_40px_rgba(97,182,222,0.15)] transition-shadow duration-500"
    >
      <div className="flex justify-between items-center mb-6 border-b border-[#334155] pb-4">
        <div className="text-xs font-mono text-primary flex items-center gap-2">
          <Activity size={14} className="animate-pulse" /> SYSTEM_MONITOR_V2
        </div>
        <div className="text-xxs font-mono text-green-400">UPTIME: 99.99%</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155]">
          <div className="text-xxs text-gray-300 mb-2 font-mono uppercase">Aktywni Użytkownicy</div>
          <div className="text-2xl font-bold text-white mb-2">12,450</div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[75%] animate-pulse"></div>
          </div>
        </div>
        <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155]">
          <div className="text-xxs text-gray-200 mb-2 font-mono uppercase">Obciążenie Serwera</div>
          <div className="text-2xl font-bold text-white mb-2">34%</div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-success w-[34%]"></div>
          </div>
        </div>
        <div className="col-span-2 bg-[#1E293B] p-4 rounded-lg border border-[#334155] relative overflow-hidden h-32 flex items-end">
          <div className="flex items-end justify-between w-full h-20 gap-1">
            {randomHeights.map((h, i) => (
              <div
                key={i}
                className="bg-secondary w-full rounded-t opacity-80 transition-all duration-500"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </BaseCard>
  );
};
