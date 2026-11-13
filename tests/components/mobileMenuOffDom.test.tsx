// MIX-1411 kryterium 11: przy wyłączonym przełączniku VITE_MM_MOBILE_MENU_B menu mobilne ma
// dokładnie ten sam DOM co przed zmianą. Wzorzec `tests/fixtures/mobile-menu-off.json` został
// zapisany na gałęzi bazowej (8f52c49 + integracja 7b2c298), zanim powstał wariant B.
// Brak wzorca = test czerwony (bez cichego zapisu); zapis tylko jawnie: M1411_ZAPISZ_WZORZEC=1.
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModalProvider } from '../../context/ModalContext';
import Navbar from '../../components/layout/Navbar';

const FIXTURE = path.resolve(__dirname, '../fixtures/mobile-menu-off.json');

function snapshotMenu(): Record<string, string> {
  const { container } = render(
    <MemoryRouter initialEntries={['/']}>
      <ModalProvider>
        <Navbar />
      </ModalProvider>
    </MemoryRouter>,
  );
  const menu = () => container.querySelector('#mobile-menu') as HTMLElement;
  const out: Record<string, string> = { closed: menu().outerHTML };
  fireEvent.click(container.querySelector('button[aria-controls="mobile-menu"]') as HTMLElement);
  out.open = menu().outerHTML;
  const offer = menu().querySelector('button[aria-controls="mobile-offers-submenu"]');
  if (offer) fireEvent.click(offer);
  out.offer = menu().outerHTML;
  return out;
}

describe('Menu mobilne — przełącznik wyłączony: DOM bez zmian (MIX-1411, kryt. 11)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  for (const raw of [undefined, '', '0', 'false', 'TRUE', ' 1']) {
    it(`VITE_MM_MOBILE_MENU_B=${JSON.stringify(raw)}: zamknięte, otwarte i „Oferta” = wzorzec`, () => {
      if (raw !== undefined) vi.stubEnv('VITE_MM_MOBILE_MENU_B', raw);
      const now = snapshotMenu();
      if (process.env.M1411_ZAPISZ_WZORZEC === '1' && raw === undefined) {
        fs.mkdirSync(path.dirname(FIXTURE), { recursive: true });
        fs.writeFileSync(FIXTURE, JSON.stringify(now, null, 1) + '\n');
      }
      expect(fs.existsSync(FIXTURE), `brak wzorca ${FIXTURE}`).toBe(true);
      const before = JSON.parse(fs.readFileSync(FIXTURE, 'utf8')) as Record<string, string>;
      expect(Object.keys(before).sort()).toEqual(['closed', 'offer', 'open']);
      expect(now.closed).toBe(before.closed);
      expect(now.open).toBe(before.open);
      expect(now.offer).toBe(before.offer);
    });
  }
});
