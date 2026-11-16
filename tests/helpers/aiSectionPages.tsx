// MIX-1276: wspólny render Home i /web-development/custom-app/ dla testów sekcji AI.
// Ciężkie dzieci są zastąpione znacznikami (vi.mock w pliku testu), więc HTML zawiera tylko
// własny układ stron, a „baseline” w tests/fixtures/mix1276 nie zależy od treści sekcji.
import React from 'react';
import { expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from '../../context/ModalContext';
import Home from '../../components/pages/Home';
import CustomWebApp from '../../components/pages/CustomWebApp';

const wrap = (el: React.ReactElement, path: string) => (
  <HelmetProvider>
    <MemoryRouter initialEntries={[path]}>
      <ModalProvider>{el}</ModalProvider>
    </MemoryRouter>
  </HelmetProvider>
);

/** Home po załadowaniu leniwych sekcji (znacznik FinalBand = ostatnia sekcja). */
export async function renderHome() {
  const r = render(wrap(<Home />, '/'));
  await screen.findByTestId('final');
  await waitFor(() => expect(r.container.querySelector('[data-mock="kb"]')).not.toBeNull());
  return r;
}

export function renderCustomApp() {
  return render(wrap(<CustomWebApp />, '/web-development/custom-app/'));
}
