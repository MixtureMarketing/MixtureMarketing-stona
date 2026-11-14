import React from 'react';
import {
  Banknote,
  CalendarClock,
  Check,
  Clock,
  FileText,
  MessageSquare,
  Minus,
  Rocket,
  Users,
} from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import PlotterTimeline from '../../common/PlotterTimeline';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import {
  AI_ARTICLE_CONTENT as CONTENT,
  AI_ARTICLE_VISUALS as VISUALS,
} from '../../../data/content/articles/ai-systems';

/**
 * Infografiki artykułu „aplikacje dedykowane z AI” (MIX-1280 b). Tylko fakty z tekstu artykułu
 * (data/content/articles/ai-systems.ts). Ruch: wyłącznie opacity/transform (zero CLS);
 * `useSectionProgress` nie ustawia `--p` przy prefers-reduced-motion i w prerenderze, a wtedy
 * każdy element stoi w stanie końcowym (var(--p, 1)). Każda infografika ma `data-infographic`
 * i `aria-label`; każdy SVG ma role="img" i polską etykietę.
 */

/** Okno pojawiania elementu na wspólnym `--p` kontenera (jak w PlotterTimeline). */
const stage = (start: number, span = 0.2): React.CSSProperties => ({
  opacity: `calc((var(--p, 1) - ${start.toFixed(2)}) / ${span})`,
});

/** Pierwsze zdanie punktu (jego „nagłówek”) i ostatnie zdanie (konkret), bez zmiany słów. */
const splitBullet = (bullet: string) => {
  const sentences = bullet.split(/(?<=\.)\s+/);
  return { head: sentences[0].replace(/\.$/, ''), last: sentences[sentences.length - 1] };
};

const processSteps = () => {
  const section = CONTENT.sections.find((s) => s.title === VISUALS.process.sectionTitle);
  const bullets = section && 'bullets' in section && section.bullets ? section.bullets : [];
  return bullets.map((b) => {
    const { head, last } = splitBullet(b);
    return { title: head, desc: last === `${head}.` ? '' : last };
  });
};

const STEP_ICONS = [MessageSquare, Users, FileText, Rocket];
const STAT_ICONS = [Banknote, Banknote, CalendarClock, Clock];

/** 1. Przebieg projektu: oś czasu, linie rysują się z przewijaniem. */
export const AiProcessTimeline: React.FC = () => {
  const ref = useSectionProgress<HTMLDivElement>(0.85);
  const steps = processSteps();
  return (
    <figure
      data-infographic="proces"
      role="group"
      aria-label={VISUALS.process.label}
      className="not-prose my-10 rounded-3xl border border-gray-100 bg-light-gray p-6 md:p-10"
    >
      <div ref={ref}>
        <PlotterTimeline
          items={steps.map((s, i) => ({ kicker: `Krok ${i + 1}`, title: s.title, desc: s.desc }))}
          icons={STEP_ICONS}
        />
      </div>
    </figure>
  );
};

/** 2. Koszt i czas: karty z liczbami z tekstu. */
export const AiStatCards: React.FC = () => (
  <figure
    data-infographic="liczby"
    role="group"
    aria-label={VISUALS.stats.label}
    className="not-prose my-10"
  >
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {VISUALS.stats.items.map((item, i) => {
        const Icon = STAT_ICONS[i];
        return (
          <li key={item.value}>
            <AnimateOnScroll delay={i * 120} className="h-full">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <Icon size={20} aria-hidden="true" className="text-secondary" />
                <p className="mt-4 text-2xl font-black leading-tight tracking-tight text-secondary">
                  {item.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-600">{item.caption}</p>
              </div>
            </AnimateOnScroll>
          </li>
        );
      })}
    </ul>
  </figure>
);

/** 3. Dwie kolumny: kiedy się opłaca, a kiedy nie. */
export const AiCompare: React.FC = () => (
  <figure
    data-infographic="porownanie"
    role="group"
    aria-label={VISUALS.compare.label}
    className="not-prose my-10 grid gap-4 md:grid-cols-2"
  >
    <AnimateOnScroll className="h-full">
      <div className="h-full rounded-2xl border-2 border-primary/40 bg-blue-50/40 p-6">
        <p className="text-lg font-extrabold text-dark">{VISUALS.compare.yes.title}</p>
        <ul className="mt-4 space-y-3">
          {VISUALS.compare.yes.items.map((t) => (
            <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-gray-700">
              <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-secondary" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </AnimateOnScroll>
    <AnimateOnScroll delay={150} className="h-full">
      <div className="h-full rounded-2xl border-2 border-gray-200 bg-white p-6">
        <p className="text-lg font-extrabold text-dark">{VISUALS.compare.no.title}</p>
        <ul className="mt-4 space-y-3">
          {VISUALS.compare.no.items.map((t) => (
            <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-gray-700">
              <Minus size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-gray-500" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </AnimateOnScroll>
  </figure>
);

/** 4. Schemat SVG: z czego składa się aplikacja, funkcja AI jako najmniejszy moduł. */
export const AiStackDiagram: React.FC = () => {
  const ref = useSectionProgress<HTMLDivElement>(0.9);
  const S = VISUALS.stack;
  const words = S.aiNote.split(' ');
  const noteLines = [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
  return (
    <figure
      data-infographic="schemat"
      role="group"
      aria-label={S.label}
      className="not-prose my-10"
    >
      <div ref={ref} className="mx-auto max-w-md">
        <svg
          viewBox="0 0 360 360"
          role="img"
          aria-label={S.label}
          className="h-auto w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="10"
            width="340"
            height="340"
            rx="22"
            fill="#f9fafb"
            stroke="#e5e7eb"
            strokeWidth="2"
            style={stage(0, 0.15)}
          />
          <text
            x="28"
            y="40"
            fontSize="15"
            fontWeight="800"
            fill="#111827"
            style={stage(0.02, 0.15)}
          >
            {S.frame}
          </text>
          {S.modules.map((m, i) => {
            const x = 28 + (i % 2) * 156;
            const y = 58 + Math.floor(i / 2) * 62;
            return (
              <g key={m} style={stage(0.1 + i * 0.08)}>
                <rect x={x} y={y} width="148" height="50" rx="12" fill="#3f3d91" />
                <text
                  x={x + 74}
                  y={y + 30}
                  fontSize="14"
                  fontWeight="700"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  {m}
                </text>
              </g>
            );
          })}
          <g style={stage(0.6)}>
            <line x1="28" y1="256" x2="332" y2="256" stroke="#d1d5db" strokeDasharray="4 5" />
            <text x="28" y="248" fontSize="12" fontWeight="700" fill="#6b7280">
              {S.engineering}
            </text>
          </g>
          <g style={stage(0.72)}>
            <rect x="28" y="276" width="104" height="50" rx="12" fill="#e1306c" />
            <text x="80" y="306" fontSize="14" fontWeight="700" fill="#ffffff" textAnchor="middle">
              {S.ai}
            </text>
            <text x="146" y="298" fontSize="13" fontWeight="600" fill="#4b5563">
              <tspan x="146">{noteLines[0]}</tspan>
              <tspan x="146" dy="17">
                {noteLines[1]}
              </tspan>
            </text>
          </g>
        </svg>
      </div>
    </figure>
  );
};
