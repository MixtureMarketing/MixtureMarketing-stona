import React from 'react';
import { Unlock, BookOpen, FileCode, ShieldCheck, CheckCircle2 } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../../data/content';

const WebAppTrust: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <SectionHeader
              align="left"
              title={CONTENT.trust.title}
              description={CONTENT.trust.description}
            />
            <ul className="space-y-6 mt-8">
              {CONTENT.trust.items.map((item, i) => {
                const icons = [
                  <Unlock key="unlock" size={20} />,
                  <BookOpen key="book" size={20} />,
                  <FileCode key="code" size={20} />,
                ];
                return (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-blue-50 rounded-lg text-secondary">{icons[i]}</div>
                    <div>
                      <h3 className="font-bold text-dark">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:w-1/2 flex justify-center">
            <AnimateOnScroll delay={200}>
              <div className="relative bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 max-w-md transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                      Status Umowy
                    </div>
                    <div className="text-lg font-bold text-dark">IP Transfer Complete</div>
                  </div>
                </div>
                <div className="space-y-3 font-mono text-xs text-gray-700">
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>Source Code Ownership</span>
                    <CheckCircle2 size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>Database Schema</span>
                    <CheckCircle2 size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>API Documentation</span>
                    <CheckCircle2 size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>NDA Signed</span>
                    <CheckCircle2 size={16} className="text-green-500" />
                  </div>
                </div>
                <div className="mt-6 pt-4 text-center">
                  <div className="inline-block border-2 border-dark px-4 py-2 text-dark font-bold text-sm uppercase tracking-widest rounded opacity-20 transform -rotate-12">
                    CONFIDENTIAL
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebAppTrust;
