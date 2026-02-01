import React from 'react';
import BaseCard from '../../common/BaseCard';
import { PieChart } from 'lucide-react';

interface BrowserMockupProps {
  scale: 'startup' | 'enterprise';
}

export const BrowserMockup: React.FC<BrowserMockupProps> = ({ scale }) => (
  <BaseCard
    variant="glass"
    padding="none"
    rounded="3xl"
    className="relative aspect-video overflow-hidden border-white/40 shadow-2xl"
  >
    <div className="bg-gray-100/50 rounded-xl w-full h-full flex flex-col overflow-hidden border border-gray-200/50">
      {/* Browser Mockup Header */}
      <div className="bg-white/80 h-8 flex items-center px-4 gap-2 border-b border-gray-200">
        <div className="w-2 h-2 rounded-full bg-red-400"></div>
        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
        <div className="w-2 h-2 rounded-full bg-green-400"></div>
        <div className="mx-auto bg-gray-100 rounded-full h-4 w-48"></div>
      </div>
      {/* Mockup Content */}
      <div className="p-6 flex-grow">
        {scale === 'startup' ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-primary/20 rounded-lg w-3/4"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 bg-white rounded-xl border border-gray-100"></div>
              <div className="h-24 bg-white rounded-xl border border-gray-100"></div>
              <div className="h-24 bg-white rounded-xl border border-gray-100"></div>
            </div>
            <div className="h-32 bg-white rounded-xl border border-gray-100"></div>
          </div>
        ) : (
          <div className="flex gap-6 h-full">
            <div className="w-1/4 bg-white rounded-xl border border-gray-100 p-4 space-y-4">
              <div className="h-2 bg-gray-100 rounded w-full"></div>
              <div className="h-2 bg-gray-100 rounded w-3/4"></div>
              <div className="h-2 bg-gray-100 rounded w-5/6"></div>
            </div>
            <div className="w-3/4 space-y-4">
              <div className="h-full bg-slate-900 rounded-xl p-4 font-mono text-xxs text-primary overflow-hidden">
                <code className="block">const system = {'{'}</code>
                <code className="block ml-4">scale: 'Enterprise',</code>
                <code className="block ml-4">security: 'WAF_ENABLED',</code>
                <code className="block ml-4">uptime: '99.9%',</code>
                <code className="block">{'}'}</code>
                <div className="mt-4 flex gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <span className="text-green-500">Infrastructure operational...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </BaseCard>
);

export const SalesFunnelVisual: React.FC<{ scale: 'startup' | 'enterprise' }> = ({ scale }) => (
  <BaseCard
    variant="solid"
    padding="lg"
    rounded="3xl"
    className="shadow-2xl border border-gray-100 relative overflow-hidden h-full min-h-[300px]"
  >
    {scale === 'startup' ? (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="font-bold text-dark">Lejek Sprzedażowy</h3>
          <span className="text-xs font-bold text-success">Active Campaign</span>
        </div>
        <div className="space-y-2">
          <div className="h-12 bg-secondary rounded-lg flex items-center px-4 text-white text-xs font-bold">
            Awareness (Google Ads)
          </div>
          <div className="h-12 bg-secondary/80 rounded-lg flex items-center px-4 text-white text-xs font-bold w-[80%] mx-auto">
            Consideration (Meta Ads)
          </div>
          <div className="h-12 bg-instagram rounded-lg flex items-center px-4 text-white text-xs font-bold w-[60%] mx-auto">
            Conversion (Remarketing)
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-6">
        <h3 className="font-bold text-dark">Omnichannel BI Dashboard</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-xxs font-bold text-gray-400 mb-1">REAL-TIME ROAS</div>
            <div className="text-xl font-black text-secondary">8.4x</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-xxs font-bold text-gray-500 mb-1">DATA FLOW</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-4 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-32 bg-indigo-50/50 rounded-xl flex items-center justify-center border border-dashed border-indigo-200">
          <PieChart size={48} className="text-secondary/20" />
        </div>
      </div>
    )}
  </BaseCard>
);
