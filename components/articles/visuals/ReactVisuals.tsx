import React from 'react';
import { Code2, Smartphone, Globe, Layout, Repeat, TrendingUp } from 'lucide-react';

export const ReactHeroNetwork = () => {
  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-[#61DAFB]/20 shadow-2xl min-h-[600px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e293b] to-[#0F172A]"></div>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#61DAFB 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className="relative z-10 flex flex-col items-center w-full h-full justify-center">
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center animate-float z-20">
          <div className="w-20 h-20 bg-[#61DAFB] rounded-full shadow-[0_0_80px_rgba(97,218,251,0.8)] relative z-20 flex items-center justify-center border-4 border-[#0F172A]">
            <Code2 size={40} className="text-[#0F172A]" />
          </div>

          <div
            className="absolute w-full h-20 border-[3px] border-[#61DAFB]/60 rounded-[100%] animate-spin-slow"
            style={{ animationDuration: '8s' }}
          ></div>
          <div
            className="absolute w-full h-20 border-[3px] border-[#61DAFB]/60 rounded-[100%] animate-spin-slow"
            style={{ animationDuration: '8s', transform: 'rotate(60deg)' }}
          ></div>
          <div
            className="absolute w-full h-20 border-[3px] border-[#61DAFB]/60 rounded-[100%] animate-spin-slow"
            style={{ animationDuration: '8s', transform: 'rotate(-60deg)' }}
          ></div>
        </div>

        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-8 left-4 md:top-12 md:left-12 flex flex-col items-center gap-2 animate-bounce-slow z-30">
            <div className="bg-[#1e293b] p-4 rounded-2xl border border-[#61DAFB] shadow-[0_0_20px_rgba(97,218,251,0.3)]">
              <Smartphone size={24} className="text-[#61DAFB]" />
            </div>
            <span className="text-white text-xs font-bold uppercase tracking-widest bg-[#0F172A]/80 px-2 rounded">
              Mobile
            </span>
            <div className="absolute top-full left-1/2 w-px h-32 bg-gradient-to-b from-[#61DAFB]/50 to-transparent -z-10 rotate-[-45deg] origin-top"></div>
          </div>

          <div className="absolute bottom-8 right-4 md:bottom-12 md:right-12 flex flex-col-reverse items-center gap-2 animate-bounce-slow delay-700 z-30">
            <div className="bg-[#1e293b] p-4 rounded-2xl border border-[#61DAFB] shadow-[0_0_20px_rgba(97,218,251,0.3)]">
              <Globe size={24} className="text-[#61DAFB]" />
            </div>
            <span className="text-white text-xs font-bold uppercase tracking-widest bg-[#0F172A]/80 px-2 rounded">
              Web App
            </span>
            <div className="absolute bottom-full left-1/2 w-px h-32 bg-gradient-to-t from-[#61DAFB]/50 to-transparent -z-10 rotate-[-45deg] origin-bottom"></div>
          </div>

          <div className="absolute top-8 right-4 md:top-12 md:right-12 flex flex-col items-center gap-2 animate-bounce-slow delay-300 z-30">
            <div className="bg-[#1e293b] p-4 rounded-2xl border border-[#61DAFB] shadow-[0_0_20px_rgba(97,218,251,0.3)]">
              <Layout size={24} className="text-[#61DAFB]" />
            </div>
            <span className="text-white text-xs font-bold uppercase tracking-widest bg-[#0F172A]/80 px-2 rounded">
              Desktop
            </span>
            <div className="absolute top-full left-1/2 w-px h-32 bg-gradient-to-b from-[#61DAFB]/50 to-transparent -z-10 rotate-[45deg] origin-top"></div>
          </div>
        </div>

        <div className="text-center absolute bottom-12 z-50 p-4 rounded-xl backdrop-blur-sm bg-[#0F172A]/30">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            The <span className="text-[#61DAFB]">Universal</span> UI
          </h2>
          <p className="text-[#61DAFB]/70 font-mono text-sm uppercase tracking-[0.3em]">
            Learn Once • Write Anywhere
          </p>
        </div>
      </div>

      <style>{`
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-spin-slow { animation: spin 10s linear infinite; }
                .animate-bounce-slow { animation: bounceSlow 4s infinite; }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
    </div>
  );
};

export const InterfaceAssembly = () => {
  return (
    <div className="bg-gray-50 rounded-[2.5rem] p-8 md:p-12 border border-gray-200 shadow-inner relative overflow-hidden group">
      <div className="flex flex-col items-center relative z-10">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-500">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>

          <div className="p-6 grid grid-cols-3 gap-4">
            <div className="col-span-3 h-16 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 flex items-center justify-center text-blue-600 font-mono text-xs relative group/item">
              <span className="absolute -top-3 left-4 bg-blue-100 px-2 text-xxs font-bold">
                Header.jsx
              </span>
              Logo | Menu | Auth
            </div>

            <div className="col-span-1 h-48 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 flex items-center justify-center text-purple-600 font-mono text-xs relative group/item">
              <span className="absolute -top-3 left-4 bg-purple-100 px-2 text-xxs font-bold">
                Sidebar.jsx
              </span>
              Nav
            </div>

            <div className="col-span-2 h-48 rounded-lg border-2 border-dashed border-green-300 bg-green-50 flex flex-col gap-3 p-3 relative group/item">
              <span className="absolute -top-3 left-4 bg-green-100 px-2 text-xxs font-bold text-green-700">
                Feed.jsx
              </span>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded border border-green-200 bg-white flex items-center justify-center text-green-500 font-mono text-xxs"
                >
                  Card.jsx (Instance {i})
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-2">
          <div className="w-1 h-12 bg-gray-300 rounded-full"></div>
          <div className="w-1 h-12 bg-gray-300 rounded-full mx-1"></div>
          <div className="w-1 h-12 bg-gray-300 rounded-full"></div>
        </div>

        <div className="mt-4 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-widest">
          Zasada atomowa
        </div>
      </div>
    </div>
  );
};

export const ReactVennDiagram = () => {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-gray-100 shadow-xl relative overflow-hidden flex justify-center">
      <div className="relative w-[300px] h-[200px] md:w-[500px] md:h-[300px]">
        <div className="absolute left-0 top-0 w-48 h-48 md:w-72 md:h-72 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center mix-blend-multiply hover:scale-105 transition-transform duration-500">
          <div className="text-center -ml-12 mt-12 md:-ml-20">
            <Globe className="mx-auto text-blue-500 mb-2" size={32} />
            <span className="font-bold text-blue-900 block">React DOM</span>
            <span className="text-xs text-blue-700">Aplikacje Webowe</span>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-48 h-48 md:w-72 md:h-72 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center mix-blend-multiply hover:scale-105 transition-transform duration-500">
          <div className="text-center -mr-12 mt-12 md:-mr-20">
            <Smartphone className="mx-auto text-purple-500 mb-2" size={32} />
            <span className="font-bold text-purple-900 block">React Native</span>
            <span className="text-xs text-purple-700">iOS & Android</span>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-[#61DAFB] mb-1 flex justify-center">
              <Repeat size={24} />
            </div>
            <span className="font-black text-dark text-sm md:text-base whitespace-nowrap">
              SHARED LOGIC
            </span>
            <div className="text-xxs text-gray-500 uppercase tracking-wide mt-1">
              State, Hooks, Utils,
              <br />
              API Calls
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReactTrendChart = () => {
  const data = [
    { year: '2018', react: 45, others: 40 },
    { year: '2019', react: 55, others: 35 },
    { year: '2020', react: 65, others: 30 },
    { year: '2021', react: 72, others: 25 },
    { year: '2022', react: 80, others: 20 },
    { year: '2023', react: 88, others: 15 },
    { year: '2024', react: 92, others: 10 },
    { year: '2025', react: 96, others: 8 },
  ];

  return (
    <div className="bg-[#1e293b] p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-end gap-12">
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#61DAFB]/20 p-2 rounded-lg">
                <TrendingUp className="text-[#61DAFB]" size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Dominacja Rynkowa</h3>
                <p className="text-gray-400 text-xs uppercase tracking-wider">
                  Udział w nowych projektach Enterprise
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#61DAFB] rounded-full"></div>
                <span className="text-white text-xs font-bold">React</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span className="text-gray-400 text-xs">Starsze technologie</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full flex items-end justify-between gap-2 relative border-b border-gray-700 pb-2 px-2">
            {data.map((item, i) => (
              <div key={i} className="flex-1 flex flex-row items-end justify-center gap-1 h-full">
                <div
                  className="w-1/2 bg-gradient-to-t from-[#61DAFB] to-[#00D8FF] rounded-t-sm shadow-[0_0_20px_rgba(97,218,251,0.3)] transition-all duration-700 group/bar relative hover:opacity-90"
                  style={{ height: `${item.react}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[#0F172A] text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {item.react}%
                  </div>
                </div>
                <div
                  className="w-1/2 bg-gray-700 rounded-t-sm opacity-50 transition-all duration-700 hover:opacity-80"
                  style={{ height: `${item.others}%` }}
                ></div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-gray-500 text-xs mt-4 font-mono uppercase">
            {data.map((item) => (
              <span key={item.year} className="flex-1 text-center">
                {item.year}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:w-1/3 w-full bg-[#0F172A] p-6 rounded-3xl border border-gray-700 shadow-xl">
          <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-6 border-b border-gray-700 pb-2">
            Statystyki 2025
          </h4>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-white text-sm font-bold mb-2">
                <span>React Ecosystem</span>
                <span className="text-[#61DAFB]">Dominujący</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-[#61DAFB] h-full w-[85%] shadow-[0_0_10px_#61DAFB]"></div>
              </div>
              <p className="text-gray-500 text-xxs mt-1">Największy wybór bibliotek i narzędzi.</p>
            </div>

            <div>
              <div className="flex justify-between text-white text-sm font-bold mb-2">
                <span>Konkurencja</span>
                <span className="text-gray-400">Malejąca</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gray-600 h-full w-[35%]"></div>
              </div>
              <p className="text-gray-500 text-xxs mt-1">
                Starsze frameworki tracą udział w rynku.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-green-900/30 p-2 rounded-lg text-green-400">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">+124%</div>
                  <div className="text-gray-500 text-xs">Wzrost wdrożeń Enterprise</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
