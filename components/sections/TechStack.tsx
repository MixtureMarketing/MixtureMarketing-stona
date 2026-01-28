import React, { useState } from 'react';
import {
  Database,
  Zap,
  Code2,
  Server,
  Layout,
  Lock,
  Layers,
  Globe,
  ArrowUpRight,
} from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';

const technologies = [
  {
    id: 'next',
    name: 'Next.js / React',
    category: 'Frontend',
    icon: <Code2 size={32} />,
    color: '#00D8FF', // React Blue
    desc: 'Technologia używana przez Facebooka i Netflixa.',
    benefit:
      "Twoja strona działa płynnie jak aplikacja na iPhone'a. Brak przeładowań strony = wyższa konwersja i zadowolenie użytkownika.",
  },
  {
    id: 'redis',
    name: 'Redis Cache',
    category: 'Performance',
    icon: <Zap size={32} />,
    color: '#DC382D', // Redis Red
    desc: 'Superszybka pamięć operacyjna dla Twojej strony.',
    benefit:
      'Nie każ klientowi czekać. Redis zapamiętuje najczęstsze zapytania i serwuje je w milisekundach, nawet przy ogromnym ruchu.',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    category: 'Baza Danych',
    icon: <Database size={32} />,
    color: '#336791', // Postgres Blue
    desc: 'Najbardziej zaawansowana relacyjna baza danych.',
    benefit:
      'Gwarancja 100% własności i bezpieczeństwa danych. Twoje informacje są przechowywane na dedykowanej infrastrukturze, co eliminuje ryzyko wycieków z chmur publicznych i rosnące koszty abonamentów.',
  },
  {
    id: 'headless',
    name: 'Headless WordPress',
    category: 'CMS',
    icon: <Layout size={32} />,
    color: '#21759B', // WP Blue
    desc: 'Znany panel edycji, ale bez balastu technologicznego.',
    benefit:
      'Twój zespół edytuje treści łatwo jak zawsze, ale strona frontowa jest 10x szybsza i bezpieczniejsza, bo oddzieliliśmy ją od zaplecza.',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Kod',
    icon: <ShieldCheck size={32} />,
    color: '#3178C6', // TS Blue
    desc: 'Język programowania, który pilnuje porządku.',
    benefit:
      'Eliminuje 90% błędów "wieku dziecięcego" już na etapie pisania kodu. Oznacza to stabilną stronę, która nie sypie się po aktualizacji.',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'Design',
    icon: <Layers size={32} />,
    color: '#38B2AC', // Tailwind Teal
    desc: 'System stylowania "Mobile First".',
    benefit:
      'Unikalny wygląd, a nie gotowy szablon. Strona jest lekka (ładuje tylko to, co potrzebne) i wygląda idealnie na każdym ekranie.',
  },
];

// Helper icon import needed due to custom defined icons in array
import { ShieldCheck } from 'lucide-react';

const TechStack: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="tech-stack">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#F0FDF4] rounded-full blur-3xl -translate-x-1/2"></div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          title="Technologia to Twój zysk, nie koszt."
          subtitle="Nie używamy nowinek dla zabawy. Dobieramy narzędzia tak, aby Twoja firma zarabiała więcej, szybciej i bezpieczniej."
          center
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technologies.map((tech, index) => (
            <AnimateOnScroll key={tech.id} delay={index * 100} className="h-full">
              <div
                className="group h-full relative perspective-1000"
                onMouseEnter={() => setHoveredId(tech.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className={`
                        relative h-full bg-white rounded-2xl p-8 border transition-all duration-500 ease-out shadow-sm
                        ${
                          hoveredId === tech.id
                            ? 'border-primary shadow-xl -translate-y-2'
                            : 'border-gray-100 hover:border-gray-200'
                        }
                    `}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: tech.color }}
                    >
                      {tech.icon}
                    </div>
                    <span className="text-xxs font-bold uppercase tracking-widest text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      {tech.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">
                      {tech.name}
                    </h3>
                    <p className="text-sm text-gray-700 font-medium mb-4">{tech.desc}</p>

                    {/* Benefit Box - Always visible but styled to pop on hover */}
                    <div
                      className={`
                            mt-4 pt-4 border-t transition-all duration-500
                            ${hoveredId === tech.id ? 'border-primary/30' : 'border-gray-100'}
                        `}
                    >
                      <p className="text-xs font-bold text-gray-600 uppercase mb-1">
                        Korzyść Biznesowa:
                      </p>
                      <p
                        className={`text-sm leading-relaxed transition-colors duration-300 ${hoveredId === tech.id ? 'text-dark' : 'text-gray-600'}`}
                      >
                        {tech.benefit}
                      </p>
                      {tech.id === 'next' && (
                        <a
                          href="/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych"
                          className="mt-3 inline-flex items-center gap-1 text-xxs font-bold text-[#00D8FF] hover:underline uppercase tracking-wider"
                        >
                          Dlaczego Next.js? (Analiza 2025) <ArrowUpRight size={10} />
                        </a>
                      )}
                      {tech.id === 'postgres' && (
                        <a
                          href="/baza-wiedzy/postgresql-krol-baz-danych-open-source-dla-biznesu"
                          className="mt-3 inline-flex items-center gap-1 text-xxs font-bold text-[#336791] hover:underline uppercase tracking-wider"
                        >
                          Dlaczego PostgreSQL? <ArrowUpRight size={10} />
                        </a>
                      )}
                      {tech.id === 'redis' && (
                        <a
                          href="/baza-wiedzy/redis-optymalizacja"
                          className="mt-3 inline-flex items-center gap-1 text-xxs font-bold text-[#DC382D] hover:underline uppercase tracking-wider"
                        >
                          Czytaj więcej o Redis <ArrowUpRight size={10} />
                        </a>
                      )}
                      {tech.id === 'headless' && (
                        <a
                          href="/baza-wiedzy/headless-wordpress-wydajnosc-i-bezpieczenstwo"
                          className="mt-3 inline-flex items-center gap-1 text-xxs font-bold text-[#21759B] hover:underline uppercase tracking-wider"
                        >
                          Magia Headless WP <ArrowUpRight size={10} />
                        </a>
                      )}
                      {tech.id === 'typescript' && (
                        <a
                          href="/baza-wiedzy/typescript-polisa-ubezpieczeniowa-twojego-kodu"
                          className="mt-3 inline-flex items-center gap-1 text-xxs font-bold text-[#3178C6] hover:underline uppercase tracking-wider"
                        >
                          TypeScript: Polisa dla kodu <ArrowUpRight size={10} />
                        </a>
                      )}
                      {tech.id === 'tailwind' && (
                        <a
                          href="/baza-wiedzy/tailwind-css-utility-first-przyszlosc-projektowania"
                          className="mt-3 inline-flex items-center gap-1 text-xxs font-bold text-[#38B2AC] hover:underline uppercase tracking-wider"
                        >
                          Dlaczego Tailwind? <ArrowUpRight size={10} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Decoration Line */}
                  <div
                    className={`absolute bottom-0 left-0 h-1 rounded-b-2xl transition-all duration-500 ${hoveredId === tech.id ? 'w-full' : 'w-0'}`}
                    style={{ backgroundColor: tech.color }}
                  ></div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
