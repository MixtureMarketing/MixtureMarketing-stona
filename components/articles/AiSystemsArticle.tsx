import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import ArticleShell from './ArticleShell';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import StandardFaq from '../common/StandardFaq';
import BaseCta from '../common/BaseCta';
import {
  AI_ARTICLE_CONTENT as CONTENT,
  AI_ARTICLE_ID,
  AI_ARTICLE_PUBLISHED,
  AI_ARTICLE_SLUG,
} from '../../data/content/articles/ai-systems';

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

    {CONTENT.sections.map((section) => (
      <div key={section.title} className="my-16">
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
      </div>
    ))}

    <div className="my-16">
      <SectionHeader title={CONTENT.faq.title} align="left" />
      <div className="not-prose">
        <StandardFaq items={CONTENT.faq.items} title="" />
      </div>
    </div>

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

    <BaseCta
      icon={Cpu}
      title={CONTENT.cta.title}
      description={CONTENT.cta.description}
      buttonText={CONTENT.cta.quote.label}
      buttonLink={CONTENT.cta.quote.to}
      secondaryButtonText={CONTENT.cta.service.label}
      secondaryButtonLink={CONTENT.cta.service.to}
    />
  </ArticleShell>
);

export default AiSystemsArticle;
