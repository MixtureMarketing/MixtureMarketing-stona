import React from 'react';
import Container from '@/components/common/Container';
import { MAX_TESTIMONIALS, safeReviewUrl } from '@/utils/testimonials';

/** Pozycja do wyświetlenia: logo już zamienione na adres obrazu (patrz Testimonials.tsx). */
export interface TestimonialViewItem {
  id: string;
  companyName: string;
  industry: string;
  personFirstName: string;
  quote: string;
  logoUrl?: string;
  googleReviewUrl?: string;
}

interface TestimonialsViewProps {
  items: TestimonialViewItem[];
}

/**
 * Opinie klientów (MIX-1326): imię, firma, branża, cytat, opcjonalnie logo i link do oryginalnej
 * opinii w Google. Celowo BEZ danych strukturalnych o ocenach własnej firmy (zasada Google dla
 * opinii „self-serving”); widoczna treść to jedyny nośnik. Pusta lista = nic się nie renderuje.
 */
const TestimonialsView: React.FC<TestimonialsViewProps> = ({ items }) => {
  const shown = items.slice(0, MAX_TESTIMONIALS);
  if (shown.length === 0) return null;

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="border-t border-gray-100 bg-white py-20 md:py-24"
    >
      <Container>
        <h2
          id="testimonials-heading"
          className="mb-10 text-3xl font-extrabold tracking-tight text-dark md:text-4xl"
        >
          Opinie klientów
        </h2>
        <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => {
            const reviewUrl = safeReviewUrl(t.googleReviewUrl);
            return (
              <li key={t.id}>
                <figure className="m-0 flex h-full flex-col gap-5 rounded-3xl border border-gray-100 bg-gray-50 p-6">
                  <blockquote className="m-0 flex-1 text-lg leading-relaxed text-dark">
                    <p className="m-0">„{t.quote}”</p>
                  </blockquote>
                  <figcaption className="flex items-start gap-4">
                    {t.logoUrl && (
                      <img
                        src={t.logoUrl}
                        alt={`Logo firmy ${t.companyName}`}
                        width={56}
                        height={56}
                        loading="lazy"
                        decoding="async"
                        className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain"
                      />
                    )}
                    <span className="flex flex-col gap-1 text-sm text-gray-700">
                      <span className="font-bold text-dark">
                        {t.personFirstName}, {t.companyName}
                      </span>
                      <span>{t.industry}</span>
                      {reviewUrl && (
                        <a
                          href={reviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-secondary underline underline-offset-2"
                        >
                          Zobacz oryginalną opinię w Google
                          <span className="sr-only"> (otwiera się w nowej karcie)</span>
                        </a>
                      )}
                    </span>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
};

export default TestimonialsView;
