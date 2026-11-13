import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import Container from '../common/Container';
import { isAiSectionEnabled } from '../../config/flags';
import {
  AI_SECTION_CONTENT as CONTENT,
  AI_SECTION_PATH,
} from '../../data/content/services/web-development/ai-section';

/**
 * Sekcja „Aplikacje i systemy z elementami AI” (MIX-1276, plan SEO A20) na stronie głównej.
 * Przełącznik VITE_MM_AI_SECTION: wyłączony = null (zero znaczników w HTML i prerenderze).
 * Sekcja leży pod hero, jest czystym tekstem (bez obrazów, bez stanu, bez pobrań), więc nie bierze
 * udziału w LCP i nie przesuwa układu (CLS 0).
 */
const AiSystemsTeaser: React.FC = () => {
  if (!isAiSectionEnabled()) return null;
  return (
    <section
      id="ai-systems"
      aria-labelledby="ai-systems-heading"
      className="relative z-10 bg-gray-50 py-20 md:py-28"
    >
      <Container>
        <div className="max-w-3xl">
          <h2
            id="ai-systems-heading"
            className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl"
          >
            {CONTENT.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">{CONTENT.intro}</p>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-3">
          {CONTENT.bullets.map((b) => (
            <li key={b.title} className="flex items-start gap-3">
              <Check size={20} className="mt-1 shrink-0 text-secondary" aria-hidden="true" />
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-dark">{b.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-gray-700">{b.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link
          to={AI_SECTION_PATH}
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 bg-white px-6 py-3 font-bold text-dark transition-colors hover:border-secondary hover:bg-blue-50 hover:text-secondary"
        >
          {CONTENT.cta}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </Container>
    </section>
  );
};

export default AiSystemsTeaser;
