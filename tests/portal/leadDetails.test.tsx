import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { leadDetailsEntries } from '../../components/portal/admin/leadDetails';
import LeadDetailsModal from '../../components/portal/admin/LeadDetailsModal';
import type { Lead } from '../../components/portal/types';

describe('leadDetailsEntries', () => {
  it('niepoprawny JSON (rekord z ery PHP) → surowy tekst zamiast wyjątku', () => {
    expect(leadDetailsEntries('{oops')).toEqual([
      { key: '_raw', label: 'Dane (nieczytelny format)', value: '{oops' },
    ]);
  });

  it('kalkulator: odpowiedzi spłaszczone, widełki jako „min – max”', () => {
    const entries = leadDetailsEntries(
      JSON.stringify({
        answers: { project_goal: 'sklep', features: ['blog', 'płatności'], pages: 12 },
        priceRange: { min: 8000, max: 12000 },
      }),
    );
    const map = Object.fromEntries(entries.map((e) => [e.label, e.value]));
    expect(map['Answers › Project goal']).toBe('sklep');
    expect(map['Answers › Features']).toBe('blog, płatności');
    expect(map['Answers › Pages']).toBe('12');
    expect(map['Price Range']).toMatch(/^8\s?000 – 12\s?000$/);
  });

  it('formularz kontaktowy: płaskie pola, boolean jako tak/nie, puste pominięte', () => {
    const entries = leadDetailsEntries(
      JSON.stringify({ privacy: true, extra: 'x', empty: '', nothing: null }),
    );
    expect(entries.map((e) => [e.label, e.value])).toEqual([
      ['Privacy', 'tak'],
      ['Extra', 'x'],
    ]);
  });

  it('puste/brak → pusta lista', () => {
    expect(leadDetailsEntries(undefined)).toEqual([]);
    expect(leadDetailsEntries('')).toEqual([]);
  });
});

describe('LeadDetailsModal z zepsutym details', () => {
  it('renderuje się (bez ErrorBoundary) i pokazuje surową wartość', () => {
    const lead = {
      id: 'L2',
      email: 'zly@x.pl',
      name: 'Zły JSON',
      service_type: 'web',
      status: 'new',
      created_at: '2026-10-21 10:00:00',
      message: '',
      details: '{oops',
      current_step: 1,
    } as Lead;
    render(<LeadDetailsModal lead={lead} onClose={vi.fn()} />);
    expect(screen.getByText('Szczegóły Zgłoszenia')).toBeInTheDocument();
    expect(screen.getByText('{oops')).toBeInTheDocument();
    expect(screen.getByText('Brak treści')).toBeInTheDocument();
  });
});
