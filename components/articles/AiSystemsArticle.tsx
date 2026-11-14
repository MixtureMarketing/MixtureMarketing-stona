import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import ArticleShell from './ArticleShell';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import {
  AiCompare,
  AiProcessTimeline,
  AiStackDiagram,
  AiStatCards,
} from './visuals/AiSystemsVisuals';
import StandardFaq from '../common/StandardFaq';
import BaseCta from '../common/BaseCta';
import {
  AI_ARTICLE_CONTENT as CONTENT,
  AI_ARTICLE_ID,
  AI_ARTICLE_PUBLISHED,
  AI_ARTICLE_SLUG,
} from '../../data/content/articles/ai-systems';

const S = CONTENT.sections;

/** Sekcja tekstowa (nagłówek, akapity, punkty) + opcjonalna infografika pod tekstem. Tekst bez zmian. */
const ArticleSection = ({
  section,
  children,
}: {
  section: (typeof CONTENT.sections)[number];
  children?: React.ReactNode;
}) => (
  <div className="my-16">
    <SectionHeader title={section.title} align="left" />
    {section.paragraphs.map((p) => (
      <p key={p} dangerouslySetInnerHTML={{ __html: p }} />
    ))}
    {'bullets' in section && section.bullets && (
      <ul>
        {section.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    )}
    {children}
  </div>
);

/**
 * Artykuł nr 1 pod kierunek „AI i systemy” (MIX-1280, plan SEO A34).
 * UKRYTY do akceptacji Jakuba: `noindex`, trasa tylko w `prerenderOnlyRoutes` (poza sitemapą),
 * brak w rejestrze Bazy wiedzy (lista, „Powiązane”, menu). Publikacja: docs/tresci/MIX-1280.md.
 * FAQPage JSON-LD emituje wyłącznie StandardFaq; Article JSON-LD emituje ArticleShell.
 */
const AiSystemsArticle = () => (
  <ArticleShell
    id={AI_ARTICLE_ID}
    title={CONTENT.header.title}
    seoTitle={CONTENT.header.seoTitle}
    description={CONTENT.header.subtitle}
    category="tech"
    categoryLabel="AI i systemy"
    image="/assets/images/backend.png"
    icon={Cpu}
    accentColor="#3B82F6"
    slug={AI_ARTICLE_SLUG}
    publishedDate={AI_ARTICLE_PUBLISHED}
    noindex
  >
    <AnimateOnScroll>
      <p className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl">
        {CONTENT.lead.highlight}
      </p>
      <p>{CONTENT.lead.text}</p>
    </AnimateOnScroll>

    <AnimateOnScroll>
      <ArticleSection section={S[0]}>
        <AiStackDiagram />
      </ArticleSection>
    </AnimateOnScroll>

    <AnimateOnScroll>
      <ArticleSection section={S[1]} />
    </AnimateOnScroll>

    <AnimateOnScroll>
      <ArticleSection section={S[2]} />
    </AnimateOnScroll>

    <AnimateOnScroll>
      <ArticleSection section={S[3]}>
        <AiCompare />
      </ArticleSection>
    </AnimateOnScroll>

    <AnimateOnScroll>
      <ArticleSection section={S[4]} />
    </AnimateOnScroll>

    <AnimateOnScroll>
      <ArticleSection section={S[5]} />
    </AnimateOnScroll>

    <AnimateOnScroll>
      <ArticleSection section={S[6]}>
        <AiStatCards />
      </ArticleSection>
    </AnimateOnScroll>

    <AnimateOnScroll>
      <ArticleSection section={S[7]}>
        <AiProcessTimeline />
      </ArticleSection>
    </AnimateOnScroll>

    <AnimateOnScroll>
      <ArticleSection section={S[8]} />
    </AnimateOnScroll>

    <AnimateOnScroll>
      <ArticleSection section={S[9]} />
    </AnimateOnScroll>

    <AnimateOnScroll>
      <div className="my-16">
        <SectionHeader title={CONTENT.faq.title} align="left" />
        <div className="not-prose">
          <StandardFaq items={CONTENT.faq.items} title="" />
        </div>
      </div>
    </AnimateOnScroll>

    <AnimateOnScroll>
      <nav aria-label="Zobacz także" className="my-16 not-prose">
        <ul className="flex flex-wrap gap-4">
          {[CONTENT.cta.service, CONTENT.cta.offer, CONTENT.cta.quote].map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="inline-block rounded-full border border-gray-200 px-5 py-2 font-semibold text-dark hover:border-primary hover:text-secondary transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </AnimateOnScroll>

    <AnimateOnScroll>
      <BaseCta
        icon={Cpu}
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.quote.label}
        buttonLink={CONTENT.cta.quote.to}
        secondaryButtonText={CONTENT.cta.service.label}
        secondaryButtonLink={CONTENT.cta.service.to}
      />
    </AnimateOnScroll>
  </ArticleShell>
);

export default AiSystemsArticle;
