import React from 'react';
import { Helmet } from 'react-helmet-async';
import Accordion from './Accordion';

interface FaqItem {
  q: string;
  a: string;
}

interface StandardFaqProps {
  items: FaqItem[];
  title?: string;
  className?: string;
}

/**
 * Standardized FAQ component that handles both UI (Accordions)
 * and SEO (JSON-LD FAQPage schema).
 */
const StandardFaq: React.FC<StandardFaqProps> = ({
  items,
  title = 'Najczęstsze pytania',
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  // Generate FAQPage Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {title && <h2 className="sr-only">{title}</h2>}

      {items.map((item, index) => (
        <Accordion key={index} title={item.q}>
          <div dangerouslySetInnerHTML={{ __html: item.a }} />
        </Accordion>
      ))}
    </div>
  );
};

export default StandardFaq;
