// Regresja (E2E prod 2026-10-25): „Zamów Audyt Wydajności” w dwóch artykułach (Core Web Vitals,
// formaty obrazów) nie robił nic — BaseCta dostawał tekst przycisku bez onClick i buttonLink.
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi } from 'vitest';
import { ModalProvider, useModal } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import CoreWebVitalsArticle from '../../components/articles/CoreWebVitalsArticle';
import ImageFormatsArticle from '../../components/articles/ImageFormatsArticle';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));

const ModalProbe = () => {
  const { isModalOpen, modalType } = useModal();
  return <output data-testid="modal-state">{isModalOpen ? `open:${modalType}` : 'closed'}</output>;
};

const renderArticle = (Article: React.FC) =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <NotificationProvider>
          <ModalProvider>
            <Article />
            <ModalProbe />
          </ModalProvider>
        </NotificationProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('CTA artykułów otwiera formularz kontaktowy', () => {
  it.each([
    ['Core Web Vitals', CoreWebVitalsArticle],
    ['formaty obrazów WebP/AVIF', ImageFormatsArticle],
  ])('%s — „Zamów Audyt Wydajności”', (_name, Article) => {
    renderArticle(Article as React.FC);
    expect(screen.getByTestId('modal-state')).toHaveTextContent('closed');
    fireEvent.click(screen.getByRole('button', { name: /Zamów Audyt Wydajności/i }));
    expect(screen.getByTestId('modal-state')).toHaveTextContent('open:consultation');
  });

  // Strażnik na przyszłość: każde użycie BaseCta musi mieć akcję głównego przycisku.
  it('każde <BaseCta> w components/ ma onClick albo buttonLink', () => {
    const root = path.resolve(__dirname, '../../components');
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (p.endsWith('.tsx')) files.push(p);
      }
    };
    walk(root);
    const dead: string[] = [];
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(/<BaseCta\b([\s\S]*?)\/>/g)) {
        if (!/\bonClick=|\bbuttonLink=/.test(m[1])) dead.push(path.relative(root, f));
      }
    }
    expect(dead).toEqual([]);
  });
});
