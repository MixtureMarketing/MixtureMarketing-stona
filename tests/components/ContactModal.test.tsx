import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ContactModal from '../../components/features/ContactModal';
import { ModalProvider } from '../../context/ModalContext';
import { leadService } from '../../services/leadService';
import { ContactType } from '../../types';

// Mock dependencies
vi.mock('react-google-recaptcha-v3', () => ({
  useGoogleReCaptcha: () => ({
    executeRecaptcha: vi.fn().mockResolvedValue('dummy-token'),
  }),
  GoogleReCaptchaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../services/leadService', () => ({
  leadService: {
    createLead: vi.fn(),
    updateLead: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

const renderModal = (props: { isOpen: boolean; onClose: () => void; type: ContactType }) => {
  return render(
    <ModalProvider>
      <ContactModal {...props} />
    </ModalProvider>,
  );
};

describe('ContactModal Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should trigger abandoned_step_1 if closed at step 2', async () => {
    const onClose = vi.fn();
    (leadService.createLead as Mock).mockResolvedValue({
      id: 'lead-123',
      name: 'Jan',
      email: 'jan@test.pl',
    });

    renderModal({ isOpen: true, onClose, type: 'web' as ContactType });

    // Step 1: Fill data
    fireEvent.change(screen.getByLabelText(/Imię i Nazwisko/i), {
      target: { value: 'Jan Kowalski' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jan@test.pl' } });
    fireEvent.click(screen.getByRole('checkbox')); // Privacy

    // Move to step 2
    fireEvent.click(screen.getByText(/Zapisz i przejdź dalej/i));

    await waitFor(() => {
      expect(leadService.createLead).toHaveBeenCalled();
      expect(screen.getByText(/Szczegóły Projektu WWW/i)).toBeInTheDocument();
    });

    // Close modal at Step 2
    const closeButton = screen.getByRole('button', { name: /zamknij/i });
    fireEvent.click(closeButton);

    expect(leadService.sendNotification).toHaveBeenCalledWith('lead-123', 'abandoned_step_1');
    expect(onClose).toHaveBeenCalled();
  });

  it('should trigger success notification on final submission', async () => {
    (leadService.createLead as Mock).mockResolvedValue({ id: 'lead-full', name: 'Jan' });
    (leadService.updateLead as Mock).mockResolvedValue(true);
    (leadService.sendNotification as Mock).mockResolvedValue(true);

    renderModal({ isOpen: true, onClose: vi.fn(), type: 'web' });

    // Step 1
    fireEvent.change(screen.getByLabelText(/Imię i Nazwisko/i), { target: { value: 'Jan' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jan@test.pl' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText(/Zapisz i przejdź dalej/i));

    // Step 2
    await waitFor(() => screen.getByText(/Dalej/i));
    fireEvent.click(screen.getByText(/Dalej/i));

    // Step 3
    await waitFor(() => screen.getByLabelText(/Opisz swój cel/i));
    fireEvent.change(screen.getByLabelText(/Opisz swój cel/i), {
      target: { value: 'Chcę nową stronę' },
    });
    fireEvent.click(screen.getByText(/Wyślij zgłoszenie/i));

    await waitFor(() => {
      expect(leadService.sendNotification).toHaveBeenCalledWith('lead-full', 'success');
      expect(screen.getByText(/Zgłoszenie wysłane/i)).toBeInTheDocument();
    });
  });
});
