// MIX-1326 kryterium 4: sekcja opinii przy danych testowych jest dostępna (nagłówek, lista,
// alt, linki z rel="noopener" i widocznym tekstem). Kontrole w stylu axe, bez zależności od axe-core.
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TestimonialsView from '../../components/sections/testimonials/TestimonialsView';
import { REVIEW_URL, viewItems } from '../fixtures/testimonials';

const renderView = (items = viewItems) => render(<TestimonialsView items={items} />);

describe('TestimonialsView — treść i semantyka', () => {
  it('sekcja ma nazwę z nagłówka h2 i jest regionem', () => {
    const { container } = renderView();
    const section = container.querySelector('section') as HTMLElement;
    const heading = container.querySelector('h2') as HTMLElement;
    expect(heading.textContent).toBe('Opinie klientów');
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(container.querySelectorAll('h1, h3, h4')).toHaveLength(0);
  });

  it('opinie to lista: <ul> z jednym <li> na pozycję, w każdym figure + blockquote + figcaption', () => {
    const { container } = renderView();
    const lis = container.querySelectorAll('ul > li');
    expect(lis).toHaveLength(3);
    for (const li of Array.from(lis)) {
      const figure = li.querySelector('figure') as HTMLElement;
      expect(Array.from(figure.children).map((c) => c.tagName)).toEqual([
        'BLOCKQUOTE',
        'FIGCAPTION',
      ]);
      expect(figure.querySelector('blockquote p')).not.toBeNull();
    }
  });

  it('każda pozycja pokazuje imię, nazwę firmy, branżę i cytat', () => {
    const { container } = renderView();
    const first = container.querySelector('li') as HTMLElement;
    expect(first.textContent).toContain('Anna, Firma Testowa Alfa');
    expect(first.textContent).toContain('Branża testowa: handel');
    expect(first.textContent).toContain('Fikcyjna opinia numer jeden');
  });

  it('logo ma niepusty alt z nazwą firmy i wymiary; pozycja bez logo nie ma <img>', () => {
    const { container } = renderView();
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(1);
    expect(imgs[0].getAttribute('alt')).toBe('Logo firmy Firma Testowa Alfa');
    expect(imgs[0].getAttribute('width')).toBe('56');
    expect(imgs[0].getAttribute('height')).toBe('56');
  });

  it('link do oryginalnej opinii: https, rel noopener, widoczny tekst, tylko gdy jest adres', () => {
    const { container } = renderView();
    const links = Array.from(container.querySelectorAll('a'));
    expect(links).toHaveLength(2);
    for (const a of links) {
      expect(a.getAttribute('href')).toBe(REVIEW_URL);
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toMatch(/\bnoopener\b/);
      expect(a.textContent?.trim()).toContain('Zobacz oryginalną opinię w Google');
    }
    const second = container.querySelectorAll('li')[1];
    expect(second.querySelector('a')).toBeNull();
  });

  it('identyfikatory w sekcji są unikalne, brak pustych linków i przycisków', () => {
    const { container } = renderView();
    const ids = Array.from(container.querySelectorAll('[id]')).map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of Array.from(container.querySelectorAll('a, button'))) {
      expect(a.textContent?.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('TestimonialsView — nogi negatywne', () => {
  it('0 pozycji: nic w DOM', () => {
    const { container } = renderView([]);
    expect(container.innerHTML).toBe('');
  });

  it('więcej niż 5 pozycji: pokazuje najwyżej 5', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ ...viewItems[1], id: `x${i}` }));
    const { container } = renderView(many);
    expect(container.querySelectorAll('li')).toHaveLength(5);
  });

  it.each([
    ['javascript:', 'javascript:alert(1)'],
    ['http:', 'http://example.com/opinia'],
    ['data:', 'data:text/html,<b>x</b>'],
    ['bez schematu', 'example.com/opinia'],
    ['pusty', ''],
  ])('niebezpieczny adres (%s) nie daje linku', (_n, href) => {
    const items = [{ ...viewItems[0], googleReviewUrl: href }];
    const { container } = renderView(items);
    expect(container.querySelector('a')).toBeNull();
    expect(container.innerHTML).not.toContain('javascript:');
  });

  it('cytat z HTML jest tekstem, nie znacznikami', () => {
    const items = [{ ...viewItems[1], quote: '<img src=x onerror=alert(1)>' }];
    const { container } = renderView(items);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('blockquote')?.textContent).toContain('<img src=x');
  });
});
