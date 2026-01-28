import React, { memo } from 'react';
import { Plug, Link } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';

export interface IntegrationCategory {
  name: string;
  icon: React.ReactNode;
  tools: string[];
  color?: string; // Optional accent color
}

interface IntegrationGridProps {
  categories: IntegrationCategory[];
}

const IntegrationGrid: React.FC<IntegrationGridProps> = memo(({ categories }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {categories.map((cat, i) => (
        <AnimateOnScroll key={i} delay={i * 100} className="h-full">
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
            {/* Top Connector Status */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xxs font-bold text-gray-600 uppercase">Active</span>
            </div>

            {/* Icon */}
            <div
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-6 transition-transform duration-500 group-hover:scale-110 shadow-sm"
              style={{
                backgroundColor: cat.color ? `${cat.color}15` : '#F3F4F6',
                color: cat.color || '#374151',
              }}
            >
              {cat.icon}
            </div>

            <h3 className="font-bold text-dark text-base md:text-lg text-left mb-3 md:mb-4">
              {cat.name}
            </h3>

            {/* Tools List as Tags */}
            <div className="flex flex-wrap gap-2 mb-6 flex-grow content-start">
              {cat.tools.map((tool, j) => (
                <span
                  key={j}
                  className="px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-600 flex items-center gap-1"
                >
                  <Link size={8} className="text-gray-600" /> {tool}
                </span>
              ))}
            </div>

            {/* Bottom Connector Graphic */}
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-600 group-hover:text-primary transition-colors">
              <span>API Ready</span>
              <Plug size={14} />
            </div>
          </div>
        </AnimateOnScroll>
      ))}
    </div>
  );
});

IntegrationGrid.displayName = 'IntegrationGrid';

export default IntegrationGrid;
