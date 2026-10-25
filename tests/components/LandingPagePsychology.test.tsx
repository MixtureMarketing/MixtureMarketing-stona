// Regresja (E2E prod 2026-10-25): krok AIDA podświetlał się na hover, a klik myszą od razu go
// gasił (toggle) — dla użytkownika klik „nic nie robił”, a krok tracił zaznaczenie.
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPagePsychology from '../../components/features/web-development/LandingPagePsychology';

const step = (name: RegExp) => screen.getByRole('button', { name });

describe('LandingPagePsychology — kroki AIDA', () => {
  it('hover + klik myszą zostawia krok zaznaczony', () => {
    render(<LandingPagePsychology />);
    const desire = step(/Pożądanie/);
    fireEvent.mouseEnter(desire);
    expect(desire).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(desire, { detail: 1 }); // klik myszą/dotykiem: detail ≥ 1
    expect(desire).toHaveAttribute('aria-pressed', 'true');
  });

  it('klawiatura (Enter/Spacja → click z detail 0) przełącza zaznaczenie', () => {
    render(<LandingPagePsychology />);
    const action = step(/Działanie/);
    fireEvent.click(action, { detail: 0 });
    expect(action).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(action, { detail: 0 });
    expect(action).toHaveAttribute('aria-pressed', 'false');
  });
});
