import { describe, it, expect } from 'vitest';
import { normalizeTeamMember } from '../../utils/teamMember';
import { SanityTeamMember } from '../../types/sanity';

describe('normalizeTeamMember (/o-nas/)', () => {
  it('przycina spacje w nazwisku i stanowisku, poprawia literówkę „Desing"', () => {
    const m = normalizeTeamMember({
      _id: '1',
      name: 'Karol Mierzwa ',
      role: 'Desing ',
    } as SanityTeamMember);
    expect(m.name).toBe('Karol Mierzwa');
    expect(m.role).toBe('Design');
  });

  it('email: null → brak pola (nie „email": null w JSON-LD)', () => {
    const m = normalizeTeamMember({
      _id: '2',
      name: 'Alicja Piwońska ',
      role: 'UI Designer',
      email: null,
    } as unknown as SanityTeamMember);
    expect(m.email).toBeUndefined();
    expect(JSON.stringify({ email: m.email })).toBe('{}');
  });

  it('nie rusza poprawnych danych', () => {
    const input: SanityTeamMember = {
      _id: '3',
      name: 'Jakub Niedziela',
      role: 'CEO',
      email: 'info@mixturemarketing.pl',
      linkedin: 'https://pl.linkedin.com/in/x',
    };
    expect(normalizeTeamMember(input)).toEqual(input);
  });
});
