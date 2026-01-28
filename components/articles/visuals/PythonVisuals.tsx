/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Settings,
  Database,
  Zap,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Layout,
  Cpu,
  BarChart3,
  Bot,
} from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';

// --- HERO: SWISS ARMY KNIFE ---
export const PythonHeroVisual: React.FC = () => {
  return (
    <div className="relative w-full bg-[#0B1120] rounded-[3rem] p-12 overflow-hidden border border-white/5 shadow-2xl min-h-[500px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      {/* Central Knife Body */}
      <div className="relative z-20">
        <div className="w-20 h-64 bg-gradient-to-b from-red-600 to-red-800 rounded-full shadow-2xl relative border-x-4 border-red-900/50">
          {/* Logo Django Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#092e20] p-3 rounded-full border-2 border-white/20 shadow-lg">
            <span className="text-white font-black text-xs">dj</span>
          </div>

          {/* Blades (Animated) */}
          {[
            {
              label: 'Security',
              icon: <ShieldCheck size={16} />,
              angle: -120,
              color: 'text-blue-400',
            },
            { label: 'Admin', icon: <Layout size={16} />, angle: -60, color: 'text-emerald-400' },
            { label: 'ORM', icon: <Database size={16} />, angle: 60, color: 'text-amber-400' },
            { label: 'Auth', icon: <Lock size={16} />, angle: 120, color: 'text-purple-400' },
          ].map((blade, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-32 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center px-4 gap-3 transition-all duration-700 group-hover:opacity-100 opacity-40 origin-left"
              style={{ transform: `translateY(-50%) rotate(${blade.angle}deg) translateX(40px)` }}
            >
              <div className={blade.color}>{blade.icon}</div>
              <span className="text-xxs font-black uppercase text-white tracking-widest">
                {blade.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 text-xxs font-bold text-gray-600 uppercase tracking-[0.3em] animate-pulse">
        "The framework for perfectionists with deadlines"
      </div>
    </div>
  );
};

// --- SECURITY SHIELD ANIMATION ---
export const SecurityShieldVisual: React.FC = () => {
  const [attack, setAttack] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAttack(true);
      setTimeout(() => setAttack(false), 1000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-16 bg-[#0B1120] rounded-[2.5rem] p-8 md:p-16 text-white relative overflow-hidden border border-white/5 shadow-2xl flex flex-col items-center">
      <div className="absolute inset-0 bg-grid-white/[0.02]"></div>

      <div className="relative z-10 flex flex-col items-center gap-12">
        <h3 className="text-xl font-bold">Security Middleware</h3>

        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Attacker */}
          <div
            className={`absolute top-0 -translate-y-20 transition-all duration-500 ${attack ? 'translate-y-10 opacity-100' : 'opacity-0 -translate-y-20'}`}
          >
            <div className="bg-red-500/20 text-red-500 px-4 py-2 rounded-xl border border-red-500/50 font-mono text-xxs flex items-center gap-2">
              <Zap size={14} /> SQL_INJECTION_PAYLOAD
            </div>
          </div>

          {/* Shield */}
          <div
            className={`relative z-20 w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${attack ? 'border-success bg-success/20 scale-110 shadow-[0_0_50px_rgba(0,200,83,0.4)]' : 'border-white/10 bg-white/5'}`}
          >
            <ShieldCheck size={48} className={attack ? 'text-success' : 'text-gray-600'} />
          </div>

          {/* Deflection Particles */}
          {attack && (
            <div className="absolute top-0 w-full flex justify-center">
              <div className="w-1 h-16 bg-gradient-to-t from-[#00C853] to-transparent animate-ping"></div>
            </div>
          )}

          {/* Database behind shield */}
          <div className="absolute bottom-0 translate-y-16 flex flex-col items-center opacity-40">
            <Database size={32} className="text-gray-500" />
            <span className="text-xxxs font-mono mt-2">SECURE_STORAGE</span>
          </div>
        </div>

        <div className="min-h-[40px] text-center">
          {attack ? (
            <span className="text-red-500 font-black text-xs uppercase tracking-widest animate-pulse">
              Threat Detected: BLOCKED
            </span>
          ) : (
            <span className="text-gray-600 font-bold text-xs uppercase tracking-widest">
              System Status: Monitoring
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// --- ADMIN PANEL PREVIEW ---
export const DjangoAdminPreview: React.FC = () => {
  return (
    <div className="my-16 bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col group">
      {/* Header */}
      <div className="bg-[#092e20] px-6 py-4 flex justify-between items-center text-white">
        <span className="font-bold text-sm">Django Administration</span>
        <div className="flex gap-4 text-xxs font-bold opacity-70 uppercase tracking-wider">
          <span>Welcome, Mixture_Marketing</span>
          <span>View Site / Change Password / Log out</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex bg-gray-50 min-h-[300px]">
        {/* Sidebar */}
        <div className="w-48 border-r border-gray-200 p-4 space-y-6">
          <div>
            <div className="text-xxs font-black text-gray-400 uppercase mb-3">Authentication</div>
            <div className="space-y-2">
              <div className="text-xs text-[#00684A] font-bold cursor-pointer hover:underline flex justify-between">
                Groups <Zap size={10} className="opacity-0 group-hover:opacity-100" />
              </div>
              <div className="text-xs text-[#00684A] font-bold cursor-pointer hover:underline flex justify-between">
                Users <Zap size={10} className="opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          </div>
          <div>
            <div className="text-xxs font-black text-gray-400 uppercase mb-3">E-commerce</div>
            <div className="space-y-2">
              <div className="text-xs text-[#00684A] font-bold cursor-pointer hover:underline">
                Products
              </div>
              <div className="text-xs text-[#00684A] font-bold cursor-pointer hover:underline">
                Orders
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-lg font-bold text-dark">Select Product to change</h4>
            <button className="bg-[#092e20] text-white px-4 py-1.5 rounded text-xxs font-bold uppercase tracking-wider shadow-md">
              + Add Product
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">In Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-3 font-medium text-[#00684A]">Custom CRM System</td>
                  <td className="p-3">12,000 PLN</td>
                  <td className="p-3 text-green-600 font-bold">Yes</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#00684A]">Fintech Landing Page</td>
                  <td className="p-3">4,500 PLN</td>
                  <td className="p-3 text-green-600 font-bold">Yes</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#00684A]">B2B Order Hub</td>
                  <td className="p-3">8,000 PLN</td>
                  <td className="p-3 text-red-600 font-bold">Pending</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-xxs text-gray-500 italic">
            "Ten panel zarządzania dostajesz za darmo w 1. dniu projektu."
          </p>
        </div>
      </div>
    </div>
  );
};

// --- SCALABILITY VISUAL ---
export const ScalabilityVisual: React.FC = () => {
  return (
    <div className="my-16 p-8 bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        {/* Python/Django Side */}
        <div className="flex-1 text-center group">
          <div className="w-24 h-24 bg-[#092e20]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
            <Cpu size={40} className="text-[#092e20]" />
          </div>
          <h4 className="text-xl font-bold text-dark mb-2">Application Logic</h4>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-4">
            Python / Django
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            <Zap size={12} fill="currentColor" /> Very Fast (&lt;10ms)
          </div>
        </div>

        {/* Connection */}
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-75"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-150"></span>
          </div>
          <span className="text-xxs uppercase font-bold tracking-widest text-gray-400">
            Request
          </span>
        </div>

        {/* Database Side */}
        <div className="flex-1 text-center group relative">
          <div className="absolute -inset-4 bg-red-50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity border border-red-100"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-100">
              <Database size={40} className="text-amber-500" />
            </div>
            <h4 className="text-xl font-bold text-dark mb-2">Database I/O</h4>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-4">
              PostgreSQL / MySQL
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
              <AlertTriangle size={12} /> The Real Bottleneck
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-xl text-center border border-gray-100">
        <p className="text-sm text-gray-600 leading-relaxed italic">
          "Instagram obsługuje miliony zapytań na sekundę używając Django. Skalowalność zależy od
          architektury bazy danych i cache (Redis), a nie od 'szybkości' samego języka."
        </p>
      </div>
    </div>
  );
};
