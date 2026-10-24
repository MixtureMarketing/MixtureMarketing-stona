import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import IndustryHub from '../../components/pages/IndustryHub';
import { cmsService } from '../../services/cmsService';

vi.mock('../../services/cmsService', () => ({
  cmsService: { getIndustryList: vi.fn() },
}));

const renderHub = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/branza/']}>
        <IndustryHub />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('IndustryHub (/branza/)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('listuje branże z CMS z linkami ze slashem na końcu', async () => {
    vi.mocked(cmsService.getIndustryList).mockResolvedValue([
      { _id: '1', name: 'Deweloperzy', slug: 'deweloperzy', forWho: 'Firmy deweloperskie.' },
      { _id: '2', name: 'Gabinety', slug: 'gabinety', forWho: 'dla Psychologów i Terapeutów' },
    ]);
    renderHub();
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
    expect(screen.getByText('Deweloperzy').closest('a')?.getAttribute('href')).toBe(
      '/branza/deweloperzy/',
    );
    expect(screen.getByText('Dla Psychologów i Terapeutów')).toBeInTheDocument();
    expect(document.querySelector('[data-cms-error]')).toBeNull();
  });

  it('błąd CMS → CmsErrorState (bramka prerenderu), bez listy', async () => {
    vi.mocked(cmsService.getIndustryList).mockRejectedValue(new Error('HTTP 503'));
    renderHub();
    await waitFor(() => expect(document.querySelector('[data-cms-error]')).not.toBeNull());
  });

  it('pusta lista → też stan błędu (hub bez linków nie może trafić do prerenderu)', async () => {
    vi.mocked(cmsService.getIndustryList).mockResolvedValue([]);
    renderHub();
    await waitFor(() => expect(document.querySelector('[data-cms-error]')).not.toBeNull());
  });
});
