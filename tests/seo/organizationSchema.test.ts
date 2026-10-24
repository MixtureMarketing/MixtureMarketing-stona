import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { SITE_CONFIG } from '../../config/site';
import { getOrganizationSchema, ORG_ID, ORG_REF } from '../../utils/seo/organizationSchema';
import { getServiceSchema } from '../../utils/seo/serviceSchema';

describe('jedna encja firmy (#organization)', () => {
  it('ma jedno @id, jedną nazwę i jedno logo', () => {
    const org = getOrganizationSchema();
    expect(org['@id']).toBe(`${SITE_CONFIG.domain}/#organization`);
    expect(org.name).toBe(SITE_CONFIG.name);
    expect(org.legalName).toBe(SITE_CONFIG.companyName);
    expect(org.logo.url).toBe(`${SITE_CONFIG.domain}/assets/images/sygnet.png`);
  });

  it('Service.provider wskazuje na @id encji', () => {
    const svc = getServiceSchema({ name: 'X', description: 'Y' }, 'T', 'D');
    expect(svc?.provider).toEqual(ORG_REF);
    expect(ORG_REF['@id']).toBe(ORG_ID);
  });

  it('nikt poza organizationSchema.ts nie definiuje firmy od nowa (anonimowy Organization)', () => {
    const root = path.resolve(__dirname, '../..');
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) return e.name === 'portal' ? [] : walk(p);
        return /\.tsx?$/.test(e.name) ? [p] : [];
      });
    const files = [
      ...walk(path.join(root, 'components')),
      ...walk(path.join(root, 'utils')),
      path.join(root, 'App.tsx'),
    ];
    const anonymousOrg =
      /'@type':\s*'(Organization|ProfessionalService)',\s*\n?\s*name:\s*'Mixture Marketing/;
    const hits = files
      .filter((f) => !f.endsWith('organizationSchema.ts'))
      .filter((f) => anonymousOrg.test(fs.readFileSync(f, 'utf8')))
      .map((f) => path.relative(root, f));
    expect(hits).toEqual([]);
    // Footer nie emituje już własnego JSON-LD firmy.
    const footer = fs.readFileSync(path.join(root, 'components/layout/Footer.tsx'), 'utf8');
    expect(footer).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
