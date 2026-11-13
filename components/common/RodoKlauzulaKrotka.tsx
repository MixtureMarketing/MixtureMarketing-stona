import React from 'react';
import { RODO_KLAUZULA_CONTENT as CONTENT } from '../../data/content';
import { isRodoKlauzulaEnabled } from '../../config/flags';

interface RodoKlauzulaKrotkaProps {
  variant: 'contact' | 'calculator' | 'abonament';
  /** 'dark' dla kalkulatora (ciemne tło), 'light' dla formularza kontaktowego. */
  tone?: 'dark' | 'light';
}

/** Krótka klauzula RODO (P1) pod formularzem. Przy wyłączonej fladze nie renderuje nic. */
const RodoKlauzulaKrotka: React.FC<RodoKlauzulaKrotkaProps> = ({ variant, tone = 'light' }) => {
  if (!isRodoKlauzulaEnabled()) return null;
  const light = tone === 'light';
  return (
    <p
      data-testid="rodo-klauzula-krotka"
      className={`text-[11px] leading-relaxed ${light ? 'text-gray-700' : 'text-gray-400'}`}
    >
      {CONTENT.short[variant]}
      <a
        href={CONTENT.linkHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`font-bold hover:underline ${light ? 'text-secondary' : 'text-primary'}`}
      >
        {CONTENT.linkLabel}
      </a>
      .
    </p>
  );
};

export default RodoKlauzulaKrotka;
