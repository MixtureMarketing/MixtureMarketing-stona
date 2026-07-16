import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import SectionWrapper from '../../common/SectionWrapper';
import { CORPORATE_WEBSITE_CONTENT as CONTENT } from '../../../data/content/services/web-development/corporate';

const CorporateCmsComparison: React.FC = () => {
  const [activeCms, setActiveCms] = useState<'wordpress' | 'headless'>('wordpress');

  return (
    <SectionWrapper variant="white">
      <div className="text-center mb-16">
        <SectionHeader title={CONTENT.cms.title} description={CONTENT.cms.description} />
        <div
          className="inline-flex bg-[#F1F5F9] p-1.5 rounded-full mt-8 border border-gray-200 shadow-inner relative"
          role="group"
          aria-label="Wybór silnika CMS"
        >
          <div
            className={`absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-sm border border-gray-200 transition-all duration-300 ease-in-out z-0`}
            style={{
              left: activeCms === 'wordpress' ? '6px' : 'calc(50% + 3px)',
              width: 'calc(50% - 9px)',
            }}
          ></div>
          <button
            onClick={() => setActiveCms('wordpress')}
            aria-pressed={activeCms === 'wordpress'}
            className={`relative z-10 px-6 md:px-8 py-2.5 rounded-full text-xs md:text-sm font-black transition-colors duration-300 flex items-center gap-2 ${activeCms === 'wordpress' ? 'text-dark' : 'text-gray-500 hover:text-dark'}`}
          >
            {CONTENT.cms.wordpress.label}
          </button>
          <button
            onClick={() => setActiveCms('headless')}
            aria-pressed={activeCms === 'headless'}
            className={`relative z-10 px-6 md:px-8 py-2.5 rounded-full text-xs md:text-sm font-black transition-colors duration-300 flex items-center gap-2 ${activeCms === 'headless' ? 'text-dark' : 'text-gray-500 hover:text-dark'}`}
          >
            {CONTENT.cms.headless.label}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-dark">
            {activeCms === 'wordpress' ? CONTENT.cms.wordpress.title : CONTENT.cms.headless.title}
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed font-medium">
            {activeCms === 'wordpress' ? CONTENT.cms.wordpress.desc : CONTENT.cms.headless.desc}
          </p>
          <ul className="space-y-3">
            {(activeCms === 'wordpress'
              ? CONTENT.cms.wordpress.features
              : CONTENT.cms.headless.features
            ).map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-700 font-bold">
                <CheckCircle2 size={18} className="text-success shrink-0" /> {feat}
              </li>
            ))}
          </ul>
        </div>
        {/* Zamiast fejkowego okna przeglądarki ze skeleton-pulsem — uczciwy
            schemat architektury, który przełącza się razem z togglem (2026-07-16). */}
        <div className="relative order-first lg:order-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 md:p-10 shadow-sm">
            <div className="text-xxs font-black uppercase tracking-[0.2em] text-gray-600 mb-6">
              {activeCms === 'wordpress' ? 'Architektura: monolit' : 'Architektura: headless + CDN'}
            </div>
            <div className="flex flex-col items-stretch gap-3" aria-hidden="true">
              {(activeCms === 'wordpress'
                ? [
                    { label: 'Przeglądarka klienta', accent: false },
                    { label: 'Serwer WWW · PHP + motyw', accent: true },
                    { label: 'Baza danych MySQL', accent: false },
                  ]
                : [
                    { label: 'Panel treści (Sanity)', accent: false },
                    { label: 'Build — statyczne strony', accent: true },
                    { label: 'CDN blisko użytkownika', accent: false },
                    { label: 'Przeglądarka klienta', accent: false },
                  ]
              ).map((node, i, arr) => (
                <React.Fragment key={node.label}>
                  <div
                    className={`px-5 py-4 rounded-xl border text-sm font-bold text-center transition-all duration-300 ${
                      node.accent
                        ? 'bg-secondary text-white border-secondary shadow-md'
                        : 'bg-white text-dark border-gray-200'
                    }`}
                  >
                    {node.label}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="self-center h-4 w-px bg-gray-300 relative">
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 border-b border-r border-gray-400 rotate-45"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mt-6">
              {activeCms === 'wordpress'
                ? 'Każde wejście na stronę odpytuje serwer i bazę — prosto i elastycznie, ale serwer trzeba utrzymywać i chronić.'
                : 'Strony budują się raz i lecą z CDN — użytkownik nie dotyka serwera z treścią, więc powierzchnia ataku i czas ładowania spadają.'}
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default CorporateCmsComparison;
