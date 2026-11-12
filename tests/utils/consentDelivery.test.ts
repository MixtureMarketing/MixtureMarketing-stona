import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ZARAZ_CONSENT_API_READY_EVENT,
  ZARAZ_GOOGLE_CONSENT_MODE,
  applyConsent,
  checkConsentValue,
  checkStoredConsent,
  resetConsentDeliveryForTests,
} from '@/utils/analytics';

/**
 * MIX-1389 K1/K2: przekazanie zgody do Zaraz czeka na Consent API, wartość z localStorage
 * przechodzi allowlistę (fail-closed), `google_consent_update` tylko za przełącznikiem.
 */

const installZaraz = (apiReady: boolean | undefined) => {
  const consentSet = vi.fn();
  const zarazSet = vi.fn();
  window.zaraz = {
    track: vi.fn(),
    set: zarazSet,
    consent: apiReady === undefined ? { set: consentSet } : { APIReady: apiReady, set: consentSet },
  };
  return { consentSet, zarazSet };
};

const fireApiReady = () => document.dispatchEvent(new Event(ZARAZ_CONSENT_API_READY_EVENT));

describe('applyConsent: dostarczenie do Zaraz (K1)', () => {
  beforeEach(() => {
    resetConsentDeliveryForTests();
  });
  afterEach(() => {
    resetConsentDeliveryForTests();
    delete window.zaraz;
    delete window.gtag;
  });

  it('API późne: nic przed zdarzeniem, dokładnie raz po zarazConsentAPIReady', () => {
    const { consentSet } = installZaraz(false);
    applyConsent({ analytics: true, marketing: false });
    expect(consentSet).not.toHaveBeenCalled();

    window.zaraz!.consent.APIReady = true;
    fireApiReady();
    expect(consentSet).toHaveBeenCalledTimes(1);
    expect(consentSet).toHaveBeenCalledWith({ kese: true, Pzjv: false });

    fireApiReady();
    expect(consentSet).toHaveBeenCalledTimes(1);
  });

  it('API późne: Zaraz w ogóle nie załadowany w chwili zgody, potem gotowy', () => {
    applyConsent({ analytics: true, marketing: true });
    const { consentSet } = installZaraz(true);
    expect(consentSet).not.toHaveBeenCalled();
    fireApiReady();
    expect(consentSet).toHaveBeenCalledTimes(1);
    expect(consentSet).toHaveBeenCalledWith({ kese: true, Pzjv: true });
  });

  it('API wczesne (APIReady=true): wysłane od razu, powtórka tej samej zgody nie dubluje', () => {
    const { consentSet } = installZaraz(true);
    applyConsent({ analytics: false, marketing: true });
    expect(consentSet).toHaveBeenCalledTimes(1);
    expect(consentSet).toHaveBeenCalledWith({ kese: false, Pzjv: true });

    applyConsent({ analytics: false, marketing: true });
    fireApiReady();
    expect(consentSet).toHaveBeenCalledTimes(1);
  });

  it('API nigdy: obiekt consent jest, ale APIReady=false i brak zdarzenia → nic nie wysłane', async () => {
    const { consentSet } = installZaraz(false);
    applyConsent({ analytics: true, marketing: true });
    await new Promise((r) => setTimeout(r, 20));
    expect(consentSet).not.toHaveBeenCalled();
  });

  it('API nigdy: brak window.zaraz → nic nie wysłane i bez wyjątku', () => {
    expect(() => applyConsent({ analytics: true, marketing: true })).not.toThrow();
    expect(window.zaraz).toBeUndefined();
  });

  it('zdarzenie bez funkcji consent.set nie zdejmuje oczekiwania; następne zdarzenie dostarcza', () => {
    applyConsent({ analytics: true, marketing: false });
    window.zaraz = { track: vi.fn(), consent: {} as never };
    fireApiReady();
    const { consentSet } = installZaraz(true);
    expect(consentSet).not.toHaveBeenCalled();
    fireApiReady();
    expect(consentSet).toHaveBeenCalledTimes(1);
  });

  it('przed gotowością wygrywa ostatnia decyzja (zgoda, potem cofnięcie → tylko cofnięcie)', () => {
    const { consentSet } = installZaraz(false);
    applyConsent({ analytics: true, marketing: true });
    applyConsent({ analytics: false, marketing: false });
    fireApiReady();
    expect(consentSet).toHaveBeenCalledTimes(1);
    expect(consentSet).toHaveBeenCalledWith({ kese: false, Pzjv: false });
  });

  it('cofnięcie po wysłanej zgodzie idzie do Zaraz (zmiana wartości nie jest dublem)', () => {
    const { consentSet } = installZaraz(true);
    applyConsent({ analytics: true, marketing: true });
    applyConsent({ analytics: false, marketing: false });
    expect(consentSet).toHaveBeenCalledTimes(2);
    expect(consentSet).toHaveBeenLastCalledWith({ kese: false, Pzjv: false });
  });

  it('wartość spoza allowlisty: ani gtag, ani Zaraz; poprawny bliźniak przechodzi', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const { consentSet } = installZaraz(true);
    applyConsent({ analytics: 'true', marketing: false } as never);
    expect(gtag).not.toHaveBeenCalled();
    expect(consentSet).not.toHaveBeenCalled();

    applyConsent({ analytics: true, marketing: false });
    expect(gtag).toHaveBeenCalledWith(
      'consent',
      'update',
      expect.objectContaining({ analytics_storage: 'granted', ad_storage: 'denied' }),
    );
    expect(consentSet).toHaveBeenCalledTimes(1);
  });
});

describe('applyConsent: google_consent_update za przełącznikiem (K2)', () => {
  beforeEach(() => resetConsentDeliveryForTests());
  afterEach(() => {
    resetConsentDeliveryForTests();
    delete window.zaraz;
  });

  it('przełącznik domyślnie wyłączony', () => {
    expect(ZARAZ_GOOGLE_CONSENT_MODE).toBe(false);
  });

  it('domyślnie zaraz.set NIE jest wołane', () => {
    const { consentSet, zarazSet } = installZaraz(true);
    applyConsent({ analytics: true, marketing: true });
    expect(consentSet).toHaveBeenCalledTimes(1);
    expect(zarazSet).not.toHaveBeenCalled();
  });

  it('po włączeniu: google_consent_update z 4 sygnałami v2, dopiero po gotowości API', () => {
    const { zarazSet } = installZaraz(false);
    applyConsent({ analytics: true, marketing: false }, { googleConsentMode: true });
    expect(zarazSet).not.toHaveBeenCalled();
    fireApiReady();
    expect(zarazSet).toHaveBeenCalledTimes(1);
    expect(zarazSet).toHaveBeenCalledWith('google_consent_update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
  });
});

describe('checkStoredConsent: allowlista wpisu (formy ataku, każda z bliźniakiem)', () => {
  const valid = '{"analytics":true,"marketing":false}';

  it('bliźniak dozwolony: poprawny wpis przechodzi', () => {
    expect(checkStoredConsent(valid)).toEqual({
      ok: true,
      consent: { analytics: true, marketing: false },
    });
  });

  it.each([
    // F1 podmieniona wartość
    [
      'F1 string zamiast boolean',
      '{"analytics":"true","marketing":false}',
      'odmowa: pole analytics nie jest true/false',
    ],
    [
      'F1 liczba zamiast boolean',
      '{"analytics":true,"marketing":1}',
      'odmowa: pole marketing nie jest true/false',
    ],
    [
      'F1 null w polu',
      '{"analytics":null,"marketing":false}',
      'odmowa: pole analytics nie jest true/false',
    ],
    // F2 śmieci JSON
    ['F2 uszkodzony JSON', '{zepsute', 'odmowa: uszkodzony JSON'],
    ['F2 pusty napis', '', 'odmowa: uszkodzony JSON'],
    ['F2 JSON-napis', '"granted"', 'odmowa: zgoda nie jest obiektem'],
    ['F2 JSON-tablica', '[true,true]', 'odmowa: zgoda nie jest obiektem'],
    ['F2 JSON null', 'null', 'odmowa: brak zapisanej zgody'],
    ['F2 JSON true', 'true', 'odmowa: zgoda nie jest obiektem'],
    // F3 obiekt niepełny
    ['F3 brak marketing', '{"analytics":true}', 'odmowa: brak pola marketing'],
    ['F3 brak analytics', '{"marketing":true}', 'odmowa: brak pola analytics'],
    ['F3 pusty obiekt', '{}', 'odmowa: brak pola analytics'],
    // F4 powtórzona stara wersja / obce pola
    [
      'F4 pole version',
      '{"analytics":true,"marketing":true,"version":1}',
      'odmowa: nieznane pole version',
    ],
    [
      'F4 __proto__',
      '{"__proto__":{"x":1},"analytics":true,"marketing":true}',
      'odmowa: nieznane pole __proto__',
    ],
    // F5 cofnięta zgoda (wpis usunięty)
  ])('%s → odmowa z powodem', (_name, raw, reason) => {
    expect(checkStoredConsent(raw)).toEqual({ ok: false, reason });
  });

  it('F5 brak wpisu (cofnięta/wyczyszczona zgoda) → odmowa; bliźniak: odmowa zapisana jako false/false przechodzi', () => {
    expect(checkStoredConsent(null)).toEqual({ ok: false, reason: 'odmowa: brak zapisanej zgody' });
    expect(checkStoredConsent('{"analytics":false,"marketing":false}')).toEqual({
      ok: true,
      consent: { analytics: false, marketing: false },
    });
  });

  it('checkConsentValue: obiekt nie-zwykły (klasa) → odmowa', () => {
    class Fake {
      analytics = true;
      marketing = true;
    }
    expect(checkConsentValue(new Fake())).toEqual({
      ok: false,
      reason: 'odmowa: zgoda nie jest zwykłym obiektem',
    });
  });
});
