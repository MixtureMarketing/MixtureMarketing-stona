import React, { useState } from 'react';
import {
  ShieldCheck,
  Shield,
  Cloud,
  Building2,
  Zap,
  Activity,
  User,
  Bot,
  Search,
  CheckCircle2,
  ShieldAlert,
  Plane,
  FileCode,
  Terminal,
  Scale,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import ArticleShell from './ArticleShell';
import LazyHydrate from '../common/LazyHydrate';
import { ARTICLES } from '../../data/articles';
import { WAF_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/waf';
import { useCounter } from '../../hooks/useCounter';

const WafArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'waf-bezpieczenstwo');

  if (!articleData) return null;

  return (
    <ArticleShell
      id={articleData.id}
      title={articleData.title}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData.image}
      icon={ShieldCheck}
      accentColor="#3F3D91"
      heroVisual={<WafHeroVisual />}
    >
      <div className="flex justify-center mb-16 not-prose">
        <AttackCounter />
      </div>

      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed italic border-l-4 border-secondary pl-6 py-2"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.quote }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
      </AnimateOnScroll>

      <div className="my-24">
        <SectionHeader
          title={CONTENT.howItWorks.title}
          subtitle={CONTENT.howItWorks.subtitle}
          align="left"
        />
        <p className="mb-8">{CONTENT.howItWorks.text}</p>

        <LazyHydrate minHeight="400px">
          <AirportSecuritySimulator />
        </LazyHydrate>
      </div>

      <h2 className="text-3xl font-bold text-dark mb-8">{CONTENT.technical.title}</h2>
      <p className="mb-8">{CONTENT.technical.text}</p>

      <AnimateOnScroll>
        <div className="mb-16 overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-white not-prose">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                  <th className="p-5 border-b border-gray-200 font-bold">
                    {CONTENT.technical.headers[0]}
                  </th>
                  <th className="p-5 border-b border-gray-200 font-bold">
                    {CONTENT.technical.headers[1]}
                  </th>
                  <th className="p-5 border-b border-gray-200 font-bold text-secondary bg-blue-50/30">
                    {CONTENT.technical.headers[2]}
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {CONTENT.technical.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <td className="p-5 font-bold text-dark">{row.label}</td>
                    <td className="p-5 text-gray-700">{row.v1}</td>
                    <td className="p-5 font-bold text-secondary bg-blue-50/10">{row.v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimateOnScroll>

      <SectionHeader title={CONTENT.blocks.title} subtitle={CONTENT.blocks.subtitle} align="left" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose my-12">
        {CONTENT.blocks.items.map((item, i) => (
          <AttackTypeCard key={i} title={item.title} desc={item.desc} impact={item.impact} />
        ))}
      </div>

      <SectionHeader
        title={CONTENT.patching.title}
        subtitle={CONTENT.patching.subtitle}
        align="left"
      />
      <p dangerouslySetInnerHTML={{ __html: CONTENT.patching.text }} />
      <AnimateOnScroll>
        <div className="my-12">
          <VirtualPatchingTimeline />
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="my-16">
          <LazyHydrate minHeight="300px">
            <SqliDemo />
          </LazyHydrate>
        </div>
      </AnimateOnScroll>

      <div className="my-24">
        <SectionHeader
          title="Cena zaniedbania"
          subtitle="Symulator Kar RODO / GDPR"
          centered={true}
        />
        <LazyHydrate minHeight="400px">
          <GdprPenaltyCalculator />
        </LazyHydrate>
      </div>

      <div className="mt-24">
        <SectionHeader title={CONTENT.value.title} subtitle={CONTENT.value.subtitle} align="left" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mt-12 mb-24">
          {CONTENT.value.items.map((item, i) => (
            <ValueCard
              key={i}
              icon={
                i === 0 ? (
                  <ShieldCheck className="text-emerald-500" />
                ) : i === 1 ? (
                  <Activity className="text-blue-500" />
                ) : (
                  <Zap className="text-amber-500" />
                )
              }
              title={item.title}
              desc={item.desc}
            />
          ))}
        </div>
      </div>

      <h2 className="text-3xl font-bold text-dark mb-8">{CONTENT.implementation.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-24">
        <div className="bg-white p-8 rounded-3xl border-2 border-primary/20 shadow-xl relative overflow-hidden group hover:border-primary transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cloud size={80} aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2 flex items-center gap-2">
            <Cloud className="text-primary" aria-hidden="true" />{' '}
            {CONTENT.implementation.cloud.title}
          </h3>
          <p className="text-sm text-gray-700 mb-6">{CONTENT.implementation.cloud.desc}</p>
          <ul className="text-sm space-y-3 mb-8">
            {CONTENT.implementation.cloud.items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 size={14} className="text-emerald-500" aria-hidden="true" /> {item}
              </li>
            ))}
          </ul>
          <div className="text-xxs font-black uppercase text-primary">
            {CONTENT.implementation.cloud.label}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Building2 size={80} aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2 flex items-center gap-2">
            <Building2 className="text-gray-600" aria-hidden="true" />{' '}
            {CONTENT.implementation.onPremise.title}
          </h3>
          <p className="text-sm text-gray-700 mb-6">{CONTENT.implementation.onPremise.desc}</p>
          <ul className="text-sm space-y-3 mb-8">
            {CONTENT.implementation.onPremise.items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-700">
                <CheckCircle2
                  size={14}
                  className={`${i === 2 ? 'text-rose-500' : 'text-emerald-500'}`}
                  aria-hidden="true"
                />{' '}
                {item}
              </li>
            ))}
          </ul>
          <div className="text-xxs font-black uppercase text-gray-600">
            {CONTENT.implementation.onPremise.label}
          </div>
        </div>
      </div>

      <AnimateOnScroll>
        <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner">
              <Shield size={40} className="text-white" aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
            <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
              {CONTENT.cta.text}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="white" size="lg" className="shadow-xl text-dark hover:bg-gray-100">
                {CONTENT.cta.primaryBtn}
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white"
                size="lg"
                onClick={() => (window.location.href = '/baza-wiedzy')}
              >
                {CONTENT.cta.secondaryBtn}
              </Button>
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </ArticleShell>
  );
};

// --- INTERNAL COMPONENTS ---

const AttackCounter = () => {
  const count = useCounter(2451, {
    increment: 5,
    tickInterval: 1500,
  });

  return (
    <div className="bg-white px-6 py-3 rounded-2xl border-2 border-rose-100 shadow-lg inline-flex flex-col items-center">
      <span className="text-xxs font-black uppercase text-gray-600 tracking-widest mb-1">
        Live Attack Detection
      </span>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
        <span className="text-2xl font-black text-rose-600 font-mono">
          {count.toLocaleString()}
        </span>
        <span className="text-sm font-bold text-gray-600">ataki / sek</span>
      </div>
    </div>
  );
};

const AirportSecuritySimulator = () => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'passed' | 'blocked'>('idle');
  const [isHacker, setIsHacker] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const runScan = (hacker: boolean) => {
    setIsHacker(hacker);
    setStatus('scanning');
    setAnimationKey((prev) => prev + 1);

    setTimeout(() => {
      setStatus(hacker ? 'blocked' : 'passed');
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl relative overflow-hidden not-prose">
      <div className="flex justify-center gap-4 mb-12">
        <button
          onClick={() => runScan(false)}
          disabled={status === 'scanning'}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${status === 'passed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <User size={18} /> Wyślij Klienta
        </button>
        <button
          onClick={() => runScan(true)}
          disabled={status === 'scanning'}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${status === 'blocked' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <Bot size={18} /> Wyślij Hakera
        </button>
      </div>

      <div className="relative h-48 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between px-12 overflow-hidden">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
            <User
              size={32}
              className={isHacker && status !== 'idle' ? 'text-rose-500' : 'text-dark'}
            />
          </div>
          <span className="text-xxs font-black uppercase text-gray-600 tracking-widest">Start</span>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div
            className={`w-24 h-32 rounded-xl border-4 transition-all duration-300 flex flex-col items-center justify-center bg-white shadow-md ${status === 'scanning' ? 'border-primary animate-pulse' : status === 'passed' ? 'border-emerald-500 shadow-emerald-100' : status === 'blocked' ? 'border-rose-500 shadow-rose-100' : 'border-gray-200'}`}
          >
            {status === 'scanning' ? (
              <Search className="text-primary animate-bounce" size={32} />
            ) : status === 'passed' ? (
              <CheckCircle2 className="text-emerald-500" size={32} />
            ) : status === 'blocked' ? (
              <ShieldAlert className="text-rose-500 animate-pulse" size={40} />
            ) : (
              <Shield className="text-gray-200" size={32} />
            )}
            <span className="text-xxxs font-black mt-3 text-gray-600 tracking-widest uppercase">
              SCANNER (WAF)
            </span>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-sm ${status === 'passed' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 scale-110 shadow-emerald-100' : 'bg-white border-gray-200 text-gray-300 opacity-50'}`}
          >
            <Plane size={32} />
          </div>
          <span className="text-xxs font-black uppercase text-gray-600 tracking-widest">
            Application
          </span>
        </div>
        {status !== 'idle' && (
          <div
            key={animationKey}
            className={`absolute w-5 h-5 rounded-full shadow-lg z-20 ${isHacker ? 'bg-rose-500' : 'bg-primary'} ${isHacker ? 'animate-scan-blocked' : 'animate-scan-passed'}`}
          >
            <div className="w-full h-full bg-white/20 rounded-full animate-ping"></div>
          </div>
        )}
      </div>
      <style>{`
                @keyframes scan-passed { 0% { left: 15%; top: 50%; transform: translate(-50%, -50%) scale(0.5); opacity: 0; } 10% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 45% { left: 48%; top: 50%; transform: translate(-50%, -50%); } 55% { left: 48%; top: 50%; transform: translate(-50%, -50%); } 90% { opacity: 1; } 100% { left: 85%; top: 50%; transform: translate(-50%, -50%) scale(0.5); opacity: 0; } }
                @keyframes scan-blocked { 0% { left: 15%; top: 50%; transform: translate(-50%, -50%) scale(0.5); opacity: 0; } 10% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 45% { left: 48%; top: 50%; transform: translate(-50%, -50%); } 100% { left: 48%; top: 50%; transform: translate(-50%, -50%) scale(1.5); opacity: 0; } }
                .animate-scan-passed { animation: scan-passed 3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                .animate-scan-blocked { animation: scan-blocked 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            `}</style>
    </div>
  );
};

const SqliDemo = () => {
  const [input, setInput] = useState('');
  const [protected_mode, setProtected] = useState(true);
  const getResponse = () => {
    if (!input) return 'Czekam na zapytanie...';
    if (input.includes("' OR '1'='1"))
      return protected_mode
        ? 'WAF: ZABLOKOWANO! Wykryto próbę ataku SQL Injection.'
        : 'BAZA: Zwrócono 14,502 rekordy.';
    return 'BAZA: Nie znaleziono wyników.';
  };
  return (
    <div className="bg-[#0F172A] rounded-3xl p-8 shadow-2xl text-white not-prose overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <FileCode size={120} />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative z-10">
        <h3 className="text-xl font-bold">Symulator SQL Injection</h3>
        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setProtected(true)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${protected_mode ? 'bg-emerald-500' : 'text-gray-600'}`}
          >
            WAF ON
          </button>
          <button
            onClick={() => setProtected(false)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!protected_mode ? 'bg-rose-500' : 'text-gray-600'}`}
          >
            WAF OFF
          </button>
        </div>
      </div>
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 relative z-10">
        <div className="mb-6">
          <label
            htmlFor="sqli-input"
            className="text-xxs font-black uppercase text-gray-700 tracking-widest mb-2 block"
          >
            Szukaj użytkownika:
          </label>
          <div className="flex gap-2">
            <input
              id="sqli-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="np. Jan Kowalski"
              className="flex-grow bg-[#1E293B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => setInput("' OR '1'='1' --")}
              className="bg-secondary text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary"
            >
              Atak
            </button>
          </div>
        </div>
        <div className="bg-[#0B1120] rounded-xl p-4 font-mono text-xs border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-gray-700 border-b border-white/5 pb-2">
            <Terminal size={14} /> System Response
          </div>
          <div
            className={`${getResponse().includes('ZABLOKOWANO') ? 'text-rose-400' : 'text-emerald-400'}`}
          >
            {getResponse()}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AttackTypeCardProps {
  title: string;
  desc: string;
  impact: string;
}

const AttackTypeCard = ({ title, desc, impact }: AttackTypeCardProps) => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-rose-500">
    <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
    <p className="text-sm text-gray-700 leading-relaxed mb-4">{desc}</p>
    <div className="bg-rose-50 p-3 rounded-xl">
      <span className="text-xxs font-black uppercase text-rose-600 block mb-1">
        Skutek bez WAF:
      </span>
      <p className="text-xs text-rose-800 font-medium m-0">{impact}</p>
    </div>
  </div>
);

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const ValueCard = ({ icon, title, desc }: ValueCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-bold text-dark mb-2">{title}</h3>
    <p className="text-sm text-gray-700 leading-relaxed m-0">{desc}</p>
  </div>
);

const VirtualPatchingTimeline = () => (
  <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl not-prose overflow-hidden relative">
    <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative">
      <div className="absolute top-12 left-8 right-8 h-1 bg-gray-100 hidden md:block"></div>
      {[
        {
          time: 'Godzina 0',
          title: 'Odkrycie luki',
          icon: <Search size={20} />,
          color: 'bg-gray-500',
        },
        { time: 'Godzina 2', title: 'Ataki Botów', icon: <Bot size={20} />, color: 'bg-rose-500' },
        {
          time: 'Godzina 3',
          title: 'WAF Virtual Patch',
          icon: <ShieldCheck size={20} />,
          color: 'bg-emerald-500',
          highlight: true,
        },
        {
          time: 'Dzień 5',
          title: 'Poprawka w Kodzie',
          icon: <FileCode size={20} />,
          color: 'bg-blue-500',
        },
      ].map((step, i) => (
        <div key={i} className="relative z-10 flex-1">
          <div
            className={`w-16 h-16 ${step.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg ${step.highlight ? 'ring-4 ring-emerald-100 animate-pulse' : ''}`}
          >
            {step.icon}
          </div>
          <div className="text-xxs font-black uppercase text-primary tracking-widest mb-1">
            {step.time}
          </div>
          <h3 className="font-bold text-dark text-sm mb-1">{step.title}</h3>
        </div>
      ))}
    </div>
  </div>
);

const GdprPenaltyCalculator = () => {
  const [revenue, setRevenue] = useState(1000000);
  return (
    <div className="max-w-2xl mx-auto bg-[#0F172A] rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-800 text-white not-prose relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Scale size={120} />
      </div>
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-8 text-center">Ile kosztuje wyciek?</h3>
        <input
          type="range"
          min="100000"
          max="50000000"
          step="100000"
          value={revenue}
          onChange={(e) => setRevenue(parseInt(e.target.value))}
          aria-label="Obrót"
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#61B6DE]"
        />
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="bg-white/5 p-4 rounded-xl text-center">
            <div className="text-xxs text-gray-600 uppercase">Max Kara</div>
            <div className="text-2xl font-black text-rose-500">
              {(revenue * 0.04).toLocaleString()}
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl text-center">
            <div className="text-xxs text-gray-600 uppercase">Limit</div>
            <div className="text-2xl font-black">20M EUR</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WafHeroVisual = () => (
  <div className="relative bg-[#0B1120] rounded-[2.5rem] p-12 overflow-hidden aspect-[21/9] flex items-center justify-center border border-gray-800 shadow-2xl group">
    <div className="absolute inset-0 bg-tech-grid opacity-10"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent"></div>

    <div className="relative z-10 flex flex-col items-center">
      <div className="relative">
        <div className="absolute inset-0 bg-primary blur-[60px] opacity-20 animate-pulse"></div>
        <Shield
          size={100}
          className="text-white relative z-10 drop-shadow-[0_0_20px_rgba(97,182,222,0.5)]"
          strokeWidth={1.5}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ShieldCheck size={32} className="text-primary" />
        </div>
      </div>
      <div className="mt-6 font-mono text-xxs tracking-[0.4em] text-primary uppercase font-black">
        Layer 7 Protection Active
      </div>
    </div>

    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 bg-red-500 rounded-full animate-projectile-${i}`}
        ></div>
      ))}
    </div>
    <style>{`
        @keyframes projectile { from { right: 0; opacity: 1; } to { right: 45%; opacity: 0; } }
        .animate-projectile-1 { top: 20%; right: -10px; animation: projectile 1.5s infinite linear; }
        .animate-projectile-2 { top: 40%; right: -10px; animation: projectile 1.2s infinite linear 0.2s; }
        .animate-projectile-3 { top: 60%; right: -10px; animation: projectile 1.8s infinite linear 0.5s; }
        .animate-projectile-4 { top: 30%; right: -10px; animation: projectile 1.4s infinite linear 0.8s; }
        .animate-projectile-5 { top: 70%; right: -10px; animation: projectile 1.6s infinite linear 1.1s; }
        .bg-tech-grid {
            background-image: linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px);
            background-size: 40px 40px;
        }
    `}</style>
  </div>
);

export default WafArticle;
