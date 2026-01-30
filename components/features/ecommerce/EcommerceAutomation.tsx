import React from 'react';
import { Database, ShoppingCart, Package, Truck, FileText, TrendingUp } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import LazyHydrate from '../../common/LazyHydrate';
import { ECOMMERCE_CONTENT as CONTENT } from '../../../data/content';

const EcommerceAutomation: React.FC = () => {
  return (
    <LazyHydrate whenVisible>
      <section id="automation" className="py-24 bg-white relative z-10 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.automation.title}
            description={CONTENT.automation.description}
            className="mb-16"
          />

          <div className="relative w-full max-w-4xl mx-auto">
            {/* --- MOBILE VIEW --- */}
            <div className="md:hidden flex flex-col items-center gap-8 py-8">
              <div className="relative z-20 w-32 h-32 bg-dark rounded-full flex flex-col items-center justify-center text-white shadow-xl border-4 border-[#E0EFFF] animate-pulse">
                <Database size={40} className="text-primary mb-2" />
                <span className="font-bold text-xs uppercase tracking-widest">
                  {CONTENT.automation.hubs.myStore}
                </span>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-dark to-gray-200 -my-4 relative z-0"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full relative z-10">
                {CONTENT.automation.integrations.map((item, i) => {
                  const icons = [
                    <ShoppingCart key="cart" size={20} />,
                    <Package key="pkg" size={20} />,
                    <Truck key="truck" size={20} />,
                    <FileText key="file" size={20} />,
                    <TrendingUp key="trend" size={20} />,
                  ];
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gray-300 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md shrink-0"
                        style={{ backgroundColor: item.color }}
                      >
                        {icons[i]}
                      </div>
                      <span className="font-bold text-dark text-sm">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --- DESKTOP VIEW --- */}
            <div className="hidden md:flex relative h-[500px] items-center justify-center">
              <div className="relative z-20 w-40 h-40 bg-dark rounded-full flex flex-col items-center justify-center text-white shadow-2xl border-8 border-[#E0EFFF] animate-pulse-slow group cursor-default hover:scale-105 transition-transform">
                <Database size={40} className="text-primary mb-2" />
                <span className="font-bold text-sm uppercase tracking-widest">
                  {CONTENT.automation.hubs.myStore}
                </span>
                <span className="text-xxs text-gray-600">{CONTENT.automation.hubs.masterData}</span>
                <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-20"></div>
              </div>

              {CONTENT.automation.integrations.map((item, i) => {
                const icons = [
                  <ShoppingCart key="cart" size={20} />,
                  <Package key="pkg" size={20} />,
                  <Truck key="truck" size={20} />,
                  <FileText key="file" size={20} />,
                  <TrendingUp key="trend" size={20} />,
                ];
                return (
                  <div
                    key={i}
                    className="absolute inset-0 m-auto w-[360px] h-[360px] pointer-events-none"
                    style={{
                      animation: `ecommerce-orbit 20s linear infinite`,
                      animationDelay: `-${i * 4}s`,
                    }}
                  >
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group pointer-events-auto"
                      style={{
                        animation: `ecommerce-counter-orbit 20s linear infinite`,
                        animationDelay: `-${i * 4}s`,
                      }}
                    >
                      <div
                        className="w-16 h-16 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 group-hover:scale-110 group-hover:border-current transition-all mb-2 relative z-10"
                        style={{ color: item.color }}
                      >
                        {icons[i]}
                      </div>
                      <span className="text-xs font-bold text-gray-600 bg-white px-2 py-1 rounded shadow-sm border border-gray-100 whitespace-nowrap">
                        {item.label}
                      </span>
                      <div className="absolute top-full left-1/2 w-0.5 h-[140px] bg-gradient-to-b from-gray-200 to-transparent -z-10 origin-top opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                );
              })}

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[360px] h-[360px] rounded-full border border-dashed border-gray-200 animate-spin-slow"></div>
                <div className="w-[500px] h-[500px] rounded-full border border-gray-100 absolute opacity-50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LazyHydrate>
  );
};

export default EcommerceAutomation;
