/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Palette,
  Zap,
  Terminal,
  ChevronDown,
  CheckCircle2,
  Rocket,
  Info,
  Layers,
  Code2,
  Layout,
  Smartphone,
  ShieldCheck,
  Star,
  ArrowRight,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import { ARTICLES } from '../../data/articles';
import { TAILWIND_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/tailwind';
import {
  TailwindButtonBuilder,
  LegoVsPlaymobil,
  BootstrapVsTailwindPreview,
} from './visuals/TailwindVisuals';
import ArticleShell from './ArticleShell';

const TailwindArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'tailwind-css-przyszlosc-ui');
  const [scrollProgress, setScrollProgress] = useState(0);

  return (
    <ArticleShell
      id="tailwind-css-przyszlosc-ui"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/tailwind-css.png'}
      icon={Palette}
      accentColor="#06B6D4"
      heroVisual={<TailwindButtonBuilder />}
    >
      <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
        <Layout className="text-secondary mt-1 shrink-0" size={20} />
        <div>
          <p className="text-sm text-secondary m-0 font-medium">
            Ten artykuł jest częścią serii <strong>Frontend Architecture</strong>.
          </p>
          <div className="text-sm text-primary font-bold mt-1 flex flex-wrap items-center gap-1">
            Zobacz pełne porównanie:
            <Link
              to="/baza-wiedzy/react-js-najbezpieczniejsza-technologia-dla-biznesu/"
              className="hover:text-secondary underline"
            >
              React
            </Link>{' '}
            vs
            <Link
              to="/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych/"
              className="hover:text-secondary underline"
            >
              Next.js
            </Link>{' '}
            vs
            <Link
              to="/baza-wiedzy/frontend-bez-tajemnic-kompendium-cto/"
              className="hover:text-secondary underline"
            >
              Vue
            </Link>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
      </AnimateOnScroll>

      {/* WHAT IS TAILWIND */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.whatIs.title}
          subtitle={CONTENT.whatIs.subtitle}
          align="left"
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.whatIs.text }} />

        <div className="not-prose">
          <LegoVsPlaymobil />
        </div>
      </div>

      {/* PREVIEW COMPARISON */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.preview.title}
          subtitle={CONTENT.preview.subtitle}
          align="left"
        />
        <p>{CONTENT.preview.text}</p>

        <div className="not-prose">
          <BootstrapVsTailwindPreview />
        </div>
      </div>

      {/* 4 REASONS SECTION */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.reasons.title}
          subtitle={CONTENT.reasons.subtitle}
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 not-prose">
          {CONTENT.reasons.items.map((reason, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {i === 0 ? (
                  <Palette className="text-pink-500" />
                ) : i === 1 ? (
                  <Zap className="text-amber-500" />
                ) : i === 2 ? (
                  <Rocket className="text-emerald-500" />
                ) : (
                  <Smartphone className="text-blue-500" />
                )}
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">{reason.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed m-0">{reason.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.comparison.title}
          subtitle={CONTENT.comparison.subtitle}
          align="left"
        />
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg mt-8 not-prose">
          <table className="w-full text-left bg-white">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-xs font-black uppercase text-gray-500">
                  {CONTENT.comparison.headers[0]}
                </th>
                <th className="p-4 text-xs font-black uppercase text-gray-500">
                  {CONTENT.comparison.headers[1]}
                </th>
                <th className="p-4 text-xs font-black uppercase text-secondary">
                  {CONTENT.comparison.headers[2]}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {CONTENT.comparison.rows.map((row, i) => (
                <tr key={i}>
                  <td className="p-4 font-bold">{row.label}</td>
                  <td className="p-4 text-red-500">{row.v1}</td>
                  <td className="p-4 text-emerald-600 font-bold">{row.v2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MYTH SECTION */}
      <div className="my-24 bg-[#0B1120] rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden not-prose">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-10"></div>
        <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:width-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Info size={14} /> Obalamy Mity
            </div>
            <h2 className="text-3xl font-bold text-white mb-6 mt-0">{CONTENT.myth.title}</h2>
            <p
              className="text-gray-400 text-lg leading-relaxed mb-8"
              dangerouslySetInnerHTML={{ __html: CONTENT.myth.text1 }}
            />
            <p
              className="text-gray-400 text-lg leading-relaxed m-0"
              dangerouslySetInnerHTML={{ __html: CONTENT.myth.text2 }}
            />
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 font-mono text-xxs md:text-xs text-[#A6ACCD]">
              <div className="flex gap-2 mb-4 opacity-40">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-gray-600 mb-2">{'//'} Zamiast pisać to wszędzie:</div>
                  <div className="text-blue-400">{`<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">`}</div>
                  <div className="pl-4 text-white">Kliknij mnie</div>
                  <div className="text-blue-400">{`</button>`}</div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="text-gray-600 mb-2">{'//'} Tworzymy komponent i używamy tak:</div>
                  <div className="text-emerald-400">{`<PrimaryButton>Kliknij mnie</PrimaryButton>`}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY & CTA */}
      <div className="mt-32">
        <AnimateOnScroll>
          <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-white border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] opacity-40"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-secondary to-primary rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Palette size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-dark">{CONTENT.cta.title}</h2>
              <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                {CONTENT.cta.text}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-xl shadow-primary/20"
                  onClick={() => (window.location.href = '/design/ui-ux/')}
                >
                  {CONTENT.cta.primaryBtn}
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-200 hover:border-primary hover:text-primary"
                  size="lg"
                  onClick={() => (window.location.href = '/baza-wiedzy/')}
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

export default TailwindArticle;
