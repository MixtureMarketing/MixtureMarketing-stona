import React from 'react';
import BaseCard from '../../common/BaseCard';

interface BrowserMockupProps {
  scale: 'startup' | 'enterprise';
}

/**
 * Ilustracje oferty bez atrap (2026-07-17): wcześniej enterprise-mockup
 * udawał żywą infrastrukturę („uptime: 99.9%", pingująca kropka
 * „Infrastructure operational..."), a wizual marketingu — dashboard BI
 * z wymyślonym „REAL-TIME ROAS 8.4x" i skaczącymi słupkami „DATA FLOW".
 * Teraz: jawnie abstrakcyjne makiety (aria-hidden) i uczciwy schemat
 * kanałów omnichannel. SLA w snippetcie = potwierdzone 99.5%.
 */
export const BrowserMockup: React.FC<BrowserMockupProps> = ({ scale }) => (
  <BaseCard
    variant="solid"
    padding="none"
    rounded="3xl"
    className="relative aspect-video overflow-hidden border-gray-200 shadow-2xl"
  >
    <div
      className="bg-gray-100/50 rounded-xl w-full h-full flex flex-col overflow-hidden"
      aria-hidden="true"
    >
      {/* Browser Mockup Header */}
      <div className="bg-white/80 h-8 flex items-center px-4 gap-2 border-b border-gray-200">
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="mx-auto bg-gray-100 rounded-full h-4 w-48"></div>
      </div>
      {/* Mockup Content */}
      <div className="p-6 flex-grow">
        {scale === 'startup' ? (
          <div className="space-y-4">
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
                <code className="block text-white/40">{'// przykładowa konfiguracja'}</code>
                <code className="block">const system = {'{'}</code>
                <code className="block ml-4">scale: 'Enterprise',</code>
                <code className="block ml-4">security: 'WAF',</code>
                <code className="block ml-4">sla: '99.5%',</code>
                <code className="block">{'}'}</code>
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
      <div className="space-y-6" aria-hidden="true">
        <div className="flex justify-between items-end">
          <h3 className="font-bold text-dark">Lejek sprzedażowy</h3>
          <span className="text-xs font-bold text-gray-600">Schemat</span>
        </div>
        <div className="space-y-2">
          <div className="h-12 bg-secondary rounded-lg flex items-center px-4 text-white text-xs font-bold">
            Świadomość (Google Ads)
          </div>
          <div className="h-12 bg-secondary/80 rounded-lg flex items-center px-4 text-white text-xs font-bold w-[80%] mx-auto">
            Rozważanie (Meta Ads)
          </div>
          <div className="h-12 bg-accent-dark rounded-lg flex items-center px-4 text-white text-xs font-bold w-[60%] mx-auto">
            Konwersja (remarketing)
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-4" aria-hidden="true">
        <h3 className="font-bold text-dark">Kanały pod jednym raportem</h3>
        <div className="grid grid-cols-2 gap-3">
          {['Google Ads', 'Meta Ads', 'YouTube', 'E-mail / automation'].map((ch) => (
            <div
              key={ch}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs font-bold text-dark text-center"
            >
              {ch}
            </div>
          ))}
        </div>
        <div className="self-center mx-auto h-4 w-px bg-gray-300"></div>
        <div className="p-4 bg-secondary rounded-xl text-white text-xs font-bold text-center shadow-md">
          Jeden raport BI · jedna strategia
        </div>
      </div>
    )}
  </BaseCard>
);
