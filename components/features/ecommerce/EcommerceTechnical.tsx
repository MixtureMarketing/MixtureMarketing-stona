import React from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import { ECOMMERCE_CONTENT as CONTENT, WEB_DEV_CONTENT } from '../../../data/content';

const EcommerceTechnical: React.FC = () => {
  return (
    <section className="py-24 bg-deep-dark text-white relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-success text-xs font-bold uppercase tracking-wider mb-6">
                <Search size={14} /> {CONTENT.seoTechnical.badge}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {CONTENT.seoTechnical.title.line1} <br />
                {CONTENT.seoTechnical.title.line2}{' '}
                <span className="text-success">{CONTENT.seoTechnical.title.line3}</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                {CONTENT.seoTechnical.description}
              </p>

              <div className="space-y-6">
                {CONTENT.seoTechnical.features.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-success shrink-0 border border-white/10">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>

          <div className="lg:w-1/2 w-full">
            <AnimateOnScroll delay={200}>
              <div className="grid grid-cols-2 gap-4">
                {WEB_DEV_CONTENT.infrastructure.stats.map((stat, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="text-3xl font-black text-white mb-1">{stat.val}</div>
                    <div className="text-xxs font-bold text-gray-500 uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-success/20 to-transparent border border-success/20">
                <h3 className="text-xl font-bold mb-2">Bezpieczeństwo klasy Enterprise</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {WEB_DEV_CONTENT.infrastructure.description}
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EcommerceTechnical;
