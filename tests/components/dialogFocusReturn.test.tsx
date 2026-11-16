// Regresja (E2E prod 2026-10-25): zamknięcie okna przyciskiem X (albo kliknięciem w tło)
// odmontowywało otwarty <dialog> i fokus spadał na <body>; wracał na CTA tylko po Esc
// (natywne zamknięcie). Dotyczyło modala kontaktowego (okno zamówienia usunięte w MIX-1849).
import React, { StrictMode, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from '../../components/common/Modal';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));

// Jak w App.tsx: okno istnieje w drzewie tylko, gdy jest otwarte (zamknięcie = odmontowanie).
const ContactLikeHarness = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Umów konsultację</button>
      {open && (
        <Modal isOpen onClose={() => setOpen(false)} title="Rozpocznijmy współpracę">
          <input aria-label="Imię" />
        </Modal>
      )}
    </>
  );
};

/** Klik jak w przeglądarce: przycisk dostaje fokus, a otwarte okno przejmuje go do środka. */
function openFrom(name: RegExp) {
  const trigger = screen.getByRole('button', { name });
  trigger.focus();
  fireEvent.click(trigger);
  const close = screen.getAllByRole('button', { name: /Zamknij okno/i })[0];
  close.focus(); // showModal() przenosi fokus do okna (jsdom tego nie robi)
  expect(document.activeElement).toBe(close);
  return { trigger, close };
}

describe('fokus wraca na CTA po zamknięciu okna', () => {
  it('modal kontaktowy — przycisk X', () => {
    render(<ContactLikeHarness />);
    const { trigger, close } = openFrom(/Umów konsultację/);
    fireEvent.click(close);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('modal kontaktowy — kliknięcie w tło', () => {
    render(<ContactLikeHarness />);
    const { trigger } = openFrom(/Umów konsultację/);
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    fireEvent.click(dialog); // target === <dialog> = backdrop
    expect(document.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('modal kontaktowy — StrictMode (podwójne efekty) nie gubi elementu otwierającego', () => {
    render(
      <StrictMode>
        <ContactLikeHarness />
      </StrictMode>,
    );
    const { trigger, close } = openFrom(/Umów konsultację/);
    fireEvent.click(close);
    expect(document.activeElement).toBe(trigger);
  });
});
