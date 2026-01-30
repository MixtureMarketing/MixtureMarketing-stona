import React from 'react';
import {
  ShieldCheck,
  Zap,
  Server,
  ArrowRight,
  Key,
  Database,
  Layout,
  Bot,
  Cpu,
  Lock,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import ArticleShell from './ArticleShell';
import { ARTICLES } from '../../data/articles';
import { PYTHON_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/python';
import {
  PythonHeroVisual,
  SecurityShieldVisual,
  DjangoAdminPreview,
  ScalabilityVisual,
} from './visuals/PythonVisuals';

const PythonArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'python-django-framework-fintech');

  if (!articleData) return null;

  return (
    <ArticleShell
      id={articleData.id}
      title={articleData.title}
      description="Dowiedz się, dlaczego Fintechy i Startupy kochają Django. Bezpieczeństwo klasy bankowej i błyskawiczne wdrożenia MVP."
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData.image}
      icon={ShieldCheck}
      accentColor="#00684A"
      heroVisual={<PythonHeroVisual />}
      slug="/baza-wiedzy/python-django-bezpieczenstwo-fintech-mvp"
    >
      <div className="max-w-2xl mx-auto mb-16 text-center">
        <p className="text-xl text-gray-600 leading-relaxed font-medium italic border-l-4 border-[#00684A] pl-6 py-4 bg-white shadow-sm rounded-r-xl not-prose">
          {CONTENT.header.quote}
        </p>
      </div>

      <div className="mb-16 p-6 bg-white border border-blue-100 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start gap-5 not-prose hover:shadow-md transition-shadow">
        <div className="bg-blue-50 p-3 rounded-full shrink-0">
          <Server className="text-secondary" size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
            Szerszy Kontekst
          </p>
          <h4 className="text-lg font-bold text-dark mb-2">{CONTENT.contextBox.title}</h4>
          <p className="text-sm text-gray-600 mb-3">{CONTENT.contextBox.text}</p>
          <a
            href={CONTENT.contextBox.linkUrl}
            className="text-sm text-[#00684A] hover:text-[#00ED64] font-bold inline-flex items-center gap-2 group"
          >
            {CONTENT.contextBox.linkText}{' '}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      <AnimateOnScroll>
        <p
          className="lead text-2xl text-dark mb-12 font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
      </AnimateOnScroll>

      <div className="my-32">
        <SectionHeader
          title={CONTENT.batteries.title}
          subtitle={CONTENT.batteries.subtitle}
          align="left"
        />
        <p>{CONTENT.batteries.text}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-12 not-prose">
          {[
            { ...CONTENT.batteries.cards[0], icon: <Key size={24} /> },
            { ...CONTENT.batteries.cards[1], icon: <Database size={24} /> },
            { ...CONTENT.batteries.cards[2], icon: <Layout size={24} /> },
            { ...CONTENT.batteries.cards[3], icon: <ShieldCheck size={24} /> },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-5 p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm group hover:border-[#00684A]/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-emerald-50 text-[#00684A] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#00684A] group-hover:text-white transition-colors duration-300">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-dark text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 m-0 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#092e20] text-white p-8 md:p-10 rounded-[2.5rem] border border-[#00684A]/30 flex flex-col md:flex-row items-center justify-between gap-8 not-prose shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-[#00ED64] uppercase tracking-widest mb-2">
              Werdykt Biznesowy
            </p>
            <p
              className="m-0 font-medium text-xl text-gray-100"
              dangerouslySetInnerHTML={{ __html: CONTENT.batteries.verdict }}
            />
          </div>
          <Zap className="text-[#00ED64] animate-pulse shrink-0 relative z-10" size={48} />
        </div>
      </div>

      <div className="my-32">
        <SectionHeader
          title={CONTENT.security.title}
          subtitle={CONTENT.security.subtitle}
          align="center"
        />
        <p className="text-center max-w-2xl mx-auto mb-16">{CONTENT.security.text}</p>
        <div className="not-prose my-12">
          <SecurityShieldVisual content={CONTENT.security} />
        </div>
      </div>

      <div className="my-32">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <SectionHeader
              title={CONTENT.admin.title}
              subtitle={CONTENT.admin.subtitle}
              align="left"
            />
            <p>{CONTENT.admin.text1}</p>
            <p dangerouslySetInnerHTML={{ __html: CONTENT.admin.text2 }} />
          </div>
          <div className="flex-1 not-prose w-full">
            <DjangoAdminPreview />
          </div>
        </div>
      </div>

      <div className="my-32">
        <SectionHeader
          title={CONTENT.scalability.title}
          subtitle={CONTENT.scalability.subtitle}
          align="left"
        />
        <p>{CONTENT.scalability.text}</p>
        <div className="not-prose mt-12">
          <ScalabilityVisual content={CONTENT.scalability} />
        </div>
      </div>

      <div className="my-32 bg-gradient-to-br from-white to-indigo-50/50 p-8 md:p-16 rounded-[3rem] border border-indigo-100 shadow-xl relative overflow-hidden not-prose group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
          <Bot size={200} className="text-indigo-600" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
            <Cpu size={14} />
            <span>{CONTENT.ai.subtitle}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-6">{CONTENT.ai.title}</h2>
          <p
            className="text-gray-600 mb-10 max-w-2xl leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: CONTENT.ai.text }}
          />
          <div className="flex flex-wrap gap-4">
            {CONTENT.ai.tags.map((tag, i) => (
              <div
                key={i}
                className="bg-white px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest border border-gray-200 shadow-sm flex items-center gap-3"
              >
                <div
                  className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-yellow-500' : 'bg-green-500'}`}
                ></div>{' '}
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="my-32">
        <SectionHeader
          title={CONTENT.comparison.title}
          subtitle={CONTENT.comparison.subtitle}
          align="center"
        />
        <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-2xl mt-12 not-prose bg-white">
          <table className="w-full text-left">
            <thead className="bg-[#092e20] text-white">
              <tr>
                <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                  {CONTENT.comparison.headers[0]}
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                  {CONTENT.comparison.headers[1]}
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-wider text-[#00ED64]">
                  {CONTENT.comparison.headers[2]}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {CONTENT.comparison.rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6 font-bold text-gray-900">{row.feature}</td>
                  <td className="p-6 text-gray-600">{row.node}</td>
                  <td className="p-6 text-[#00684A] font-bold bg-[#E8F5E9]/50">{row.python}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-32">
        <AnimateOnScroll>
          <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-[#092e20] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00684A] rounded-full blur-[100px] opacity-30 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-20"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(0,237,100,0.1)] group-hover:scale-110 transition-transform duration-500">
                <Lock size={40} className="text-[#00ED64]" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                {CONTENT.cta.title}
              </h2>
              <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                {CONTENT.cta.text}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-xl shadow-[#00ED64]/20 !bg-[#00ED64] border-none text-[#092e20] font-black hover:!bg-white hover:text-[#00684A] px-10 py-4"
                  onClick={() => (window.location.href = '/web-development/custom-app')}
                >
                  {CONTENT.cta.primaryBtn}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white px-10 py-4"
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

export default PythonArticle;
