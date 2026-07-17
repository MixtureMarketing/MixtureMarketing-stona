import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionField from './QuestionField';
import type { PublicQuestion } from '../../../services/calculatorService';

const Q = (over: Partial<PublicQuestion>): PublicQuestion => ({
  code: 'x',
  text: 'Pytanie?',
  help_text: null,
  answer_type: 'text',
  options: null,
  visible_if: null,
  group: null,
  sort_order: 0,
  ...over,
});

describe('QuestionField — render per answer_type', () => {
  it('select → opcje z API, klik woła onChange(value)', () => {
    const onChange = vi.fn();
    render(
      <QuestionField
        question={Q({
          code: 'project_goal',
          answer_type: 'select',
          options: [{ value: 'sklep', label: 'Sklep' }],
        })}
        value={undefined}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('Sklep'));
    expect(onChange).toHaveBeenCalledWith('project_goal', 'sklep');
  });

  it('bool → Tak/Nie, klik woła onChange(bool)', () => {
    const onChange = vi.fn();
    render(
      <QuestionField
        question={Q({ code: 'sensitive', answer_type: 'bool' })}
        value={undefined}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('Tak'));
    expect(onChange).toHaveBeenCalledWith('sensitive', true);
  });

  it('multiselect → toggle dodaje/usuwa wartość', () => {
    const onChange = vi.fn();
    render(
      <QuestionField
        question={Q({
          code: 'users',
          answer_type: 'multiselect',
          options: [{ value: 'a', label: 'A' }],
        })}
        value={[]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('A'));
    expect(onChange).toHaveBeenCalledWith('users', ['a']);
  });

  it('number → koercja do liczby', () => {
    const onChange = vi.fn();
    render(
      <QuestionField
        question={Q({ code: 'languages', answer_type: 'number' })}
        value={undefined}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByLabelText('Pytanie?'), { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith('languages', 3);
  });

  it('pokazuje help_text i błąd', () => {
    render(
      <QuestionField
        question={Q({ help_text: 'podpowiedź' })}
        value={undefined}
        onChange={() => {}}
        error="wymagane"
      />,
    );
    expect(screen.getByText('podpowiedź')).toBeInTheDocument();
    expect(screen.getByText('wymagane')).toBeInTheDocument();
  });
});
