// Podgląd konfiguracji (MIX-1790, Z6 z MIX-1377; spec MIX-1320 U4, decyzja P5 = A): szkic typu
// strony (z odpowiedzi `project_goal`) i lista „Twój zakres" (nazwy i opisy obszarów dla klienta
// z odpowiedzi podglądu, kontrakt v2). Stoi POD przyciskami Wstecz/Dalej (CalculatorForm), więc
// jest poniżej pierwszego ekranu, a pasek widełek (sticky przesuwa się tylko w górę) go nie zasłania.
// Tekst z API idzie do Reacta jako tekst (nigdy jako HTML). Nic do pokazania = brak elementu.
import React, { useRef } from 'react';
import { SiteSketch, sketchFor } from './configSketches';
import { useHideCookieOver } from './useHideCookieOver';
import type { ScopeItem } from '../../../services/pricePreviewService';

interface ConfigPreviewProps {
  /** Odpowiedź na `project_goal` (dowolna wartość; szkic tylko dla typów z listy). */
  goal: unknown;
  /** Lista z podglądu (już po parseScope); brak albo pusta = lista ukryta. */
  scope?: readonly ScopeItem[];
}

const ConfigPreview: React.FC<ConfigPreviewProps> = ({ goal, scope }) => {
  const sketch = sketchFor(goal);
  const items = scope ?? [];
  const boxRef = useRef<HTMLElement>(null);
  const shown = !(!sketch && items.length === 0);
  useHideCookieOver(boxRef, shown, 'configPreviewCookie');
  if (!shown) return null;

  return (
    <section
      ref={boxRef}
      data-testid="config-preview"
      aria-label="Podgląd Twojego projektu"
      className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row md:p-5"
    >
      {sketch && (
        <figure data-testid="config-sketch" className="w-36 shrink-0 text-primary">
          <SiteSketch def={sketch} />
          <figcaption className="mt-2 text-xs text-gray-400">{sketch.label}</figcaption>
        </figure>
      )}
      {items.length > 0 && (
        <div data-testid="config-scope" className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary/80">
            Twój zakres
          </h3>
          <ul className="mt-2 space-y-2">
            {items.map((s, i) => (
              <li key={`${i}-${s.client_name}`} className="break-words">
                <p className="text-sm font-semibold text-white">{s.client_name}</p>
                {s.client_description && (
                  <p className="text-xs text-gray-400">{s.client_description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ConfigPreview;
