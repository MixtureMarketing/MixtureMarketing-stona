import React from 'react';
import { Server, Database, Target, Globe, Lock } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { META_ADS_CONTENT as CONTENT } from '../../../data/content';

const MetaAdsCapi: React.FC = () => {
  return (
    <SectionWrapper variant="dark" overflow={true}>
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <AnimateOnScroll>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-success text-xs font-bold uppercase tracking-wider mb-6">
              <Server size={14} /> {CONTENT.capi.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {CONTENT.capi.title.line1} <br />
              <span className="text-success">{CONTENT.capi.title.line2}</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">{CONTENT.capi.description}</p>

            <div className="space-y-4">
              {CONTENT.capi.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-success/30 transition-colors"
                >
                  {i === 0 ? (
                    <Database size={24} className="text-success" />
                  ) : (
                    <Target size={24} className="text-instagram" />
                  )}
                  <div>
                    <span className="text-white font-bold block">{feature.title}</span>
                    <span className="text-gray-300 text-sm">{feature.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>

        <div className="lg:w-1/2 flex justify-center">
          <AnimateOnScroll delay={200}>
            <div className="bg-[#1E293B] rounded-xl p-8 border border-gray-700 shadow-2xl relative w-full max-w-md font-mono text-xs">
              <div className="flex justify-between items-center text-gray-600 mb-6 border-b border-gray-700 pb-4">
                <div className="flex items-center gap-2">
                  <Globe size={14} /> Client Browser
                </div>
                <div className="text-red-400 font-bold flex items-center gap-1">
                  <Lock size={12} /> BLOCKED
                </div>
                <div className="flex items-center gap-2 text-[#405DE6]">
                  <Server size={14} /> Meta Graph API
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="text-gray-700">
                  {'>'} Initiating Pixel Event...{' '}
                  <span className="text-red-400">Failed (Cookie Blocked)</span>
                </div>
                <div className="text-gray-700">{'>'} Switching to Server-Side...</div>
                <div className="text-white bg-deep-dark p-3 rounded border border-gray-700">
                  <span className="text-instagram">POST</span> /events <br />
                  {`{`} <br />
                  &nbsp;&nbsp;"event_name": "Purchase", <br />
                  &nbsp;&nbsp;"event_time": 169420000, <br />
                  &nbsp;&nbsp;"user_data": {`{ "em": "hash...", "ph": "hash..." }`}, <br />
                  &nbsp;&nbsp;"value": 249.00 <br />
                  {`}`}
                </div>
                <div className="text-success font-bold">{'>'} Success. Event ID: 849201</div>
              </div>

              <div className="absolute -top-3 -right-3 bg-success text-white px-3 py-1 rounded-full text-xxs font-bold shadow-lg animate-pulse">
                CAPI CONNECTED
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default MetaAdsCapi;
