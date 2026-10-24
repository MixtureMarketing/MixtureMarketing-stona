import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from '../../components/common/Breadcrumbs';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Breadcrumbs />
    </MemoryRouter>,
  );
}

describe('Breadcrumbs', () => {
  it('segment bez własnej strony (/branza) jest tekstem, nie linkiem do 404', () => {
    renderAt('/branza/medycyna/');
    expect(screen.getByText('Branże').closest('a')).toBeNull();
    expect(document.querySelector('a[href="/branza/"]')).toBeNull();
  });

  it('/miasto ma polską etykietę i brak linku', () => {
    renderAt('/miasto/rzeszow/');
    expect(screen.getByText('Miasta').closest('a')).toBeNull();
  });

  it('segment z własną stroną nadal linkuje', () => {
    renderAt('/marketing/google-ads/');
    expect(screen.getByText('Marketing Cyfrowy').closest('a')?.getAttribute('href')).toBe(
      '/marketing/',
    );
  });
});
