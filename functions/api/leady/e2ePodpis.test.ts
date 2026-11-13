// Podpis ponowienia w skrypcie e2e (scripts/test-e2e-linear-lead.mjs) musi być identyczny
// z podpisem sprawdzanym po stronie funkcji (crm/_podpis.ts, prefiks `leady-ponow:v1:`).
import { describe, it, expect } from 'vitest';
import { podpisPonow } from '../../../scripts/test-e2e-linear-lead.mjs';
import { podpiszZapytanie } from '../crm/_podpis';
import { PREFIKS_PONOW } from './ponow';

const SEKRET = 'sekret-ponow-TESTOWY-0123456789abcdef';
const NONCE = '123e4567-e89b-42d3-a456-426614174000';

describe('podpis ponow w skrypcie e2e', () => {
  it('jest zgodny z podpisem po stronie funkcji', async () => {
    expect(podpisPonow(SEKRET, '1760000000', NONCE)).toBe(
      await podpiszZapytanie(
        SEKRET,
        '1760000000',
        NONCE,
        'POST',
        '/api/leady/ponow',
        PREFIKS_PONOW,
      ),
    );
  });
  it('podpis z prefiksem CRM (inny kierunek) się różni', async () => {
    expect(podpisPonow(SEKRET, '1760000000', NONCE)).not.toBe(
      await podpiszZapytanie(SEKRET, '1760000000', NONCE, 'POST', '/api/leady/ponow'),
    );
  });
});
