import React from 'react';
import { MousePointer2, Server, Rocket, Search, Database, FileText, Layout } from 'lucide-react';

export const DatabaseHeroVisual = () => {
  return (
    <div className="relative w-full bg-[#0B1120] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-white/10 shadow-2xl min-h-[600px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]"></div>

      <div className="flex flex-col gap-8 relative z-10 max-w-4xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-6 mb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 shadow-sm">
                <MousePointer2 size={24} className="text-gray-500" />
              </div>
              <span className="text-xxs font-bold uppercase text-gray-400 tracking-widest">
                Użytkownik
              </span>
            </div>

            <div className="w-24 h-0.5 bg-gradient-to-r from-gray-300 to-blue-500 relative">
              <div className="absolute right-0 -top-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="px-8 py-4 bg-dark rounded-2xl shadow-xl flex items-center gap-3 border border-secondary relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                <Server size={24} className="text-white" />
                <span className="text-white font-bold text-sm">Backend API</span>
              </div>
              <span className="text-xxs font-bold uppercase text-blue-800 tracking-widest">
                Logic Layer
              </span>
            </div>
          </div>
        </div>

        <div className="h-12 w-0.5 bg-gray-300 mx-auto relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-100 px-4 py-1 rounded-full border border-gray-200 text-xxs font-black uppercase text-gray-500 tracking-widest">
            Data Persistence Layer
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="relative p-5 rounded-2xl border border-red-100 bg-red-50/30 flex items-start gap-4 hover:bg-white hover:shadow-md transition-all">
              <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-red-200/50 hidden md:block"></div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 text-red-600">
                <Rocket size={20} />
              </div>
              <div>
                <div className="text-xxs font-black text-red-500 uppercase tracking-wide mb-1">
                  1. Hot Data (Cache)
                </div>
                <h4 className="font-bold text-gray-800 text-sm">Redis</h4>
                <p className="text-xs text-gray-500 mt-1">Sesja, Koszyk, Tokeny</p>
              </div>
            </div>

            <div className="relative p-5 rounded-2xl border border-yellow-100 bg-yellow-50/30 flex items-start gap-4 hover:bg-white hover:shadow-md transition-all">
              <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-yellow-200/50 hidden md:block"></div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 text-yellow-600">
                <Search size={20} />
              </div>
              <div>
                <div className="text-xxs font-black text-yellow-500 uppercase tracking-wide mb-1">
                  2. Search Engine
                </div>
                <h4 className="font-bold text-gray-800 text-sm">Elasticsearch</h4>
                <p className="text-xs text-gray-500 mt-1">Katalog, Filtry, Autocomplete</p>
              </div>
            </div>

            <div className="relative p-5 rounded-2xl border border-blue-100 bg-blue-50/30 flex items-start gap-4 hover:bg-white hover:shadow-md transition-all">
              <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-blue-200/50 hidden md:block"></div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
                <Database size={20} />
              </div>
              <div>
                <div className="text-xxs font-black text-blue-500 uppercase tracking-wide mb-1">
                  3. Core Data (SQL)
                </div>
                <h4 className="font-bold text-gray-800 text-sm">PostgreSQL</h4>
                <p className="text-xs text-gray-500 mt-1">Zamówienia, Płatności, Faktury</p>
              </div>
            </div>

            <div className="relative p-5 rounded-2xl border border-green-100 bg-green-50/30 flex items-start gap-4 hover:bg-white hover:shadow-md transition-all">
              <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-green-200/50 hidden md:block"></div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 text-green-600">
                <FileText size={20} />
              </div>
              <div>
                <div className="text-xxs font-black text-green-500 uppercase tracking-wide mb-1">
                  4. Big Data (NoSQL)
                </div>
                <h4 className="font-bold text-gray-800 text-sm">MongoDB</h4>
                <p className="text-xs text-gray-500 mt-1">Logi, Analityka, Rekomendacje</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
    </div>
  );
};

export const DatabaseArchitectureVisual = () => {
  return (
    <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden not-prose">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
        <div className="flex flex-col items-center gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
            <Layout size={24} />
          </div>
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-widest text-blue-800">
              Frontend
            </div>
            <div className="text-xxs text-blue-600 font-bold">Next.js / React</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-full h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-blue-100 text-xxs font-bold text-blue-600">
              API Requests
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600">
            <Server size={24} />
          </div>
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-widest text-slate-800">
              Backend
            </div>
            <div className="text-xxs text-slate-600 font-bold">Node.js / Python</div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: 'Redis', label: 'Cache', color: 'red' },
          { name: 'Postgres', label: 'SQL', color: 'blue' },
          { name: 'Mongo', label: 'NoSQL', color: 'green' },
          { name: 'Elastic', label: 'Search', color: 'yellow' },
        ].map((db, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border border-${db.color}-100 bg-${db.color}-50/30 text-center`}
          >
            <div className={`text-xxs font-black text-${db.color}-600 uppercase`}>{db.label}</div>
            <div className="font-bold text-gray-800 text-sm">{db.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
