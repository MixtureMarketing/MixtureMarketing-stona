import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import VsWix from '../../components/pages/abonament/VsWix';
import VsOrange from '../../components/pages/abonament/VsOrange';

// Regresja: FAQPage w JSON-LD bez widocznych pytań na stronie (wytyczne Google:
// dane strukturalne muszą odpowiadać treści widocznej dla użytkownika).
const faqQuestionsFromHead = (): string[] =>
  Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'))
    .flatMap((s) => {
      const parsed = JSON.parse(s.textContent || 'null');
      return Array.isArray(parsed) ? parsed : [parsed];
    })
    .filter((d) => d && d['@type'] === 'FAQPage')
    .flatMap((d) => d.mainEntity.map((q: { name: string }) => q.name));

describe.each([
  ['/abonament/vs-wix/', VsWix],
  ['/abonament/vs-orange-klikai/', VsOrange],
])('%s — FAQ w schemie = FAQ na stronie', (url, Page) => {
  it('każde pytanie z FAQPage jest widoczne w treści', async () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[url]}>
          <Page />
        </MemoryRouter>
      </HelmetProvider>,
    );
    let questions: string[] = [];
    await waitFor(() => {
      questions = faqQuestionsFromHead();
      expect(questions.length).toBeGreaterThan(0);
    });
    const summaries = Array.from(container.querySelectorAll('details summary')).map(
      (el) => el.textContent || '',
    );
    for (const q of questions) {
      expect(summaries.some((s) => s.includes(q))).toBe(true);
    }
  });
});
