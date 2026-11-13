import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';
import { SITE_CONFIG } from '../../config/site';
import { isRzeszowSectionsEnabled } from '../../config/flags';
import type { LocalRzeszowContent } from '../../data/content/services/local-rzeszow';

interface LocalRzeszowSectionProps {
  content: LocalRzeszowContent;
  onConsult: () => void;
}

/**
 * Sekcja lokalna „Rzeszów” na stronach usług (MIX-1286, plan SEO A35). Za przełącznikiem
 * VITE_MM_RZESZOW_SEKCJE (domyślnie wyłączony do akceptacji tekstu przez Jakuba). Jeden <h2>,
 * bez <h1>; linki wewnętrzne ze slashem na końcu; dane adresowe z SITE_CONFIG (adres rejestrowy).
 */
const LocalRzeszowSection: React.FC<LocalRzeszowSectionProps> = ({ content, onConsult }) => {
  if (!isRzeszowSectionsEnabled()) return null;
  const { address, phone, phoneFull } = SITE_CONFIG.contact;
  const headingId = `${content.id}-heading`;

  return (
    <section
      id={content.id}
      aria-labelledby={headingId}
      data-testid="local-rzeszow"
      className="bg-light-gray py-20 md:py-24"
    >
      <Container>
        <div className="mx-auto max-w-3xl">
          <h2
            id={headingId}
            className="flex items-start gap-3 text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl"
          >
            <MapPin size={28} className="mt-1 shrink-0 text-secondary" aria-hidden="true" />
            {content.title}
          </h2>
          {content.paragraphs.map((p) => (
            <p key={p} className="mt-5 text-lg leading-relaxed text-gray-700">
              {p}
            </p>
          ))}
          <ul className="mt-6 list-disc space-y-3 pl-6 text-[15px] leading-relaxed text-gray-700">
            {content.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] leading-relaxed text-gray-700">
            Adres rejestrowy: {address.street}, {address.postalCode} {address.city}. Telefon:{' '}
            <a
              href={`tel:${phoneFull}`}
              className="font-bold text-secondary underline underline-offset-4"
            >
              {phone}
            </a>
            .
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
            Zobacz też:{' '}
            <Link
              to={content.localLink.to}
              className="font-bold text-secondary underline underline-offset-4"
            >
              {content.localLink.label}
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button onClick={onConsult}>{content.ctaLabel}</Button>
            <Link
              to="/contact/"
              className="inline-flex min-h-11 items-center font-bold text-secondary underline underline-offset-4"
            >
              Przejdź do strony kontaktu
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default LocalRzeszowSection;
