// MIX-1269: jednorazowy zrzut wzorca strony głównej z kodu bazowego (przełącznik pusty).
// Uruchamiany na SHA bazowym; wynik idzie na stdout (base64 między znacznikami) i do pliku.
import fs from 'node:fs';
import path from 'node:path';
import { it, vi } from 'vitest';
import { renderHomeSeo, snapshotHome } from '../../tests/helpers/homeSeoPage';

const mk = vi.hoisted(() => (name: string) => async () => {
  const R = await import('react');
  return { default: () => R.createElement('div', { 'data-mock': name, 'data-testid': name }) };
});
vi.mock('../../services/cmsService', () => ({
  cmsService: { getArticles: () => Promise.resolve([]) },
}));
vi.mock('../../components/visuals/hero/MixtureField', mk('field'));
vi.mock('../../components/common/StickyMobileBar', () => ({ default: () => null }));
vi.mock('../../components/sections/WhyUs', mk('whyus'));
vi.mock('../../components/sections/LeadMagnet', mk('leadmagnet'));
vi.mock('../../components/sections/KnowledgeBaseTeaser', mk('kb'));
vi.mock('../../components/sections/FinalBand', mk('final'));

it('zrzut wzorca', async () => {
  vi.stubEnv('VITE_MM_HOME_SEO', '');
  const { container } = await renderHomeSeo();
  const snap = JSON.stringify(snapshotHome(container), null, 2) + '\n';
  const out = path.resolve(__dirname, '../../tests/fixtures/mix1269/home-flag-off.json');
  fs.writeFileSync(out, snap);
  console.log('ZRZUT-START\n' + Buffer.from(snap).toString('base64') + '\nZRZUT-KONIEC');
});
