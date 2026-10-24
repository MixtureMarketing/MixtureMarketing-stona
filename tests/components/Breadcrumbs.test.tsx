import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { getPathBreadcrumbs } from '../../config/breadcrumbs';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Breadcrumbs />
    </MemoryRouter>,
  );
}

describe('Breadcrumbs', () => {
  it('/branza ma hub — okruszek „Branże” linkuje do /branza/', () => {
    renderAt('/branza/medycyna/');
    expect(screen.getByText('Branże').closest('a')?.getAttribute('href')).toBe('/branza/');
  });

  it('segment bez własnej strony (/miasto) jest tekstem, nie linkiem do 404', () => {
    renderAt('/miasto/rzeszow/');
    expect(screen.getByText('Miasta').closest('a')).toBeNull();
    expect(document.querySelector('a[href="/miasto/"]')).toBeNull();
  });

  it('segment z własną stroną nadal linkuje', () => {
    renderAt('/marketing/google-ads/');
    expect(screen.getByText('Marketing Cyfrowy').closest('a')?.getAttribute('href')).toBe(
      '/marketing/',
    );
  });
});

describe('getPathBreadcrumbs — schema BreadcrumbList = widoczne okruszki', () => {
  it('strony statyczne mają etykiety z mapy, nie surowy slug', () => {
    expect(getPathBreadcrumbs('/privacy-policy/')).toEqual([
      { name: 'Strona Główna', item: '/' },
      { name: 'Polityka prywatności', item: '/privacy-policy/' },
    ]);
    renderAt('/privacy-policy/');
    expect(screen.getByText('Polityka prywatności')).toBeTruthy();
  });

  it('segment bez strony (/miasto) jest pomijany w schemie (ListItem musi mieć URL)', () => {
    expect(getPathBreadcrumbs('/miasto/rzeszow/').map((c) => c.item)).toEqual([
      '/',
      '/miasto/rzeszow/',
    ]);
  });

  it('currentLabel nazywa ostatni okruszek (case study z CMS), mapa ma pierwszeństwo', () => {
    expect(getPathBreadcrumbs('/portfolio/glamspace/', 'GlamSpace')).toEqual([
      { name: 'Strona Główna', item: '/' },
      { name: 'Realizacje', item: '/portfolio/' },
      { name: 'GlamSpace', item: '/portfolio/glamspace/' },
    ]);
    expect(getPathBreadcrumbs('/contact/', 'Inna nazwa')[1].name).toBe('Kontakt');
  });

  it('widoczne okruszki używają tej samej etykiety co schema', () => {
    render(
      <MemoryRouter initialEntries={['/portfolio/glamspace/']}>
        <Breadcrumbs currentLabel="GlamSpace" />
      </MemoryRouter>,
    );
    const labels = Array.from(document.querySelectorAll('nav[aria-label="Breadcrumb"] li')).map(
      (li) => li.textContent?.trim(),
    );
    expect(labels).toEqual(
      getPathBreadcrumbs('/portfolio/glamspace/', 'GlamSpace').map((c) => c.name),
    );
  });
});
