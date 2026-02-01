import React from 'react';
import { Cpu, ArrowUpRight } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../../data/content';

const WebAppTechStack: React.FC = () => {
  const techLinks: Record<string, string> = {
    PostgreSQL: '/baza-wiedzy/postgresql-krol-baz-danych-open-source-dla-biznesu',
    Redis: '/baza-wiedzy/redis-optymalizacja',
    MongoDB: '/baza-wiedzy/mongodb-nosql-przyszlosc-big-data-i-dynamicznych-aplikacji',
    ElasticSearch: '/baza-wiedzy/elasticsearch-inteligentna-wyszukiwarka-ecommerce',
    'Next.js': '/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych',
    'Tailwind CSS': '/baza-wiedzy/tailwind-css-utility-first-przyszlosc-projektowania',
    TypeScript: '/baza-wiedzy/typescript-polisa-ubezpieczeniowa-twojego-kodu',
    'Python (Django)': '/baza-wiedzy/python-django-bezpieczenstwo-fintech-mvp',
    'React.js': '/baza-wiedzy/react-js-najbezpieczniejsza-technologia-dla-biznesu',
    'Vue.js': '/baza-wiedzy/vue-js-harmonijny-kompromis-react-angular',
    Laravel: '/baza-wiedzy/laravel-php-framework-szybkie-wdrozenie',
    Go: '/baza-wiedzy/go-golang-jezyk-chmury',
    'Node.js': '/baza-wiedzy/nodejs-jeden-jezyk',
    Docker: '/baza-wiedzy/docker-konteneryzacja-przewodnik',
    'CI/CD': '/baza-wiedzy/ci-cd-automatyzacja-wdrozen',
    Kubernetes: '/baza-wiedzy/devops-fundament-nowoczesnego-biznesu',
    AWS: '/baza-wiedzy/devops-fundament-nowoczesnego-biznesu',
  };

  return (
    <SectionWrapper variant="dark" overflow={true}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div className="max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xxs font-black uppercase tracking-[0.2em] mb-6">
            <Cpu size={12} /> {CONTENT.techStack.badge}
          </div>
          <h3 className="text-white font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter mb-6 uppercase">
            {CONTENT.techStack.title.line1}
            <br />
            {CONTENT.techStack.title.line2} <span className="text-primary">ufamy.</span>
          </h3>
          <p className="text-gray-200 text-lg leading-relaxed max-w-xl">
            {CONTENT.techStack.description}
          </p>
        </div>
        <div className="hidden lg:flex gap-4">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-xxs font-black text-gray-300 uppercase tracking-widest mb-2">
              Performance
            </div>
            <div className="text-2xl font-black text-success">99.9%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CONTENT.techStack.items.map((stack, i) => (
          <AnimateOnScroll key={i} delay={i * 100} className="h-full">
            <div className="group relative h-full bg-gradient-to-b from-white/[0.07] to-transparent border border-white/10 p-8 rounded-[2.5rem] transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_50px_-20px_rgba(97,182,222,0.2)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative z-10">
                <div className="mb-8 flex items-center gap-3">
                  <span className="w-8 h-px bg-primary opacity-30"></span>
                  {stack.link ? (
                    <a
                      href={stack.link}
                      className="text-xxs font-black text-primary uppercase tracking-[0.3em] hover:underline flex items-center gap-2"
                    >
                      {stack.cat} <ArrowUpRight size={10} />
                    </a>
                  ) : (
                    <span className="text-xxs font-black text-primary uppercase tracking-[0.3em]">
                      {stack.cat}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 flex-grow">
                  {stack.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between group/item">
                      {techLinks[item] ? (
                        <a
                          href={techLinks[item]}
                          className="text-gray-300 text-sm font-bold group-hover/item:text-primary transition-colors flex items-center gap-1.5"
                        >
                          {item}
                          <ArrowUpRight
                            size={10}
                            className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                          />
                        </a>
                      ) : (
                        <span className="text-gray-300 text-sm font-bold group-hover/item:text-white transition-colors">
                          {item}
                        </span>
                      )}
                      <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-20 group-hover/item:opacity-100 transition-all shadow-[0_0_10px_#61B6DE]"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-6 -right-4 text-7xl font-black text-white/[0.02] select-none pointer-events-none group-hover:text-white/[0.04] transition-colors">
                {stack.cat.charAt(0)}
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default WebAppTechStack;
