/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  MousePointer2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Layout,
  BarChart3,
  Flame,
  MousePointerClick,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import Image from '../common/Image';
import AmbientBackground from '../common/AmbientBackground';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import { ARTICLES } from '../../data/articles';
import { UX_AUDIT_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/ux-audit';

const UxAuditArticle = () => {
  const { openModal } = useModal();
  const articleData = ARTICLES.find((a) => a.id === 'ux-audit');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-primary/30 font-sans">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Twój sklep ma ruch, ale brak zamówień? Dowiedz się, czym jest Audyt UX i jak wykryć błędy, które zabijają Twoją konwersję.'
        }
        image={articleData?.image}
        article={articleData}
      />

      <AmbientBackground />

      {/* Custom Keyframes Styles */}
      <style>{`
        @keyframes wave {
          0% { transform: translateX(0) translateZ(0) scaleY(1); }
          50% { transform: translateX(-25%) translateZ(0) scaleY(0.85); }
          100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
        }
        @keyframes drop-fall {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(200px) scale(0.5); opacity: 0; }
        }
        @keyframes cursor-path {
          0% { transform: translate(20px, 20px); }
          30% { transform: translate(120px, 80px); } /* Move to button */
          40% { transform: translate(120px, 80px) scale(0.9); } /* Click 1 */
          45% { transform: translate(120px, 80px) scale(1); }
          50% { transform: translate(120px, 80px) scale(0.9); } /* Click 2 */
          55% { transform: translate(120px, 80px) scale(1); }
          60% { transform: translate(122px, 78px) scale(0.9); } /* Rage Click 3 */
          65% { transform: translate(120px, 80px) scale(1); }
          100% { transform: translate(120px, 80px); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <Layout size={12} />
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

          {/* Hero Image */}
          <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
            <Image
              src="/assets/images/audyt-ux.png"
              alt="UX Team analyzing interface usability"
              className="w-full h-[400px] object-cover"
              priority
            />
          </div>

          {/* Hero Visual - Leaky Bucket 2.0 */}
          <div className="mb-20">
            <LeakyBucketVisual />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-secondary hover:prose-a:text-primary prose-strong:text-dark prose-li:text-gray-700">
            <AnimateOnScroll>
              <p
                className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl"
                dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
              />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
              <div className="mt-6 p-4 bg-secondary/5 border-l-4 border-secondary rounded-r-xl">
                <p
                  className="text-sm m-0"
                  dangerouslySetInnerHTML={{ __html: CONTENT.lead.support }}
                />
              </div>
            </AnimateOnScroll>

            {/* WHAT IS UX AUDIT */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.definition.title}
                subtitle={CONTENT.definition.subtitle}
                align="left"
              />
              <p>{CONTENT.definition.text}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                    <Layout className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">
                    {CONTENT.definition.ui.title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">{CONTENT.definition.ui.desc}</p>
                  <div className="inline-block text-xxs font-bold text-gray-600 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">
                    {CONTENT.definition.ui.analogy}
                  </div>
                </div>

                <div className="bg-dark p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[50px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                    <MousePointer2 className="text-[#059669]" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {CONTENT.definition.ux.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">{CONTENT.definition.ux.desc}</p>
                  <div className="inline-block text-xxs font-bold text-[#059669] uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full">
                    {CONTENT.definition.ux.analogy}
                  </div>
                </div>
              </div>
            </div>

            {/* TOP 5 KILLERS */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.killers.title}
                subtitle={CONTENT.killers.subtitle}
                align="left"
              />
              <p>{CONTENT.killers.text}</p>

              <div className="space-y-12 mt-12 not-prose">
                {/* 1. Mobile First */}
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border border-red-200">
                        1
                      </div>
                      <h3 className="text-2xl font-bold text-dark m-0">
                        {CONTENT.killers.mobile.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-8 max-w-2xl">{CONTENT.killers.mobile.desc}</p>
                    <MobileComparisonVisual />
                  </div>
                </div>

                {/* 2. Forms */}
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border border-orange-200">
                        2
                      </div>
                      <h3 className="text-2xl font-bold text-dark m-0">
                        {CONTENT.killers.forms.title}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 hover:bg-red-50 transition-colors">
                        <div className="text-red-800 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                          <XCircle size={16} /> Błąd
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {CONTENT.killers.forms.bad}
                        </p>
                      </div>
                      <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 hover:bg-emerald-50 transition-colors">
                        <div className="text-emerald-800 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                          <CheckCircle2 size={16} /> Rozwiązanie
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {CONTENT.killers.forms.good}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick List 3-5 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CONTENT.killers.list.map((item, index) => (
                    <div
                      key={index}
                      className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-primary transition-all group ${index === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                    >
                      <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center font-bold mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        {index + 3}
                      </div>
                      <h3 className="font-bold text-dark mb-2">{item.title}</h3>
                      <p className="text-xs text-gray-700 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TOOLS & HEATMAP */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.tools.title}
                subtitle={CONTENT.tools.subtitle}
                align="left"
              />
              <p>{CONTENT.tools.text}</p>

              <div className="my-12">
                <HeatmapVisual />
              </div>

              <ul className="not-prose grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CONTENT.tools.items.map((item, i) => (
                  <li
                    key={i}
                    className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm ${i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                  >
                    <div
                      className={`w-12 h-12 ${i === 0 ? 'bg-orange-50 text-orange-500' : i === 1 ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'} rounded-xl flex items-center justify-center mb-4`}
                    >
                      {i === 0 ? (
                        <Flame size={24} />
                      ) : i === 1 ? (
                        <MousePointerClick size={24} />
                      ) : (
                        <BarChart3 size={24} />
                      )}
                    </div>
                    <h3 className="font-bold text-dark mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-700">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* ROI */}
            <div className="my-24 bg-blue-50 rounded-[3rem] p-10 md:p-16 relative overflow-hidden not-prose text-center md:text-left">
              <div className="absolute top-0 right-0 p-12 opacity-10 hidden md:block">
                <TrendingUp size={150} className="text-secondary" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <SectionHeader
                  title={CONTENT.roi.title}
                  subtitle={CONTENT.roi.subtitle}
                  align="left"
                  className="mb-8"
                />
                <p className="text-xl text-dark font-medium mb-10 leading-relaxed">
                  {CONTENT.roi.text}
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  {CONTENT.roi.cards.map((card, i) => (
                    <div
                      key={i}
                      className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-lg flex-1"
                    >
                      <div className="text-xs font-bold uppercase text-secondary mb-2 opacity-70">
                        {card.label}
                      </div>
                      <p
                        className="text-sm font-medium text-dark"
                        dangerouslySetInnerHTML={{ __html: card.text }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
                      <Search size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
                    <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      {CONTENT.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-xl shadow-primary/20"
                        onClick={() => openModal('audit')}
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

            <RelatedArticles currentArticleId="ux-audit" category="design" />
          </article>
        </div>
      </div>
    </div>
  );
};

// --- ADVANCED VISUAL COMPONENTS ---

const LeakyBucketVisual = () => {
  return (
    <div className="relative bg-white rounded-[3rem] p-8 md:p-12 overflow-hidden border border-gray-100 shadow-2xl flex flex-col items-center group">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>

      <div className="text-center mb-12 relative z-10">
        <h3 className="text-2xl font-bold text-dark">Efekt "Dziurawego Wiadra"</h3>
        <p className="text-gray-700 text-sm mt-2">Dlaczego reklamy nie przynoszą zysku?</p>
      </div>

      <div className="relative w-full max-w-lg h-[450px] flex flex-col items-center pt-4">
        {/* 1. Water Stream (Incoming Traffic) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-16 h-32 bg-gradient-to-b from-blue-400 to-blue-500 opacity-90 rounded-b-2xl z-20 shadow-[0_10px_30px_rgba(59,130,246,0.4)]">
          {/* Flow Animation Overlay */}
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-b-2xl"></div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-xxs font-bold text-white uppercase tracking-widest drop-shadow-md bg-blue-600/50 px-2 py-0.5 rounded-full">
            Ruch / Ads
          </div>
        </div>

        {/* 2. The Bucket Container */}
        <div className="relative w-64 h-72 z-10 mt-20">
          {/* Bucket Body */}
          <div className="absolute inset-0 border-x-4 border-b-4 border-gray-300 rounded-b-[4rem] bg-gradient-to-b from-white to-gray-50 overflow-hidden backdrop-blur-sm shadow-inner">
            {/* Water Body with Wave Animation */}
            <div className="absolute bottom-0 w-full h-[60%] bg-blue-500/10 overflow-hidden">
              {/* The Wave */}
              <div className="absolute top-0 left-0 w-[200%] h-full">
                <div
                  className="w-full h-8 bg-blue-500 opacity-50 absolute top-0"
                  style={{
                    borderRadius: '50%',
                    animation: 'wave 3s linear infinite',
                  }}
                ></div>
                <div
                  className="w-full h-8 bg-blue-400 opacity-30 absolute top-2"
                  style={{
                    borderRadius: '50%',
                    animation: 'wave 4s linear infinite reverse',
                  }}
                ></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-blue-400/80 to-blue-600/80 top-4"></div>
            </div>

            {/* Label */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 font-bold text-xs uppercase tracking-widest">
              Twój Sklep
            </div>
          </div>

          {/* Bucket Rim (3D effect) */}
          <div className="absolute -top-2 left-0 w-full h-8 border-4 border-gray-300 rounded-[50%] bg-gray-50 shadow-sm z-30"></div>

          {/* 3. The Leaks (Animated Drops) */}

          {/* Leak 1: Mobile */}
          <div className="absolute top-[40%] -left-1 w-3 h-3 bg-gray-800 rounded-full z-20 shadow-sm"></div>
          <div className="absolute top-[40%] left-0 -translate-x-4 w-24 h-1 bg-gradient-to-r from-blue-400 to-transparent -rotate-12 origin-right"></div>
          {/* Drops Container */}
          <div className="absolute top-[40%] left-[-10px] w-4 h-64 overflow-hidden pointer-events-none">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full absolute top-0 left-0"
              style={{ animation: 'drop-fall 1.5s infinite linear' }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full absolute top-0 left-0"
              style={{ animation: 'drop-fall 1.5s infinite linear', animationDelay: '0.7s' }}
            ></div>
          </div>
          <div
            className="absolute top-[35%] right-full mr-4 bg-white px-3 py-1 rounded-lg shadow-lg border border-red-100 text-xxs font-bold text-red-500 whitespace-nowrap animate-bounce"
            style={{ animationDuration: '3s' }}
          >
            Brak Mobile
          </div>

          {/* Leak 2: Checkout */}
          <div className="absolute top-[60%] -right-1 w-3 h-3 bg-gray-800 rounded-full z-20 shadow-sm"></div>
          <div className="absolute top-[60%] right-0 translate-x-4 w-20 h-1 bg-gradient-to-l from-blue-400 to-transparent rotate-6 origin-left"></div>
          <div className="absolute top-[60%] right-[-10px] w-4 h-64 overflow-hidden pointer-events-none">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full absolute top-0 right-0"
              style={{ animation: 'drop-fall 1.2s infinite linear', animationDelay: '0.2s' }}
            ></div>
          </div>
          <div className="absolute top-[55%] left-full ml-4 bg-white px-3 py-1 rounded-lg shadow-lg border border-red-100 text-xxs font-bold text-red-500 whitespace-nowrap">
            Trudny Checkout
          </div>
        </div>

        {/* 4. The Result (Dripping Sales) */}
        <div className="mt-4 flex flex-col items-center gap-2 relative z-10">
          <div className="w-20 h-1 bg-gray-200 rounded-full mb-4"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-bounce"></div>
          <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl text-center">
            <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Sprzedaż</div>
            <div className="text-xxs text-green-600 font-medium opacity-80">Tylko krople...</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileComparisonVisual = () => {
  return (
    <div className="flex flex-col md:flex-row justify-center gap-12 mt-12">
      {/* Bad Example */}
      <div className="group relative flex flex-col items-center">
        {/* Phone Frame */}
        <div className="w-56 h-[400px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl relative border-[6px] border-gray-800 ring-1 ring-white/10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-xl z-20"></div>

          {/* Screen Content */}
          <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative flex flex-col">
            <div className="w-full h-12 bg-gray-50 border-b flex items-center justify-between px-4">
              <div className="w-16 h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="p-4 space-y-3 opacity-50 blur-[0.5px]">
              <div className="w-full h-32 bg-gray-100 rounded-lg"></div>
              <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
              <div className="w-full h-2 bg-gray-200 rounded"></div>
            </div>

            {/* The Annoying Popup */}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm">
              <div className="bg-white p-4 w-full rounded-xl text-center shadow-2xl relative animate-pulse">
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs border-2 border-white shadow-md">
                  ✕
                </div>
                <h3 className="font-bold text-red-600 text-sm mb-2">KUP TERAZ!</h3>
                <p className="text-xxs text-gray-700 mb-3">
                  Zapisz się do newslettera i odbierz rabat!
                </p>
                <button className="bg-red-600 text-white text-xxs font-bold py-2 px-4 rounded w-full">
                  KLIKNIJ TUTAJ
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-full border border-red-100">
          <XCircle size={20} />
          <span className="text-sm">ŹLE</span>
        </div>
      </div>

      {/* Good Example */}
      <div className="group relative flex flex-col items-center">
        {/* Hotspots Overlay (Only on Hover) */}
        <div className="absolute top-32 right-10 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-lg relative cursor-help"></div>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xxs px-2 py-1 rounded whitespace-nowrap shadow-xl">
              Czytelne zdjęcia
            </div>
          </div>
        </div>

        {/* Phone Frame */}
        <div className="w-56 h-[400px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl relative border-[6px] border-gray-800 ring-1 ring-white/10 transform group-hover:scale-105 transition-transform duration-500">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-xl z-20"></div>

          {/* Screen Content */}
          <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden flex flex-col relative">
            {/* Header */}
            <div className="w-full h-12 bg-white flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
              <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
              <div className="w-4 h-4 text-gray-800">
                <ShoppingCart size={16} />
              </div>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-hidden p-0">
              <div className="w-full h-48 bg-gray-50 flex items-center justify-center mb-4">
                <div className="w-24 h-32 bg-white shadow-lg rounded-xl transform -rotate-6 border border-gray-100"></div>
              </div>
              <div className="px-5">
                <h3 className="font-bold text-lg text-gray-900 mb-1">Sneakers Pro</h3>
                <div className="text-emerald-600 font-bold text-sm mb-4">499.00 PLN</div>
                <p className="text-xxs text-gray-600 leading-relaxed">
                  Najlepsze buty do biegania w terenie. Lekkie i wytrzymałe.
                </p>
              </div>
            </div>

            {/* Sticky CTA */}
            <div className="p-4 bg-white/90 backdrop-blur border-t absolute bottom-0 w-full">
              <button className="w-full bg-[#059669] hover:bg-[#00a844] text-white font-bold py-3 rounded-xl shadow-[0_4px_14px_rgba(0,200,83,0.3)] text-xs flex items-center justify-center gap-2 transition-all active:scale-95">
                <ShoppingCart size={14} /> DODAJ DO KOSZYKA
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[#059669] font-bold bg-green-50 px-4 py-2 rounded-full border border-green-100">
          <CheckCircle2 size={20} />
          <span className="text-sm">DOBRZE</span>
        </div>
      </div>
    </div>
  );
};

const HeatmapVisual = () => {
  return (
    <div className="bg-gray-900 rounded-[2rem] p-2 overflow-hidden relative shadow-2xl border border-gray-800 group h-[400px]">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 z-0"></div>

      {/* Fake Browser UI */}
      <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 rounded-t-[1.5rem] relative z-10 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="ml-4 bg-gray-900/50 h-6 w-full max-w-sm rounded-lg border border-gray-700/50"></div>
      </div>

      {/* Simulated Website Content */}
      <div className="bg-white relative h-full w-full p-8 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="w-32 h-6 bg-gray-200 rounded"></div>
          <div className="flex gap-4">
            <div className="w-16 h-4 bg-gray-100 rounded"></div>
            <div className="w-16 h-4 bg-gray-100 rounded"></div>
          </div>
        </div>

        {/* Hero */}
        <div className="flex gap-8">
          <div className="w-1/2 space-y-4 pt-4">
            <div className="w-3/4 h-8 bg-gray-800 rounded"></div>
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-5/6 h-4 bg-gray-200 rounded"></div>

            {/* The Broken Button (Target of Rage Click) */}
            <div className="mt-8 relative inline-block">
              <div className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-lg font-bold text-sm cursor-pointer opacity-90">
                KUP TERAZ
              </div>

              {/* Rage Click Effect (Triggered by CSS Animation) */}
              <div
                className="absolute inset-0 bg-red-500 rounded-lg pointer-events-none opacity-0"
                style={{
                  animation: 'ripple 0.5s ease-out forwards',
                  animationDelay: '3s',
                  animationIterationCount: 'infinite',
                }}
              ></div>
            </div>
          </div>
          <div className="w-1/2 h-48 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <div className="text-gray-300 text-4xl font-black opacity-20">IMG</div>
          </div>
        </div>

        {/* Animated Cursor */}
        <div
          className="absolute top-0 left-0 pointer-events-none z-50 drop-shadow-2xl"
          style={{ animation: 'cursor-path 6s infinite ease-in-out' }}
        >
          <MousePointer2 className="text-black fill-white" size={24} />

          {/* Click Indicator */}
          <div
            className="absolute -top-2 -left-2 w-10 h-10 border-2 border-red-500 rounded-full opacity-0"
            style={{ animation: 'ripple 1s infinite', animationDelay: '2.5s' }}
          ></div>
        </div>
      </div>

      {/* Detective Overlay */}
      <div className="absolute bottom-6 left-6 bg-gray-900/90 backdrop-blur-md text-white p-4 rounded-xl border border-gray-700 shadow-2xl max-w-xs z-40">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="text-red-500" size={20} />
          <span className="font-bold text-sm">Wykryto problem!</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Użytkownik klika w przycisk "Kup Teraz", ale nic się nie dzieje (tzw.{' '}
          <strong className="text-white">Rage Click</strong>). Prawdopodobnie błąd JavaScript.
        </p>
      </div>
    </div>
  );
};

export default UxAuditArticle;
