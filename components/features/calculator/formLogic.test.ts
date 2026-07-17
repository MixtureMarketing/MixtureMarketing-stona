import { describe, it, expect } from 'vitest';
import { visibleQuestions, validate, humanError, pickAnswers } from './formLogic';
import type { PublicQuestion } from '../../../services/calculatorService';

const Q = (over: Partial<PublicQuestion>): PublicQuestion => ({
  code: 'x',
  text: '?',
  help_text: null,
  answer_type: 'select',
  options: null,
  visible_if: null,
  group: null,
  sort_order: 0,
  ...over,
});

const QUESTIONS: PublicQuestion[] = [
  Q({ code: 'project_goal', answer_type: 'select' }),
  Q({ code: 'languages', answer_type: 'number' }),
  Q({
    code: 'sla_detail',
    answer_type: 'select',
    // widoczne tylko gdy project_goal === 'aplikacja'
    visible_if: { q: 'project_goal', op: 'eq', val: 'aplikacja' },
  }),
];

describe('visibleQuestions — reużycie matchCondition (parytet z wizardem)', () => {
  it('ukrywa pytanie z visible_if, gdy warunek niespełniony', () => {
    const vis = visibleQuestions(QUESTIONS, { project_goal: 'sklep' });
    expect(vis.map((q) => q.code)).toEqual(['project_goal', 'languages']);
  });
  it('pokazuje pytanie, gdy visible_if spełniony', () => {
    const vis = visibleQuestions(QUESTIONS, { project_goal: 'aplikacja' });
    expect(vis.map((q) => q.code)).toContain('sla_detail');
  });
});

describe('validate — walidacja kliencka', () => {
  it('project_goal wymagane', () => {
    const r = validate(QUESTIONS, {}, 'a@b.pl');
    expect(r.valid).toBe(false);
    expect(r.errors.project_goal).toBeTruthy();
  });
  it('number nie-liczbowy → błąd', () => {
    const r = validate(QUESTIONS, { project_goal: 'sklep', languages: 'dużo' }, 'a@b.pl');
    expect(r.errors.languages).toBeTruthy();
  });
  it('zły email → błąd', () => {
    const r = validate(QUESTIONS, { project_goal: 'sklep' }, 'nie-email');
    expect(r.errors.email).toBeTruthy();
  });
  it('komplet poprawny → valid, ukryte pytanie nie blokuje', () => {
    const r = validate(QUESTIONS, { project_goal: 'sklep', languages: 2 }, 'a@b.pl');
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual({});
  });
});

describe('humanError — mapa statusów', () => {
  it('429/403/400/0/inne → komunikaty po ludzku', () => {
    expect(humanError(429)).toMatch(/Zbyt wiele/);
    expect(humanError(403)).toMatch(/antybotowa/);
    expect(humanError(400)).toMatch(/niekompletne|Sprawdź/);
    expect(humanError(0)).toMatch(/połączenia|internet/);
    expect(humanError(500)).toMatch(/Spróbuj/);
  });
});

describe('pickAnswers — tylko kody publiczne, bez pustych', () => {
  it('odrzuca kody spoza zestawu i puste wartości', () => {
    const out = pickAnswers(QUESTIONS, {
      project_goal: 'sklep',
      languages: 2,
      obcy_kod: 'x',
      sla_detail: '',
    });
    expect(out).toEqual({ project_goal: 'sklep', languages: 2 });
  });
});
