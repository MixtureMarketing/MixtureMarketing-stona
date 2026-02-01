import React from 'react';
import {
  Settings,
  FileCode,
  Database,
  LayoutTemplate,
  Users,
  ShoppingCart,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import LazyHydrate from '../../common/LazyHydrate';
import SectionWrapper from '../../common/SectionWrapper';
import { WEB_DEV_CONTENT } from '../../../data/content';

const WebDevAdminPanel: React.FC = () => {
  return (
    <SectionWrapper variant="white" overflow={true}>
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2 order-2 lg:order-1">
          <AnimateOnScroll>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
              <Settings size={14} /> {WEB_DEV_CONTENT.adminPanel.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
              {WEB_DEV_CONTENT.adminPanel.title}
              <br />
              <span className="text-primary">{WEB_DEV_CONTENT.adminPanel.titleAccent}</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {WEB_DEV_CONTENT.adminPanel.description}
            </p>
            <div className="space-y-6">
              {WEB_DEV_CONTENT.adminPanel.sections.map((section, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-light-gray flex items-center justify-center text-secondary shrink-0 border border-gray-100 shadow-sm">
                    {i === 0 ? <FileCode size={20} /> : <Database size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-dark text-lg">{section.title}</h3>
                    <p className="text-sm text-gray-700 mt-1">{section.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>

        <div className="lg:w-1/2 w-full order-1 lg:order-2">
          <LazyHydrate whenVisible>
            <AnimateOnScroll delay={200}>
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex h-[450px]">
                  {/* Sidebar */}
                  <div className="w-64 bg-[#F8FAFC] border-r border-gray-200 flex flex-col hidden sm:flex">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-dark flex items-center justify-center text-white font-bold text-xs">
                          M
                        </div>
                        <span className="font-bold text-dark text-sm">Mixture Admin</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-dark">
                        <LayoutTemplate size={16} className="text-primary" /> Dashboard
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                        <Users size={16} /> Użytkownicy
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                        <ShoppingCart size={16} /> Zamówienia
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                        <Settings size={16} /> Ustawienia
                      </div>
                    </div>
                    <div className="mt-auto p-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-secondary text-xs font-bold">
                          JD
                        </div>
                        <div className="text-xs">
                          <div className="font-bold text-dark">Jan D.</div>
                          <div className="text-gray-600">Administrator</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 bg-white p-6 sm:p-8 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <div className="text-2xl font-bold text-dark mb-1">Przegląd Systemu</div>
                        <div className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>{' '}
                          System Operational
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-3 py-1.5 border border-gray-200 rounded-md text-xs font-bold text-gray-700 bg-white shadow-sm cursor-pointer hover:border-primary">
                          Export CSV
                        </div>
                        <div className="px-3 py-1.5 bg-dark text-white rounded-md text-xs font-bold shadow-md cursor-pointer hover:bg-secondary">
                          + Add New
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                      <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
                        <div className="text-xs text-gray-600 uppercase font-bold tracking-wider mb-2">
                          Total Users
                        </div>
                        <div className="text-2xl font-black text-dark">12,450</div>
                        <div className="text-xxs text-success mt-1 font-medium flex items-center gap-1">
                          <TrendingUp size={10} /> +12% this week
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
                        <div className="text-xs text-gray-600 uppercase font-bold tracking-wider mb-2">
                          Revenue
                        </div>
                        <div className="text-2xl font-black text-dark">$45.2k</div>
                        <div className="text-xxs text-success mt-1 font-medium flex items-center gap-1">
                          <TrendingUp size={10} /> +5% this week
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white hidden md:block">
                        <div className="text-xs text-gray-600 uppercase font-bold tracking-wider mb-2">
                          Active Sessions
                        </div>
                        <div className="text-2xl font-black text-dark">342</div>
                        <div className="text-xxs text-gray-600 mt-1 font-medium">
                          Currently online
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden flex-1 shadow-sm">
                      <div className="bg-light-gray px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Ostatnie Transakcje
                        </span>
                        <MoreHorizontal size={16} className="text-gray-600" />
                      </div>
                      <div className="divide-y divide-gray-100">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="px-4 py-3 flex items-center justify-between hover:bg-light-gray transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-secondary font-bold text-xs">
                                #{i}02
                              </div>
                              <div>
                                <div className="text-xs font-bold text-dark">
                                  Zamówienie #{i}245
                                </div>
                                <div className="text-xxs text-gray-600">2 min temu</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-dark">250.00 PLN</div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xxs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </LazyHydrate>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default WebDevAdminPanel;
