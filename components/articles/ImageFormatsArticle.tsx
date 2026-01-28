/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  ImageIcon,
  Zap,
  TrendingUp,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Monitor,
  Tablet,
  FileCode,
  ArrowRight,
  Scale,
  Play,
  RefreshCw,
} from 'lucide-react';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import Image from '../common/Image';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import LazyHydrate from '../common/LazyHydrate';
import { ARTICLES } from '../../data/articles';
import { IMAGE_FORMATS_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/image-formats';

const ImageWeightChart = React.lazy(() => import('./visuals/charts/ImageWeightChart'));

const ImageFormatsArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'optymalizacja-obrazow-webp-avif');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-primary/30 font-sans">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Poznaj WebP i AVIF – nowoczesne formaty graficzne, które zmniejszą wagę Twojej strony o 80% bez utraty jakości.'
        }
        image={articleData?.image}
      />

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <ImageIcon size={12} />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {CONTENT.header.subtitle}
            </p>
          </header>

          {/* Hero Visual - Comparison Split */}
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Legacy Side */}
              <div className="relative bg-gray-200 rounded-3xl p-8 overflow-hidden flex flex-col items-center justify-center min-h-[300px] border border-gray-300">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dust.png')]"></div>
                <Monitor size={80} className="text-gray-600 mb-4" />
                <div className="bg-gray-800 text-white px-4 py-1 rounded-md font-mono text-sm mb-4">
                  FORMAT: JPG (1992)
                </div>
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <Scale size={20} /> 10.0 kg (Ciężkie)
                </div>
              </div>
              {/* Next-Gen Side */}
              <div className="relative bg-white rounded-3xl p-8 overflow-hidden flex flex-col items-center justify-center min-h-[300px] border border-primary/30 shadow-xl shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E0EFFF] to-white opacity-50"></div>
                <Tablet size={80} className="text-primary mb-4 relative z-10 animate-float" />
                <div className="bg-primary text-white px-4 py-1 rounded-md font-mono text-sm mb-4 relative z-10">
                  FORMAT: AVIF (2025)
                </div>
                <div className="flex items-center gap-2 text-secondary font-bold relative z-10">
                  <Zap size={20} className="fill-current" /> 0.5 kg (Lekkie)
                </div>
              </div>
            </div>
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-600 prose-a:text-secondary hover:prose-a:text-primary prose-strong:text-dark prose-li:text-gray-600">
            <AnimateOnScroll>
              <p
                className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
              />
            </AnimateOnScroll>

            <SectionHeader
              title={CONTENT.definitions.title}
              subtitle={CONTENT.definitions.subtitle}
              centered={false}
              align="left"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-16">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-dark mb-4">
                  {CONTENT.definitions.webp.title}
                </h3>
                <p className="text-sm text-gray-700 mb-6">{CONTENT.definitions.webp.desc}</p>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 inline-block">
                  {CONTENT.definitions.webp.badge}
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
                <h3 className="text-xl font-bold text-dark mb-4">
                  {CONTENT.definitions.avif.title}
                </h3>
                <p className="text-sm text-gray-700 mb-6">{CONTENT.definitions.avif.desc}</p>
                <div className="bg-blue-50 text-secondary px-4 py-2 rounded-xl text-xs font-bold border border-[#cce4ff] inline-block">
                  {CONTENT.definitions.avif.badge}
                </div>
              </div>
            </div>

            {/* THE GREAT DUEL: INTERACTIVE SLIDER */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.duel.title}
                subtitle={CONTENT.duel.subtitle}
                centered={false}
                align="left"
              />
              <p className="mb-8">{CONTENT.duel.text}</p>
              <ImageComparisonDuel />
            </div>

            {/* NEW SECTION: LOADING SIMULATOR */}
            <SectionHeader
              title={CONTENT.simulator.title}
              subtitle={CONTENT.simulator.subtitle}
              centered={false}
              align="left"
            />
            <p>{CONTENT.simulator.text}</p>
            <AnimateOnScroll>
              <div className="my-12">
                <LoadingSimulator />
              </div>
            </AnimateOnScroll>

            {/* BUSINESS VALUE */}
            <SectionHeader
              title={CONTENT.value.title}
              subtitle={CONTENT.value.subtitle}
              centered={false}
              align="left"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mt-12 mb-24">
              {CONTENT.value.items.map((item, i) => (
                <ValueCard
                  key={i}
                  icon={
                    i === 0 ? (
                      <TrendingUp className="text-emerald-500" />
                    ) : i === 1 ? (
                      <Smartphone className="text-blue-500" />
                    ) : (
                      <Zap className="text-amber-500" />
                    )
                  }
                  title={item.title}
                  desc={item.desc}
                />
              ))}
            </div>

            {/* NEW SECTION: IMAGE SEO CHECKLIST */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.checklist.title}
                subtitle={CONTENT.checklist.subtitle}
                centered={true}
              />
              <ImageSeoChecklist />
            </div>

            {/* BROWSER SUPPORT */}
            <SectionHeader
              title={CONTENT.support.title}
              subtitle={CONTENT.support.subtitle}
              centered={false}
              align="left"
            />
            <p dangerouslySetInnerHTML={{ __html: CONTENT.support.text }} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose my-16">
              <React.Suspense
                fallback={<div className="w-full h-64 bg-gray-50 animate-pulse rounded-3xl" />}
              >
                <LazyHydrate minHeight="250px">
                  <BrowserSupportChart title="Wsparcie WebP" percent={96.8} color="#10B981" />
                </LazyHydrate>
              </React.Suspense>
              <React.Suspense
                fallback={<div className="w-full h-64 bg-gray-50 animate-pulse rounded-3xl" />}
              >
                <LazyHydrate minHeight="250px">
                  <BrowserSupportChart title="Wsparcie AVIF" percent={91.2} color="#61B6DE" />
                </LazyHydrate>
              </React.Suspense>
            </div>

            {/* TECHNICAL SECTION */}
            <div className="mt-24">
              <SectionHeader
                title={CONTENT.implementation.title}
                subtitle={CONTENT.implementation.subtitle}
                centered={false}
                align="left"
              />
              <p
                className="mb-8"
                dangerouslySetInnerHTML={{ __html: CONTENT.implementation.text }}
              />
              <CodeBlockImplementation />
            </div>

            {/* CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                      <Scale size={40} className="text-white animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
                    <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      {CONTENT.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="white"
                        size="lg"
                        className="shadow-xl text-dark hover:bg-gray-100"
                      >
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
            </div>

            <RelatedArticles currentArticleId="optymalizacja-obrazow-webp-avif" category="design" />
          </article>
        </div>
      </div>
    </div>
  );
};

// --- VISUAL COMPONENTS ---

const ImageComparisonDuel = () => {
  const [selected, setSelected] = useState<'jpg' | 'webp' | 'avif'>('jpg');

  const data = {
    jpg: { label: 'JPG (Oryginał)', size: '350 KB', savings: '0%', color: '#94a3b8' },
    webp: { label: 'WebP (Next-Gen)', size: '210 KB', savings: '-40%', color: '#10B981' },
    avif: { label: 'AVIF (Premium)', size: '45 KB', savings: '-87%', color: '#61B6DE' },
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl not-prose">
      <div className="flex justify-center gap-2 mb-8 bg-gray-50 p-1.5 rounded-2xl w-fit mx-auto border border-gray-100">
        {(['jpg', 'webp', 'avif'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            aria-label={`Pokaż porównanie rozmiaru dla formatu ${key.toUpperCase()}`}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selected === key ? 'bg-dark text-white shadow-lg' : 'text-gray-600'}`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-inner bg-gray-100">
        <Image
          src="/assets/images/frontend.png"
          alt="Pojedynek formatów"
          className="w-full h-full object-cover transition-all duration-700"
          style={{ filter: selected === 'jpg' ? 'none' : 'contrast(1.02)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-6 left-6 flex items-end gap-6">
          <div>
            <div className="text-xxs font-black text-white/60 uppercase tracking-widest mb-1">
              Rozmiar pliku
            </div>
            <div className="text-3xl font-black text-white">{data[selected].size}</div>
          </div>
          {selected !== 'jpg' && (
            <div className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm font-black animate-bounce">
              {data[selected].savings}
            </div>
          )}
        </div>
        <div className="absolute top-6 right-6">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-xl text-white text-xxs font-black uppercase tracking-widest">
            Jakość: Wizualnie identyczna
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(['jpg', 'webp', 'avif'] as const).map((key) => (
          <div
            key={key}
            className={`h-1.5 rounded-full transition-all duration-500 ${selected === key ? 'bg-primary w-full' : 'bg-gray-100 w-full opacity-50'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

const BrowserSupportChart = ({
  title,
  percent,
  color,
}: {
  title: string;
  percent: number;
  color: string;
}) => {
  const data = [
    { name: 'Supported', value: percent },
    { name: 'Unsupported', value: 100 - percent },
  ];

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
      <div
        className="h-40 w-full relative"
        role="img"
        aria-label={`Wykres wsparcia przeglądarek dla ${title}: ${percent}%`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill={color} />
              <Cell fill="#f3f4f6" />
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
        <div
          className="absolute inset-0 flex items-center justify-center flex-col"
          aria-hidden="true"
        >
          <span className="text-2xl font-black text-dark">{percent}%</span>
        </div>
      </div>
      <h3 className="font-bold text-lg text-dark mt-4 mb-2">{title}</h3>
      <p className="text-xs text-gray-600 font-medium">Globalne wsparcie (CanIUse 2025)</p>
    </div>
  );
};

const ValueCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
    <div
      className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4"
      aria-hidden="true"
    >
      {icon}
    </div>
    <h3 className="font-bold text-dark mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const CodeBlockImplementation = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="not-prose">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-dark text-white p-4 rounded-xl flex items-center justify-between hover:bg-secondary transition-all shadow-lg"
      >
        <div className="flex items-center gap-3 font-bold">
          <FileCode size={20} /> Zobacz kod HTML (znacznik picture)
        </div>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>
      {isOpen && (
        <div className="bg-[#1e1e1e] p-6 rounded-b-xl border-x border-b border-gray-800 font-mono text-sm animate-fade-in-down overflow-x-auto">
          <pre className="text-emerald-400">
            {`<picture>
  <!-- Najlepszy format dla nowoczesnych przeglądarek -->
  <source srcset="hero.avif" type="image/avif">
  
  <!-- Standard WebP dla reszty -->
  <source srcset="hero.webp" type="image/webp">
  
  <!-- Fallback dla bardzo starych urządzeń -->
  <img src="hero.jpg" alt="Nowoczesne buty sportowe" 
       width="800" height="600" loading="lazy">
</picture>`}
          </pre>
        </div>
      )}
    </div>
  );
};

const LoadingSimulator = () => {
  const [loading, setLoading] = useState(false);
  const [jpgProgress, setJpgProgress] = useState(0);
  const [avifProgress, setAvifProgress] = useState(0);

  const startLoading = () => {
    setLoading(true);
    setJpgProgress(0);
    setAvifProgress(0);

    const avifInterval = setInterval(() => {
      setAvifProgress((prev) => {
        if (prev >= 100) {
          clearInterval(avifInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 60);

    const jpgInterval = setInterval(() => {
      setJpgProgress((prev) => {
        if (prev >= 100) {
          clearInterval(jpgInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);
  };

  return (
    <div className="bg-[#0F172A] rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-800 relative overflow-hidden">
      <div className="flex justify-between items-center mb-12 relative z-10">
        <div>
          <h3 className="text-white font-bold text-xl mb-1">Symulacja Łącza 3G</h3>
          <p className="text-gray-600 text-sm">Prędkość: 1.5 Mbps (Słaby zasięg)</p>
        </div>
        <Button
          onClick={startLoading}
          disabled={loading && jpgProgress < 100}
          aria-label="Uruchom symulację ładowania obrazu w różnych formatach na łączu 3G"
          className="shadow-[0_0_20px_rgba(97,182,222,0.3)]"
        >
          {loading && jpgProgress < 100 ? (
            <RefreshCw className="animate-spin mr-2" size={18} />
          ) : (
            <Play className="mr-2" size={18} fill="currentColor" />
          )}
          Uruchom Test
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-48 h-[380px] bg-[#1E293B] rounded-[2.5rem] border-[6px] border-gray-700 relative overflow-hidden p-2">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-700 rounded-b-xl z-20"></div>
            <div className="h-full w-full bg-white rounded-[1.8rem] overflow-hidden relative">
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500"
                  className="w-full h-full object-cover transition-all"
                  style={{
                    clipPath: `inset(0 0 ${100 - jpgProgress}% 0)`,
                    filter: jpgProgress < 100 ? 'blur(4px) grayscale(0.5)' : 'none',
                  }}
                  alt="Slow JPG"
                />
              </div>
              {jpgProgress < 100 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xxs font-bold animate-pulse">
                  Ładowanie JPG... {jpgProgress}%
                </div>
              )}
            </div>
          </div>
          <span className="mt-4 font-black text-rose-500 uppercase tracking-widest text-xs">
            Standard JPG (4.8 MB)
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-48 h-[380px] bg-[#1E293B] rounded-[2.5rem] border-[6px] border-gray-700 relative overflow-hidden p-2 shadow-[0_0_40px_rgba(97,182,222,0.2)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-700 rounded-b-xl z-20"></div>
            <div className="h-full w-full bg-white rounded-[1.8rem] overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500"
                className="w-full h-full object-cover"
                style={{ opacity: avifProgress / 100 }}
                alt="Fast AVIF"
              />
              {avifProgress < 100 && avifProgress > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                  <Zap className="text-primary animate-pulse" size={32} />
                </div>
              )}
            </div>
          </div>
          <span className="mt-4 font-black text-emerald-400 uppercase tracking-widest text-xs">
            Next-Gen AVIF (180 KB)
          </span>
        </div>
      </div>

      {jpgProgress === 100 && (
        <div className="mt-12 text-center animate-fade-in">
          <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-2xl font-bold text-sm">
            🚀 AVIF załadował się 5x szybciej! Użytkownik nie zdążył pomyśleć o wyjściu.
          </div>
        </div>
      )}
    </div>
  );
};

const ImageSeoChecklist = () => {
  const [checked, setChecked] = useState<number[]>([]);

  const items = [
    {
      id: 1,
      title: 'Zastosuj formaty Next-Gen (AVIF/WebP)',
      desc: 'Podstawa wydajności w 2025 roku.',
    },
    { id: 2, title: 'Dodaj atrybuty ALT', desc: 'Pomóż Google zrozumieć, co jest na zdjęciu.' },
    {
      id: 3,
      title: 'Włącz Lazy Loading',
      desc: 'Pobieraj zdjęcia tylko wtedy, gdy są widoczne na ekranie.',
    },
    {
      id: 4,
      title: 'Zdefiniuj Width i Height',
      desc: "Zapobiegaj 'skakaniu' strony (CLS) podczas ładowania.",
    },
    {
      id: 5,
      title: 'Użyj responsywnych rozmiarów (srcset)',
      desc: 'Nie wysyłaj ogromnego zdjęcia na mały ekran telefonu.',
    },
  ];

  const toggle = (id: number) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden not-prose">
      <div className="bg-dark p-6 text-white text-center">
        <h3 className="font-bold text-lg">Twój Image SEO Score</h3>
        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(checked.length / items.length) * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="p-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggle(item.id)}
            role="checkbox"
            aria-checked={checked.includes(item.id)}
            tabIndex={0}
            aria-label={item.title}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') toggle(item.id);
            }}
            className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${checked.includes(item.id) ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
          >
            <div
              className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked.includes(item.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300'}`}
            >
              {checked.includes(item.id) && <CheckCircle2 size={14} />}
            </div>
            <div>
              <h5
                className={`font-bold text-sm transition-colors ${checked.includes(item.id) ? 'text-emerald-900' : 'text-dark'}`}
              >
                {item.title}
              </h5>
              <p className="text-xs text-gray-700 mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      {checked.length === items.length && (
        <div className="p-10 text-center animate-fade-in bg-gradient-to-b from-white to-emerald-50 border-t border-emerald-100 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-20"></div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
              <CheckCircle2 size={28} />
            </div>
            <h5 className="text-xl font-bold text-dark mb-2">Image SEO ukończone!</h5>
            <p className="text-gray-700 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
              Twoje grafiki są teraz zoptymalizowane pod kątem wyszukiwarek i szybkości ładowania.
            </p>
            <button
              onClick={() => setChecked([])}
              className="inline-flex items-center gap-2 text-xs font-black text-primary hover:text-dark transition-colors uppercase tracking-widest"
            >
              <RefreshCw size={14} /> Zresetuj checklistę
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageFormatsArticle;
