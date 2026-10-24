import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import PortalDocuments from '../../components/portal/client/PortalDocuments';
import PortalHeader from '../../components/portal/client/PortalHeader';
import type { Project } from '../../components/portal/types';

const LONG = 'Umowa_ramowa_z_bardzo_dlugą_nazwą_pliku_bez_spacji_ktora_nie_ma_konca_2026.pdf';

const project = {
  id: '1',
  name: 'Sklep',
  documents: [
    {
      id: '11',
      name: LONG,
      file_path: 'x',
      type: 'document',
      subtype: 'contract',
      created_at: '2026-10-02',
    },
    {
      id: '12',
      name: `Faktura_${LONG}`,
      file_path: 'y',
      type: 'invoice',
      subtype: 'other',
      created_at: '2026-10-01',
    },
  ],
} as unknown as Project;

describe('PortalDocuments: długa nazwa pliku', () => {
  it('nazwa jest przycinana (truncate + pełna nazwa w title), przycisk „Pobierz” nie kurczy się', () => {
    const onDownload = vi.fn();
    render(<PortalDocuments projects={[project]} onDownload={onDownload} />);

    for (const label of [`Pobierz dokument: ${LONG}`, `Pobierz fakturę: Faktura_${LONG}`]) {
      const btn = screen.getByRole('button', { name: label });
      expect(btn).toHaveClass('shrink-0');
      // kontener nazwy może się kurczyć (min-w-0), inaczej flex wypycha przycisk
      const nameWrap = btn.previousElementSibling as HTMLElement;
      expect(nameWrap).toHaveClass('min-w-0');
    }
    const name = screen.getByText(LONG);
    expect(name).toHaveClass('truncate');
    expect(name).toHaveAttribute('title', LONG);

    fireEvent.click(screen.getByRole('button', { name: `Pobierz dokument: ${LONG}` }));
    expect(onDownload).toHaveBeenCalledWith('11', LONG);
  });
});

describe('PortalHeader: nie chowa się pod stałym Navbarem strony', () => {
  it('sticky z offsetem równym wysokości Navbara (h-20 → top-20)', () => {
    const { container } = render(
      <MemoryRouter>
        <PortalHeader
          user={{ name: 'Anna', email: 'a@b.pl', role: 'client' }}
          onEditProfile={vi.fn()}
          onLogout={vi.fn()}
        />
      </MemoryRouter>,
    );
    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky', 'top-20');
    expect(header).not.toHaveClass('top-0');
  });

  it('strażnik: offset portalu (top-20/pt-20) zakłada Navbar `fixed … h-20`', () => {
    // Zmiana wysokości Navbara wymaga zmiany offsetów w components/portal/*.
    const nav = readFileSync(resolve(__dirname, '../../components/layout/Navbar.tsx'), 'utf8');
    expect(nav).toMatch(/fixed w-full[^"`]*\bh-20\b/);
  });
});
