import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LeadDetailsModal } from '../../components/portal/admin/AdminModals';
import type { Lead } from '../../components/portal/types';

const baseLead: Lead = {
  id: 'L1',
  email: 'jan@sklep.pl',
  name: 'Jan Nowak',
  service_type: 'web',
  status: 'new',
  created_at: '2026-10-20 10:00:00',
  message: 'Chcę sklep',
  current_step: 3,
};

describe('LeadDetailsModal', () => {
  it('pokazuje telefon (tel:), firmę z kolumny `company` i stronę www jako bezpieczny link', () => {
    render(
      <LeadDetailsModal
        lead={{
          ...baseLead,
          phone: '+48 600 100 200',
          company: 'Sklep Jan',
          website: 'sklep-jan.pl',
          source: 'website',
        }}
        onClose={vi.fn()}
      />,
    );

    const phone = screen.getByText('+48 600 100 200');
    expect(phone.closest('a')).toHaveAttribute('href', 'tel:+48600100200');

    expect(screen.getByText('Sklep Jan')).toBeInTheDocument();

    const www = screen.getByText('sklep-jan.pl').closest('a');
    expect(www).toHaveAttribute('href', 'https://sklep-jan.pl/');
    expect(www).toHaveAttribute('target', '_blank');
    expect(www?.getAttribute('rel')).toContain('noopener');
  });

  it('`company_name` jako fallback, gdy brak `company`', () => {
    render(
      <LeadDetailsModal lead={{ ...baseLead, company_name: 'Stara Firma' }} onClose={vi.fn()} />,
    );
    expect(screen.getByText('Stara Firma')).toBeInTheDocument();
  });

  it('www z niebezpiecznym schematem renderuje się jako tekst, nie link', () => {
    const { container } = render(
      <LeadDetailsModal lead={{ ...baseLead, website: 'javascript:alert(1)' }} onClose={vi.fn()} />,
    );
    expect(screen.getByText('javascript:alert(1)').closest('a')).toBeNull();
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '');
    expect(hrefs.some((h) => h.toLowerCase().startsWith('javascript'))).toBe(false);
  });

  it('bez telefonu i www nie renderuje pustych sekcji', () => {
    const { container } = render(<LeadDetailsModal lead={baseLead} onClose={vi.fn()} />);
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
    expect(within(container).queryByText('Strona www')).toBeNull();
  });
});
