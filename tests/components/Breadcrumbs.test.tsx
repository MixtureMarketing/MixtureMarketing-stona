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
