// MIX-1815 r2 (mutant V6 weryfikatora): wznowiony lead ma pierwszeństwo przed konfiguracją z /wycena/.
// Formularz wznowionego leada pokazuje jego wiadomość i e-mail, a nie tekst z kalkulatora.
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const resumed = {
  resumedLead: {
    id: 'lead-9',
    name: 'Anna',
    email: 'wznowiony@firma.pl',
    phone: '',
    website: '',
    budget: '',
    message: 'Wiadomość wznowionego leada',
  },
  step: 3,
};
vi.mock('../../../context/ModalContext', () => ({
  useModal: () => ({
    isModalOpen: false,
    modalType: 'general',
    additionalData: resumed,
    openModal: () => {},
    closeModal: () => {},
  }),
}));
vi.mock('../../../services/leadService', () => ({
  leadService: { createLead: vi.fn(), updateLead: vi.fn(), sendNotification: vi.fn() },
}));
vi.mock('../contact/TurnstileWidget', async () => {
  const R = await import('react');
  return {
    default: R.forwardRef((_p: unknown, ref: React.Ref<unknown>) => {
      R.useImperativeHandle(ref, () => ({
        getToken: () => Promise.resolve('captcha-1'),
        reset: () => {},
        prepare: () => {},
      }));
      return null;
    }),
  };
});

import InlineContactForm from '../contact/InlineContactForm';
import { HANDOFF_VERSION } from './calculatorHandoff';

describe('MIX-1815 r2: wznowiony lead a konfiguracja z kalkulatora', () => {
  it('wiadomość i e-mail wznowionego leada nie są nadpisane konfiguracją', async () => {
    render(
      <MemoryRouter>
        <InlineContactForm
          type="general"
          calculatorConfig={{
            v: HANDOFF_VERSION,
            text: 'Konfiguracja z kalkulatora wyceny (/wycena/): X',
            email: 'kalkulator@firma.pl',
          }}
        />
      </MemoryRouter>,
    );
    const msg = (await screen.findByLabelText(/Opisz swój cel/i)) as HTMLTextAreaElement;
    await new Promise((r) => setTimeout(r, 20));
    expect(msg.value).toBe('Wiadomość wznowionego leada');
  });
});
