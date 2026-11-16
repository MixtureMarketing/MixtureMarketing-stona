// MIX-1816 (Z13): oś czasu dla nowego klienta na końcu wyceny (tydzień 1, miesiąc 1, 90 dni).
// Za przełącznikiem VITE_MM_NEW_CLIENT_TIMELINE (montuje ją PublicCalculator tylko po włączeniu).
// Semantyka: <section> z <h2>, lista numerowana <ol>, w każdym okresie <h3> i lista <ul> punktów.
// Układ jednokolumnowy bez klas kierunkowych (lewo/prawo) i bez ruchu (żadnych animacji i przejść),
// więc nie ma co wyciszać przy prefers-reduced-motion; długie słowa łamie `break-words`.
// Przycisk ciasteczek (`fixed`) chowa się na czas nałożenia (jak w MIX-1799), reguła w index.css.
import React, { useRef } from 'react';
import {
  NEW_CLIENT_TIMELINE,
  NEW_CLIENT_TIMELINE_HEADING,
  NEW_CLIENT_TIMELINE_INTRO,
  type TimelinePeriod,
} from './newClientTimeline.content';
import { useHideCookieOver } from './useHideCookieOver';

/** Okresy z co najmniej jednym niepustym punktem; puste i same spacje odpadają (nic nie udajemy). */
export function usableTimeline(periods: TimelinePeriod[]): TimelinePeriod[] {
  return periods
    .map((p) => ({
      period: typeof p.period === 'string' ? p.period.trim() : '',
      items: (Array.isArray(p.items) ? p.items : [])
        .filter((i): i is string => typeof i === 'string')
        .map((i) => i.trim())
        .filter((i) => i !== '')
        .slice(0, 3),
    }))
    .filter((p) => p.period !== '' && p.items.length > 0);
}

const NewClientTimeline: React.FC<{ periods?: TimelinePeriod[] }> = ({
  periods = NEW_CLIENT_TIMELINE,
}) => {
  const boxRef = useRef<HTMLElement>(null);
  const rows = usableTimeline(periods);
  useHideCookieOver(boxRef, rows.length > 0, 'timelineCookie');
  if (rows.length === 0) return null;
  return (
    <section
      ref={boxRef}
      data-testid="new-client-timeline"
      aria-labelledby="new-client-timeline-title"
      className="mx-auto max-w-xl pt-8 text-start break-words"
    >
      <h2 id="new-client-timeline-title" className="text-xl font-bold text-white">
        {NEW_CLIENT_TIMELINE_HEADING}
      </h2>
      <p className="mt-2 text-sm text-gray-300">{NEW_CLIENT_TIMELINE_INTRO}</p>
      <ol className="mt-5 space-y-5 border-s border-white/15 ps-5">
        {rows.map((p) => (
          <li key={p.period}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary/80">
              {p.period}
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 ps-5 text-gray-300 marker:text-primary/60">
              {p.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default NewClientTimeline;
