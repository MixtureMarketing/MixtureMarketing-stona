import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InlineContactForm from '../../components/features/contact/InlineContactForm';
import { ModalProvider } from '../../context/ModalContext';
import { leadService } from '../../services/leadService';

// Prawdziwy TurnstileWidget (tryb defer), zamockowany tylko loader skryptu.
const renderInvisibleTurnstile = vi.fn();
const getTurnstileToken = vi.fn();
vi.mock('../../utils/turnstile', () => ({
  renderInvisibleTurnstile: (...a: unknown[]) => renderInvisibleTurnstile(...a),
  getTurnstileToken: (...a: unknown[]) => getTurnstileToken(...a),
  removeTurnstile: vi.fn(),
}));

vi.mock('../../services/leadService', () => ({
  leadService: {
    createLead: vi.fn(),
    updateLead: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

const renderForm = () =>
  render(
    <ModalProvider>
      <InlineContactForm />
    </ModalProvider>,
  );

describe('InlineContactForm (/contact/) — Turnstile na żądanie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    renderInvisibleTurnstile.mockResolvedValue('w1');
    getTurnstileToken.mockResolvedValue('tok-1');
  });

  it('nie ładuje skryptu Turnstile przy wejściu na stronę', () => {
    renderForm();
    expect(renderInvisibleTurnstile).not.toHaveBeenCalled();
  });

  it('pierwsza interakcja (focus pola) ładuje Turnstile raz', async () => {
    renderForm();
    fireEvent.focus(screen.getByLabelText(/Imię i Nazwisko/i));
    fireEvent.focus(screen.getByLabelText(/Email/i));
    await waitFor(() => expect(renderInvisibleTurnstile).toHaveBeenCalledTimes(1));
  });

  it('krok 1 wysyła lead z tokenem Turnstile i przechodzi dalej', async () => {
    (leadService.createLead as Mock).mockResolvedValue({ id: 'lead-1', name: 'Jan' });
    renderForm();

    fireEvent.change(screen.getByLabelText(/Imię i Nazwisko/i), {
      target: { value: 'Jan Kowalski' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jan@test.pl' } });
    fireEvent.change(screen.getByLabelText(/Telefon/i), { target: { value: '123456789' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText(/Zapisz i przejdź dalej/i));

    await waitFor(() =>
      expect(leadService.createLead).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jan@test.pl', captcha_token: 'tok-1' }),
      ),
    );
    expect(renderInvisibleTurnstile).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText(/Ostatni krok|Szczegóły/i)).toBeInTheDocument());
  });

  // Regresja (E2E prod 2026-10-25): po nieudanej walidacji komunikat gasł dopiero przy blur —
  // a blur pola następuje na mousedown przycisku „Zapisz i przejdź dalej”. Układ skakał o
  // wysokość komunikatu, mouseup lądował obok przycisku i pierwszy klik przepadał.
  it('po nieudanej próbie komunikaty gasną przy zmianie pola, bez czekania na blur', async () => {
    renderForm();
    fireEvent.click(screen.getByText(/Zapisz i przejdź dalej/i));
    expect(await screen.findByText(/Zgoda na przetwarzanie danych jest wymagana/i)).toBeVisible();
    expect(screen.getByText(/co najmniej 2 znaki/i)).toBeVisible();

    // Same zdarzenia change/click — bez blur (jak w chwili mousedown na przycisku).
    fireEvent.change(screen.getByLabelText(/Imię i Nazwisko/i), {
      target: { value: 'Jan Kowalski' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    await waitFor(() =>
      expect(screen.queryByText(/Zgoda na przetwarzanie danych jest wymagana/i)).toBeNull(),
    );
    expect(screen.queryByText(/co najmniej 2 znaki/i)).toBeNull();
    expect(leadService.createLead).not.toHaveBeenCalled();
  });
});
