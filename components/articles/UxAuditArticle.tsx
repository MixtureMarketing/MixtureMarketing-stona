import React from 'react';
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
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import Image from '../common/Image';
import { useModal } from '../../context/ModalContext';
import { ARTICLES } from '../../data/articles';
import { UX_AUDIT_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/ux-audit';
import ArticleShell from './ArticleShell';
import { LeakyBucketVisual, MobileComparisonVisual, HeatmapVisual } from './visuals/UxAuditVisuals';

const UxAuditArticle = () => {
  const { openModal } = useModal();
  const articleData = ARTICLES.find((a) => a.id === 'ux-audit');

  return (
    <ArticleShell
      id="ux-audit"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="design"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/audyt-ux.png'}
      icon={Layout}
      accentColor="#3B82F6"
      slug="/baza-wiedzy/audyt-ux-sklepu-internetowego"
      heroVisual={
        <>
          <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
            <Image
              src="/assets/images/audyt-ux.png"
              alt="UX Team analyzing interface usability"
              className="w-full h-[400px] object-cover"
              priority
            />
          </div>
          <div className="mb-20">
            <LeakyBucketVisual />
          </div>
        </>
      }
    >
      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
        <div className="mt-6 p-4 bg-secondary/5 border-l-4 border-secondary rounded-r-xl">
          <p className="text-sm m-0" dangerouslySetInnerHTML={{ __html: CONTENT.lead.support }} />
        </div>
      </AnimateOnScroll>

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
            <h3 className="text-xl font-bold text-dark mb-2">{CONTENT.definition.ui.title}</h3>
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
            <h3 className="text-xl font-bold text-white mb-2">{CONTENT.definition.ux.title}</h3>
            <p className="text-sm text-gray-300 mb-4">{CONTENT.definition.ux.desc}</p>
            <div className="inline-block text-xxs font-bold text-[#059669] uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full">
              {CONTENT.definition.ux.analogy}
            </div>
          </div>
        </div>
      </div>

      <div className="my-24">
        <SectionHeader
          title={CONTENT.killers.title}
          subtitle={CONTENT.killers.subtitle}
          align="left"
        />
        <p>{CONTENT.killers.text}</p>

        <div className="space-y-12 mt-12 not-prose">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border border-red-200">
                  1
                </div>
                <h3 className="text-2xl font-bold text-dark m-0">{CONTENT.killers.mobile.title}</h3>
              </div>
              <p className="text-gray-600 mb-8 max-w-2xl">{CONTENT.killers.mobile.desc}</p>
              <MobileComparisonVisual />
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border border-orange-200">
                  2
                </div>
                <h3 className="text-2xl font-bold text-dark m-0">{CONTENT.killers.forms.title}</h3>
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

      <div className="my-24">
        <SectionHeader title={CONTENT.tools.title} subtitle={CONTENT.tools.subtitle} align="left" />
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
          <p className="text-xl text-dark font-medium mb-10 leading-relaxed">{CONTENT.roi.text}</p>
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
    </ArticleShell>
  );
};

export default UxAuditArticle;
