import React from 'react';
import { BookOpen, FolderGit2, KeyRound, Unlock, LucideIcon } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../../data/content';

/**
 * „Kod jest Twój. Od pierwszej linijki." — trzy klauzule własności jako TREŚĆ
 * (bez atrapy umowy „CONFIDENTIAL" z mono-checklistą i stemplem — przebudowa
 * 2026-07-16) + granatowa pieczęć w brzmieniu z huba, rozszerzona o
 * dokumentację (PRODUCT.md: dokumentacja tylko przy systemach dedykowanych).
 */
const ICONS: LucideIcon[] = [Unlock, BookOpen, FolderGit2];

const WebAppTrust: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  return (
    <section ref={sectionRef} className="relative bg-light-gray py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {CONTENT.trust.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">{CONTENT.trust.description}</p>
        </div>

        <div
          className="mt-12 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
        >
          <ul className="divide-y divide-gray-100">
            {CONTENT.trust.items.map((item, i) => {
              const Icon = ICONS[i] ?? Unlock;
              return (
                <li key={item.title} className="flex items-start gap-4 px-6 py-7 md:px-9">
                  <Icon size={22} className="mt-1 shrink-0 text-secondary" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight text-dark">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 max-w-3xl text-[15px] leading-relaxed text-gray-700">
                      {item.desc}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="flex items-start gap-3 bg-dark px-6 py-5 text-[15px] font-bold text-white md:px-9">
            <KeyRound size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            {CONTENT.trust.seal}
          </p>
        </div>
      </Container>
    </section>
  );
};

export default WebAppTrust;
