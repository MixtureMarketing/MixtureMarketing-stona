import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Contact from '../components/sections/Contact';
import { leadService } from '../services/leadService';

// Mock leadService
vi.mock('../services/leadService', () => ({
  leadService: {
    createLead: vi.fn(),
    updateLead: vi.fn(),
  },
}));

// Mock AnimateOnScroll to render children directly
vi.mock('../components/AnimateOnScroll', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Contact Component', () => {
  it('renders contact form fields', () => {
    render(<Contact />);

    expect(screen.getByLabelText(/Imię i Nazwisko/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Firma/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Wiadomość/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Wyślij Wiadomość/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<Contact />);

    const submitBtn = screen.getByRole('button', { name: /Wyślij Wiadomość/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // leadService should NOT be called if fields are empty
      expect(leadService.createLead).not.toHaveBeenCalled();
    });
  });

  it('submits form data successfully', async () => {
    const mockLead = { id: '123', name: 'John Doe', email: 'john@example.com' };
    (leadService.createLead as any).mockResolvedValue(mockLead);
    (leadService.updateLead as any).mockResolvedValue(true);

    render(<Contact />);

    // Simulate user input
    fireEvent.change(screen.getByLabelText(/Imię i Nazwisko/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Firma/i), { target: { value: 'Acme Inc' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Wiadomość/i), { target: { value: 'Hello world' } });

    const submitBtn = screen.getByRole('button', { name: /Wyślij Wiadomość/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(leadService.createLead).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
        }),
      );

      expect(leadService.updateLead).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          company: 'Acme Inc',
          message: 'Hello world',
        }),
      );
    });
  });
});
