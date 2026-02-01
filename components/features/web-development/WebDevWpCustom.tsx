import React from 'react';
import { Plug, CheckCircle2, FileCode, Zap } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import LazyHydrate from '../../common/LazyHydrate';
import SectionWrapper from '../../common/SectionWrapper';
import { WEB_DEV_CONTENT } from '../../../data/content';

const WebDevWpCustom: React.FC = () => {
  return (
    <SectionWrapper variant="white" overflow={true}>
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <AnimateOnScroll>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
              <Plug size={14} /> {WEB_DEV_CONTENT.wpCustom.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
              {WEB_DEV_CONTENT.wpCustom.title} <br />
              <span className="text-primary">{WEB_DEV_CONTENT.wpCustom.titleAccent}</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {WEB_DEV_CONTENT.wpCustom.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WEB_DEV_CONTENT.wpCustom.features.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 bg-light-gray rounded-xl border border-gray-100 hover:border-secondary/30 transition-colors"
                >
                  <CheckCircle2 size={20} className="text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-dark text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-700 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>

        <div className="lg:w-1/2 w-full relative flex justify-center lg:justify-end">
          <LazyHydrate whenVisible>
            <AnimateOnScroll delay={200} className="w-full max-w-lg">
              <div className="relative group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all duration-500"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>

                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-500 hover:-translate-y-2">
                  <div className="bg-[#1E293B] p-4 flex items-center justify-between border-b border-[#334155]">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                    </div>
                    <div className="text-xxs font-mono text-gray-500 flex items-center gap-2">
                      <FileCode size={12} /> custom-logic.php
                    </div>
                  </div>
                  <div className="p-6 bg-[#0F172A] overflow-x-auto">
                    <pre className="font-mono text-xs md:text-sm leading-relaxed">
                      <div className="flex">
                        <span className="text-gray-500 select-none mr-4">1</span>
                        <span className="text-[#C792EA]">add_filter</span>
                        <span className="text-[#89DDFF]">(</span>
                        <span className="text-[#C3E88D]">'woocommerce_get_price'</span>
                        <span className="text-[#89DDFF]">,</span>{' '}
                        <span className="text-[#C792EA]">function</span>
                        <span className="text-[#89DDFF]">(</span>
                        <span className="text-[#FFCB6B]">$price</span>
                        <span className="text-[#89DDFF]">)</span>{' '}
                        <span className="text-[#89DDFF]">{'{'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-500 select-none mr-4">2</span>{' '}
                        <span className="text-gray-500">{'// Connect to External ERP'}</span>
                      </div>{' '}
                      <div className="flex">
                        <span className="text-gray-500 select-none mr-4">3</span>{' '}
                        <span className="text-[#C792EA]">if</span>{' '}
                        <span className="text-[#89DDFF]">(</span>
                        <span className="text-[#82AAFF]">App</span>
                        <span className="text-[#89DDFF]">\</span>
                        <span className="text-[#FFCB6B]">User</span>
                        <span className="text-[#89DDFF]">-&gt;</span>
                        <span className="text-[#82AAFF]">isB2B</span>
                        <span className="text-[#89DDFF]">())</span>{' '}
                        <span className="text-[#89DDFF]">{'{'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-500 select-none mr-4">4</span>{' '}
                        <span className="text-[#FFCB6B]">$discount</span>{' '}
                        <span className="text-[#89DDFF]">=</span>{' '}
                        <span className="text-[#82AAFF]">API</span>
                        <span className="text-[#89DDFF]">::</span>
                        <span className="text-[#82AAFF]">getDiscountLevel</span>
                        <span className="text-[#89DDFF]">();</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-500 select-none mr-4">5</span>{' '}
                        <span className="text-[#C792EA]">return</span>{' '}
                        <span className="text-[#FFCB6B]">$price</span>{' '}
                        <span className="text-[#89DDFF]">/</span>{' '}
                        <span className="text-[#FFCB6B]">$discount</span>
                        <span className="text-[#89DDFF]">;</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-500 select-none mr-4">6</span>{' '}
                        <span className="text-[#89DDFF]">{'}'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-500 select-none mr-4">7</span>{' '}
                        <span className="text-[#C792EA]">return</span>{' '}
                        <span className="text-[#FFCB6B]">$price</span>
                        <span className="text-[#89DDFF]">;</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-500 select-none mr-4">8</span>
                        <span className="text-[#89DDFF]">{'}'});</span>
                      </div>
                    </pre>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-float z-20">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-secondary">
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="text-xxs font-bold text-gray-500 uppercase tracking-wider">
                      Performance
                    </div>
                    <div className="text-sm font-black text-dark">0.02s Query Time</div>
                  </div>
                </div>

                <div className="absolute top-1/2 -right-8 bg-dark text-white p-3 rounded-lg shadow-lg flex items-center gap-2 transform rotate-90 origin-bottom-right z-10">
                  <Plug size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Connected</span>
                </div>
              </div>
            </AnimateOnScroll>
          </LazyHydrate>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default WebDevWpCustom;
