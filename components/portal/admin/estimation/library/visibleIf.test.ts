import { describe, it, expect } from 'vitest';
import { describeVisibleIf, type QMap } from './visibleIf';

const QMAP: QMap = {
  project_goal: {
    text: 'Cel projektu',
    options: [
      { value: 'sklep', label: 'Sklep internetowy' },
      { value: 'aplikacja', label: 'Aplikacja' },
    ],
  },
  has_payments: { text: 'Płatności online?' },
  users_concurrent: { text: 'Użytkownicy równocześni' },
};

describe('describeVisibleIf — podgląd warunku po ludzku', () => {
  it('null → zawsze widoczne', () => {
    expect(describeVisibleIf(null, QMAP)).toBe('zawsze widoczne');
  });

  it('liść eq z etykietą opcji (nie kodem)', () => {
    const json = JSON.stringify({ q: 'project_goal', op: 'eq', val: 'sklep' });
    expect(describeVisibleIf(json, QMAP)).toBe('widoczne, gdy: „Cel projektu" = Sklep internetowy');
  });

  it('bool → tak/nie', () => {
    const json = JSON.stringify({ q: 'has_payments', op: 'eq', val: true });
    expect(describeVisibleIf(json, QMAP)).toBe('widoczne, gdy: „Płatności online?" = tak');
  });

  it('all → ORAZ, z etykietami', () => {
    const json = JSON.stringify({
      all: [
        { q: 'project_goal', op: 'eq', val: 'sklep' },
        { q: 'has_payments', op: 'eq', val: true },
      ],
    });
    expect(describeVisibleIf(json, QMAP)).toBe(
      'widoczne, gdy: „Cel projektu" = Sklep internetowy ORAZ „Płatności online?" = tak',
    );
  });

  it('any → LUB', () => {
    const json = JSON.stringify({
      any: [
        { q: 'project_goal', op: 'eq', val: 'sklep' },
        { q: 'project_goal', op: 'eq', val: 'aplikacja' },
      ],
    });
    expect(describeVisibleIf(json, QMAP)).toBe(
      'widoczne, gdy: „Cel projektu" = Sklep internetowy LUB „Cel projektu" = Aplikacja',
    );
  });

  it('operatory gte/answered/unknown', () => {
    expect(
      describeVisibleIf(JSON.stringify({ q: 'users_concurrent', op: 'gte', val: 100 }), QMAP),
    ).toBe('widoczne, gdy: „Użytkownicy równocześni" ≥ 100');
    expect(describeVisibleIf(JSON.stringify({ q: 'has_payments', op: 'answered' }), QMAP)).toBe(
      'widoczne, gdy: „Płatności online?": odpowiedziane',
    );
    expect(describeVisibleIf(JSON.stringify({ q: 'has_payments', op: 'unknown' }), QMAP)).toBe(
      'widoczne, gdy: „Płatności online?": „nie wiem"',
    );
  });

  it('in → zbiór etykiet', () => {
    const json = JSON.stringify({ q: 'project_goal', op: 'in', val: ['sklep', 'aplikacja'] });
    expect(describeVisibleIf(json, QMAP)).toBe(
      'widoczne, gdy: „Cel projektu" ∈ {Sklep internetowy, Aplikacja}',
    );
  });

  it('nieznany kod pytania → pokazuje kod, nie wybucha', () => {
    const json = JSON.stringify({ q: 'brak_takiego', op: 'eq', val: 'x' });
    expect(describeVisibleIf(json, QMAP)).toBe('widoczne, gdy: „brak_takiego" = x');
  });

  it('błędny JSON → komunikat, nie wyjątek', () => {
    expect(describeVisibleIf('{niepoprawny', QMAP)).toBe('warunek nieczytelny (błędny JSON)');
  });
});
