import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Zap, CheckCircle2, ArrowRight, Layout, Globe, Box } from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import ArticleShell from './ArticleShell';
import { ARTICLES } from '../../data/articles';
import { VUE_ARTICLE_CONTENT } from '../../data/content/articles/vue';
import {
  VueHeroVisual,
  FrameworkSpectrum,
  ProgressiveScalingVisual,
  VueSfcPreview,
} from './visuals/VueVisuals';

const VueArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'vue-js-harmonijny-kompromis');
  const content = VUE_ARTICLE_CONTENT;

  if (!articleData) return null;

  return (
    <ArticleShell
      id={articleData.id}
      title={articleData.title}
      description={content.header.subtitle}
      category="tech"
      categoryLabel={content.header.badge}
      image={articleData.image}
      icon={Heart}
      accentColor="#42B883"
      heroVisual={<VueHeroVisual />}
      slug="/baza-wiedzy/vue-js-harmonijny-kompromis-react-angular"
    >
      <div className="mb-16 p-6 bg-white border border-blue-100 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start gap-5 not-prose hover:shadow-md transition-shadow">
        <div className="bg-blue-50 p-3 rounded-full shrink-0">
          <Layout className="text-secondary" size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
            {content.contextBox.title}
          </p>
          <h4 className="text-lg font-bold text-dark mb-2">{content.contextBox.subtitle}</h4>
          <p className="text-sm text-gray-600 mb-3">{content.contextBox.text}</p>
          <Link
            to={content.contextBox.linkUrl}
            className="text-sm text-[#42B883] hover:text-[#35495E] font-bold inline-flex items-center gap-2 group"
          >
            {content.contextBox.linkText}{' '}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <AnimateOnScroll>
        <p className="lead text-2xl text-[#35495E] mb-12 font-medium leading-relaxed border-l-4 border-[#42B883] pl-6 py-2 bg-emerald-50/30 rounded-r-xl">
          {content.lead.highlight}
        </p>
        <p>{content.lead.text}</p>
      </AnimateOnScroll>

      <div className="my-32">
        <SectionHeader
          title={content.spectrum.title}
          subtitle={content.spectrum.subtitle}
          align="center"
        />
        <p className="text-center max-w-2xl mx-auto mb-12">{content.spectrum.text}</p>
        <div className="not-prose">
          <FrameworkSpectrum />
        </div>
      </div>

      <div className="my-32">
        <SectionHeader
          title={content.progressive.title}
          subtitle={content.progressive.subtitle}
          align="left"
        />
        <p>{content.progressive.text}</p>
        <div className="not-prose mt-12">
          <ProgressiveScalingVisual />
        </div>
      </div>

      <div className="my-32">
        <SectionHeader
          title={content.businessReasons.title}
          subtitle={content.businessReasons.subtitle}
          align="left"
        />

        <div className="space-y-8 mt-12 not-prose">
          {content.businessReasons.cards.map((reason, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row gap-6 items-start p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#42B883]/30 transition-all group"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-[#42B883] group-hover:text-white transition-colors duration-300">
                {i === 0 ? (
                  <Box className="text-[#42B883]" size={32} />
                ) : i === 1 ? (
                  <Zap className="text-amber-500" size={32} />
                ) : (
                  <Box className="text-blue-500" size={32} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark mb-2 group-hover:text-[#42B883] transition-colors">
                  {reason.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed m-0">{reason.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="my-32">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <SectionHeader
              title={content.techCorner.title}
              subtitle={content.techCorner.subtitle}
              align="left"
            />
            {content.techCorner.text.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }}></p>
            ))}
          </div>
          <div className="flex-1 w-full not-prose">
            <VueSfcPreview />
          </div>
        </div>
      </div>

      <div className="my-32 bg-white p-8 md:p-16 rounded-[3rem] border border-emerald-100 shadow-xl relative overflow-hidden not-prose group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Globe size={200} className="text-emerald-900" />
        </div>
        <div className="relative z-10">
          <SectionHeader title={content.nuxt.title} subtitle={content.nuxt.subtitle} align="left" />
          <p
            className="text-gray-600 mb-8 max-w-2xl leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: content.nuxt.text }}
          ></p>
          <div className="flex wrap gap-4">
            {content.nuxt.badges.map((badge, i) => (
              <div
                key={i}
                className="bg-emerald-50 text-emerald-800 px-5 py-3 rounded-2xl text-sm font-bold border border-emerald-200 flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 size={18} className="text-[#42B883]" /> {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="my-32">
        <SectionHeader
          title={content.comparison.title}
          subtitle={content.comparison.subtitle}
          align="center"
        />
        <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-2xl mt-12 not-prose bg-white">
          <table className="w-full text-left">
            <thead className="bg-[#35495E] text-white">
              <tr>
                <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                  {content.comparison.headers[0]}
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-wider text-[#42B883]">
                  {content.comparison.headers[1]}
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                  {content.comparison.headers[2]}
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                  {content.comparison.headers[3]}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {content.comparison.rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6 font-bold text-gray-900 bg-gray-50/50">{row.feature}</td>
                  <td className="p-6 text-[#00684A] font-bold bg-emerald-50/30">{row.vue}</td>
                  <td className="p-6 text-gray-600">{row.react}</td>
                  <td className="p-6 text-gray-600">{row.angular}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-32">
        <AnimateOnScroll>
          <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#42B883] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#35495E] rounded-full blur-[100px] opacity-40"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Heart size={48} className="text-[#42B883]" fill="currentColor" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                {content.cta.title}
              </h2>
              <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                {content.cta.text}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-xl shadow-[#42B883]/20 !bg-[#42B883] border-none text-dark font-black hover:!bg-[#3AA675] px-10 py-4"
                  onClick={() => (window.location.href = '/web-development/custom-app/')}
                >
                  {content.cta.primaryBtn}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white px-10 py-4"
                  size="lg"
                  onClick={() => (window.location.href = '/baza-wiedzy/')}
                >
                  {content.cta.secondaryBtn}
                </Button>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </ArticleShell>
  );
};

export default VueArticle;
