import React from 'react';
import {
  Terminal,
  Database,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  Globe,
  Key,
  Rocket,
  Layers,
  Info,
} from 'lucide-react';

export const PythonHeroVisual = () => {
  return (
    <div className="relative w-full bg-[#092e20] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-[#00684A]/30 shadow-2xl min-h-[500px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#092e20] via-transparent to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border border-[#00ED64]/20 animate-ping-slow"></div>
          <div className="absolute inset-4 rounded-full border border-[#00ED64]/40 animate-spin-slow-reverse border-dashed"></div>

          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#00684A] rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(0,237,100,0.3)] relative z-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Terminal size={64} className="text-white" />
          </div>

          <div className="absolute w-full h-full animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark p-3 rounded-xl shadow-lg border border-blue-400/30">
              <Database size={20} className="text-blue-400" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-dark p-3 rounded-xl shadow-lg border border-yellow-400/30">
              <Lock size={20} className="text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            Backendowy <span className="text-[#00ED64]">Tytan</span>
          </h2>
          <p className="text-[#00ED64]/70 font-mono text-sm uppercase tracking-[0.3em]">
            Security • Stability • Scale
          </p>
        </div>
      </div>

      <style>{`
                .animate-ping-slow { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .animate-spin-slow { animation: spin 15s linear infinite; }
                .animate-spin-slow-reverse { animation: spin 20s linear infinite reverse; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
    </div>
  );
};

interface SecurityShieldVisualProps {
  content: {
    title: string;
    items: {
      title: string;
      desc: string;
    }[];
  };
}

export const SecurityShieldVisual = ({ content }: SecurityShieldVisualProps) => {
  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 md:p-12 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-20 -mt-20"></div>

      <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xxs font-black uppercase tracking-widest mb-4">
            <ShieldCheck size={12} /> Ochrona 24/7
          </div>
          <h3 className="text-2xl font-bold text-dark mb-4">{content.title}?</h3>
          <ul className="space-y-4">
            {content.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <CheckCircle2 className="text-[#00684A] shrink-0 mt-0.5" size={20} />
                <div>
                  <strong className="text-dark block">{item.title}</strong>
                  <span className="text-sm text-gray-500">{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 bg-dark rounded-3xl rotate-6 opacity-10"></div>
            <div className="absolute inset-0 bg-[#00684A] rounded-3xl -rotate-6 opacity-10"></div>
            <div className="absolute inset-0 bg-white rounded-3xl border border-gray-100 shadow-2xl flex items-center justify-center z-10">
              <ShieldCheck size={100} className="text-[#00684A] drop-shadow-2xl" />
              <div className="absolute top-4 right-4 text-red-400 text-xs font-mono bg-red-50 px-2 py-1 rounded animate-bounce">
                XSS Blocked
              </div>
              <div
                className="absolute bottom-4 left-4 text-blue-400 text-xs font-mono bg-blue-50 px-2 py-1 rounded animate-bounce"
                style={{ animationDelay: '0.5s' }}
              >
                SQLi Blocked
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DjangoAdminPreview = () => {
  return (
    <div className="w-full bg-[#1e293b] rounded-2xl shadow-2xl overflow-hidden border border-gray-700 font-mono text-sm">
      <div className="bg-[#0f172a] px-4 py-3 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 px-3 py-1 bg-[#1e293b] rounded text-gray-400 text-xs flex-1 text-center">
          admin.twoja-firma.com/dashboard
        </div>
      </div>

      <div className="flex">
        <div className="w-48 bg-[#1e293b] border-r border-gray-700 p-4 hidden sm:block">
          <div className="text-[#00ED64] font-bold mb-6 uppercase tracking-wider text-xs">
            Django Admin
          </div>
          <div className="space-y-3">
            <div className="text-gray-400 text-xs uppercase mb-1">Aplikacja</div>
            <div className="text-white hover:bg-[#334155] p-2 rounded cursor-pointer flex items-center gap-2">
              <Briefcase size={14} /> Produkty
            </div>
            <div className="text-white hover:bg-[#334155] p-2 rounded cursor-pointer flex items-center gap-2">
              <Globe size={14} /> Zamówienia
            </div>
            <div className="text-gray-400 text-xs uppercase mt-4 mb-1">Auth</div>
            <div className="text-white hover:bg-[#334155] p-2 rounded cursor-pointer flex items-center gap-2">
              <Lock size={14} /> Users
            </div>
            <div className="text-white hover:bg-[#334155] p-2 rounded cursor-pointer flex items-center gap-2">
              <Key size={14} /> Groups
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0f172a] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-lg font-bold">Ostatnie Zamówienia</h3>
            <button className="bg-[#00684A] text-white px-3 py-1 rounded text-xs hover:bg-[#00503a]">
              Dodaj +
            </button>
          </div>

          <div className="space-y-2">
            {[
              {
                id: '#2049',
                user: 'jan.kowalski@gmail.com',
                status: 'Opłacone',
                amount: '2499 PLN',
                color: 'text-green-400',
              },
              {
                id: '#2048',
                user: 'firma@tech.pl',
                status: 'W trakcie',
                amount: '12500 PLN',
                color: 'text-yellow-400',
              },
              {
                id: '#2047',
                user: 'anna.nowak@onet.pl',
                status: 'Anulowane',
                amount: '150 PLN',
                color: 'text-red-400',
              },
            ].map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-[#1e293b] p-3 rounded border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
              >
                <div className="w-16 text-gray-400">{row.id}</div>
                <div className="flex-1 text-white font-medium">{row.user}</div>
                <div className={`w-24 ${row.color} text-xs uppercase font-bold`}>{row.status}</div>
                <div className="w-24 text-right text-gray-300">{row.amount}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-gray-500 text-xs">
            * Ten panel został wygenerowany automatycznie w 3 minuty.
          </div>
        </div>
      </div>
    </div>
  );
};

interface ScalabilityVisualProps {
  content: {
    items: {
      name: string;
      desc: string;
    }[];
    tips: string[];
  };
}

export const ScalabilityVisual = ({ content }: ScalabilityVisualProps) => {
  return (
    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Rocket size={24} />
            </div>
            <div>
              <div className="font-bold text-dark">{content.items[0].name}</div>
              <div className="text-xs text-gray-500">{content.items[0].desc}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <Globe size={24} />
            </div>
            <div>
              <div className="font-bold text-dark">{content.items[1].name}</div>
              <div className="text-xs text-gray-500">{content.items[1].desc}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <Layers size={24} />
            </div>
            <div>
              <div className="font-bold text-dark">{content.items[2].name}</div>
              <div className="text-xs text-gray-500">{content.items[2].desc}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-dark p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ED64] rounded-full blur-[60px] opacity-20"></div>
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Info size={16} className="text-[#00ED64]" /> Jak to skalować?
          </h4>
          <ul className="text-sm space-y-2 text-gray-300">
            {content.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
