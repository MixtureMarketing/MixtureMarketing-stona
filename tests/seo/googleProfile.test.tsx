// MIX-1020: link do wizytówki Google (przyciski na /kontakt i w stopce) + JSON-LD bez adresu biura.
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SITE_CONFIG } from '../../config/site';
import { cleanHttpsUrl, getGoogleProfileLinks } from '../../utils/googleProfile';
import GoogleProfileButtons from '../../components/common/GoogleProfileButtons';
import Footer from '../../components/layout/Footer';
import ContactPage from '../../components/pages/ContactPage';
import { getOrganizationSchema } from '../../utils/seo/organizationSchema';
import { getLocalBusinessSchema } from '../../utils/seo/commonSchemas';

vi.mock('../../components/features/contact/InlineContactForm', () => ({
  default: () => <div data-testid="inline-contact-form" />,
}));

const PROFILE = 'https://share.google/U5QLwlwd3Ls52C3An';
const KG = 'https://www.google.com/search?kgmid=/g/11t_svlzz2';
const REVIEW = 'https://g.page/r/CTeu70P5NjsgEBM/review';

const ORIGINAL_REVIEW = SITE_CONFIG.google.reviewUrl;
const ORIGINAL_PROFILE = SITE_CONFIG.google.profileUrl;
afterEach(() => {
  SITE_CONFIG.google.reviewUrl = ORIGINAL_REVIEW;
  SITE_CONFIG.google.profileUrl = ORIGINAL_PROFILE;
});

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
const renderContact = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/contact/']}>
        <ContactPage />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('konfiguracja profilu Google', () => {
  it('ma link od Jakuba, stały adres kgmid i link opinii od Karola', () => {
    expect(SITE_CONFIG.google.profileUrl).toBe(PROFILE);
    expect(SITE_CONFIG.google.knowledgeGraphUrl).toBe(KG);
    expect(SITE_CONFIG.google.reviewUrl).toBe(REVIEW);
  });

  it.each([
    ['', null],
    ['   ', null],
    [undefined, null],
    [null, null],
    ['http://share.google/x', null],
    ['javascript:alert(1)', null],
    ['nie url', null],
    ['  https://g.page/r/abc/review  ', 'https://g.page/r/abc/review'],
  ])('cleanHttpsUrl(%j) → %j', (input, expected) => {
    expect(cleanHttpsUrl(input as string | null | undefined)).toBe(expected);
  });

  it('getGoogleProfileLinks: pusty link opinii daje null, profil zostaje', () => {
    expect(getGoogleProfileLinks({ profileUrl: PROFILE, reviewUrl: '' })).toEqual({
      profileUrl: PROFILE,
      reviewUrl: null,
    });
    expect(getGoogleProfileLinks({ profileUrl: PROFILE, reviewUrl: REVIEW })).toEqual({
      profileUrl: PROFILE,
      reviewUrl: REVIEW,
    });
  });
});

describe('<GoogleProfileButtons>', () => {
  it('oba linki: dwa przyciski, nowa karta, rel noopener', () => {
    render(<GoogleProfileButtons links={{ profileUrl: PROFILE, reviewUrl: REVIEW }} />);
    const profile = screen.getByRole('link', { name: /Zobacz nas w Google/ });
    const review = screen.getByRole('link', { name: /Wystaw opinię/ });
    expect(profile).toHaveAttribute('href', PROFILE);
    expect(review).toHaveAttribute('href', REVIEW);
    for (const a of [profile, review]) {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
    }
  });

  it('pusty link opinii: przycisk „Wystaw opinię” ukryty, „Zobacz nas w Google” jest', () => {
    render(<GoogleProfileButtons links={{ profileUrl: PROFILE, reviewUrl: null }} />);
    expect(screen.getByRole('link', { name: /Zobacz nas w Google/ })).toBeInTheDocument();
    expect(screen.queryByText(/Wystaw opinię/)).not.toBeInTheDocument();
    expect(document.querySelectorAll('a[href=""]')).toHaveLength(0);
  });

  it('pusty link profilu: ukryty „Zobacz nas w Google”, opinia jest', () => {
    render(<GoogleProfileButtons links={{ profileUrl: null, reviewUrl: REVIEW }} />);
    expect(screen.queryByText(/Zobacz nas w Google/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Wystaw opinię/ })).toBeInTheDocument();
  });

  it('brak obu linków: nic się nie renderuje (bez pustego kontenera)', () => {
    const { container } = render(
      <GoogleProfileButtons links={{ profileUrl: null, reviewUrl: null }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('stopka i /kontakt', () => {
  it('stopka: oba przyciski z linkami z konfiguracji', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /Zobacz nas w Google/ })).toHaveAttribute(
      'href',
      PROFILE,
    );
    expect(screen.getByRole('link', { name: /Wystaw opinię/ })).toHaveAttribute('href', REVIEW);
  });

  it('stopka: pusty reviewUrl w konfiguracji = brak „Wystaw opinię”', () => {
    SITE_CONFIG.google.reviewUrl = '';
    renderFooter();
    expect(screen.getByRole('link', { name: /Zobacz nas w Google/ })).toBeInTheDocument();
    expect(screen.queryByText(/Wystaw opinię/)).not.toBeInTheDocument();
  });

  it('/kontakt: oba przyciski z linkami z konfiguracji', () => {
    renderContact();
    expect(screen.getByRole('link', { name: /Zobacz nas w Google/ })).toHaveAttribute(
      'href',
      PROFILE,
    );
    expect(screen.getByRole('link', { name: /Wystaw opinię/ })).toHaveAttribute('href', REVIEW);
  });

  it('/kontakt: pusty reviewUrl w konfiguracji = brak „Wystaw opinię”', () => {
    SITE_CONFIG.google.reviewUrl = '';
    renderContact();
    expect(screen.getByRole('link', { name: /Zobacz nas w Google/ })).toBeInTheDocument();
    expect(screen.queryByText(/Wystaw opinię/)).not.toBeInTheDocument();
  });
});

describe('JSON-LD firmy: profil Google zamiast adresu biura wirtualnego', () => {
  const builders = {
    getOrganizationSchema: () => getOrganizationSchema() as Record<string, unknown>,
    getLocalBusinessSchema: () =>
      getLocalBusinessSchema(SITE_CONFIG.domain) as Record<string, unknown>,
  };

  describe.each(Object.entries(builders))('%s', (_name, build) => {
    it('sameAs zawiera stały adres profilu Google (kgmid) i profile społecznościowe', () => {
      const sameAs = build().sameAs as string[];
      expect(sameAs).toContain(KG);
      for (const url of Object.values(SITE_CONFIG.social)) expect(sameAs).toContain(url);
    });

    it('hasMap wskazuje profil Google, nie mapę adresu', () => {
      expect(build().hasMap).toBe(KG);
    });

    it('bez address / geo / location (adres biura wirtualnego)', () => {
      const ld = build();
      expect(ld).not.toHaveProperty('address');
      expect(ld).not.toHaveProperty('geo');
      expect(ld).not.toHaveProperty('location');
    });

    it('nigdzie w JSON-LD nie ma ulicy, kodu pocztowego, PostalAddress ani mapy adresu', () => {
      const json = JSON.stringify(build());
      expect(json).not.toContain('PostalAddress');
      expect(json).not.toContain('Piłsudskiego');
      expect(json).not.toContain(SITE_CONFIG.contact.address.street);
      expect(json).not.toContain(SITE_CONFIG.contact.address.postalCode);
      expect(json).not.toContain('maps?q');
      expect(json).not.toContain('#office');
      expect(json).not.toContain('GeoCoordinates');
    });

    it('areaServed: Polska, Rzeszów, Podkarpackie i miasta', () => {
      const names = (build().areaServed as { name: string }[]).map((a) => a.name);
      expect(names).toEqual(
        expect.arrayContaining(['Polska', 'Rzeszów', 'Podkarpackie', 'Mielec', 'Jasło']),
      );
      expect(names).toHaveLength(9);
    });
  });
});
