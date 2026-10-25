import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModalProvider } from '../../context/ModalContext';
import Navbar from '../../components/layout/Navbar';
import { setHeroCovered } from '../../utils/heroCover';

describe('setHeroCovered — inert tylko na elementach fokusowalnych hero', () => {
  const build = () => {
    const host = document.createElement('section');
    host.innerHTML = `
      <div data-hero-covers>
        <h1>Agencja <span>Wybierz Partnera</span></h1>
        <p>Opis</p>
        <button type="button">Audyt</button>
        <a href="/wycena/">Wycena</a>
        <a>bez href</a>
      </div>
      <div data-hero-covers><button type="button">Pauza</button></div>
      <button type="button" id="outside">Poza hero-covers</button>`;
    document.body.appendChild(host);
    return host;
  };

  it('zakrycie: h1 i kontenery zostają w drzewie dostępności, fokusowalne dostają inert', () => {
    const host = build();
    setHeroCovered(host, true);

    expect(host.querySelector('h1')?.closest('[inert]')).toBeNull();
    host.querySelectorAll('[data-hero-covers]').forEach((el) => {
      expect(el.hasAttribute('inert')).toBe(false);
    });
    expect(screen.getByText('Audyt').hasAttribute('inert')).toBe(true);
    expect(screen.getByText('Wycena').hasAttribute('inert')).toBe(true);
    expect(screen.getByText('Pauza').hasAttribute('inert')).toBe(true);
    // Element bez href nie jest fokusowalny — nie ruszamy go.
    expect(screen.getByText('bez href').hasAttribute('inert')).toBe(false);
    // Poza [data-hero-covers] nic się nie zmienia.
    expect(host.querySelector('#outside')?.hasAttribute('inert')).toBe(false);
    host.remove();
  });

  it('odsłonięcie zdejmuje inert', () => {
    const host = build();
    setHeroCovered(host, true);
    setHeroCovered(host, false);
    expect(host.querySelectorAll('[inert]')).toHaveLength(0);
    host.remove();
  });
});

describe('Navbar — przyciski menu mobilnego mają różne nazwy', () => {
  it('po otwarciu jest dokładnie jeden „Zamknij menu nawigacyjne”, przełącznik ma stałą nazwę', () => {
    render(
      <MemoryRouter>
        <ModalProvider>
          <Navbar />
        </ModalProvider>
      </MemoryRouter>,
    );
    const toggle = screen.getByRole('button', { name: 'Menu nawigacyjne' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(toggle);

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: 'Menu nawigacyjne' })).toBe(toggle);
    expect(screen.getAllByRole('button', { name: 'Zamknij menu nawigacyjne' })).toHaveLength(1);
  });
});

describe('Navbar — bez nagłówków przed <h1> strony', () => {
  it('menu (desktop + mobilne, także zamknięte) nie wnosi h1–h6 do konspektu', () => {
    // Navbar stoi w DOM przed <main> na każdej stronie; prerender zapisuje też zamknięte menu
    // mobilne, więc crawler bez CSS widział h5 „Web Development” jako pierwszy nagłówek.
    const { container } = render(
      <MemoryRouter>
        <ModalProvider>
          <Navbar />
        </ModalProvider>
      </MemoryRouter>,
    );
    expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0);
  });
});

describe('Navbar — CTA „Wycena Projektu” to jeden link, bez <button> w środku', () => {
  // Regresja (E2E prod 2026-10-25): <Link><Button/></Link> — zagnieżdżone elementy interaktywne
  // (niepoprawny HTML, dwa przystanki Tab i dwa „Wycena Projektu” dla czytnika).
  it('jeden element interaktywny prowadzący do /wycena/', () => {
    const { container } = render(
      <MemoryRouter>
        <ModalProvider>
          <Navbar />
        </ModalProvider>
      </MemoryRouter>,
    );
    const cta = screen.getByRole('link', { name: 'Wycena Projektu' });
    expect(cta).toHaveAttribute('href', '/wycena/');
    expect(cta.querySelector('button, a, [role="button"]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Wycena Projektu' })).toBeNull();
    expect(container.querySelectorAll('a button, a a, button a, button button')).toHaveLength(0);
  });
});
