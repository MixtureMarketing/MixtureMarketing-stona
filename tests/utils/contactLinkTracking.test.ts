import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { installContactLinkTracking } from '@/utils/analytics';

/**
 * MIX-1457: klik w tel: / mailto: = dokladnie jedno zdarzenie click_phone / click_email (P4)
 * z jednym parametrem link_location; numer, adres, temat i sciezka nie ida do GA4.
 */
let track: Mock<(event: string, data?: Record<string, unknown>) => void>;
let off: () => void;

beforeEach(() => {
  track = vi.fn<(event: string, data?: Record<string, unknown>) => void>();
  window.zaraz = { track, consent: { set: vi.fn() } };
  window.dataLayer = [];
  // jsdom nie nawiguje do tel:/mailto:, ale bez nawigacji test jest pewniejszy
  document.addEventListener('click', prevent);
  off = installContactLinkTracking();
});
afterEach(() => {
  off();
  document.removeEventListener('click', prevent);
  delete window.zaraz;
  delete window.dataLayer;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});
function prevent(e: Event) {
  e.preventDefault();
}

const clickIn = (html: string, selector = '#x') => {
  document.body.innerHTML = html;
  (document.querySelector(selector) as HTMLElement).dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true }),
  );
};

const onlyLocation = (event: string, location: string) => {
  expect(track).toHaveBeenCalledTimes(1);
  expect(track).toHaveBeenCalledWith(event, { link_location: location });
  const payload = JSON.stringify(track.mock.calls[0]);
  expect(payload).not.toMatch(/@|\d{3}|subject|mailto|tel:/i);
  expect(window.dataLayer).toHaveLength(0);
};

describe('tel: i mailto:', () => {
  it('tel: w tresci -> click_phone {section}', () => {
    clickIn('<main><a id="x" href="tel:+48123456789">zadzwon</a></main>');
    onlyLocation('click_phone', 'section');
  });

  it('tel: ze spacjami i spacja przed schematem -> click_phone bez numeru', () => {
    clickIn('<a id="x" href="  tel:+48 123 456 789 ">t</a>');
    onlyLocation('click_phone', 'section');
  });

  it('tabulator wewnatrz schematu (WHATWG go usuwa) -> click_phone', () => {
    clickIn('<a id="x" href="t\tel:600100200">t</a>');
    onlyLocation('click_phone', 'section');
  });

  it('mailto z ?subject= w stopce -> click_email {footer}, bez adresu i tematu', () => {
    clickIn('<footer><a id="x" href="mailto:a@b.pl?subject=Oferta%20600100200">m</a></footer>');
    onlyLocation('click_email', 'footer');
  });

  it('MAILTO: wielkimi literami w naglowku -> click_email {header}', () => {
    clickIn('<header><nav><a id="x" href="MAILTO:INFO@B.PL">m</a></nav></header>');
    onlyLocation('click_email', 'header');
  });

  it('klik w element zagniezdzony w linku -> jedno zdarzenie', () => {
    clickIn('<header><a href="tel:600100200"><span><b id="x">ikona</b></span></a></header>');
    onlyLocation('click_phone', 'header');
  });

  it('najblizszy przodek decyduje: header wewnatrz footer -> header', () => {
    clickIn('<footer><header><a id="x" href="tel:600100200">t</a></header></footer>');
    onlyLocation('click_phone', 'header');
  });

  it('SVG <a xlink:href="tel:"> w stopce -> click_phone {footer}', () => {
    clickIn(
      '<footer><svg xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<a xlink:href="tel:600100200"><text id="x">t</text></a></svg></footer>',
    );
    onlyLocation('click_phone', 'footer');
  });

  it('area z tel: -> click_phone', () => {
    clickIn('<map name="m"><area id="x" href="tel:600100200" alt="t"></map>');
    onlyLocation('click_phone', 'section');
  });
});

describe('blizniaki bez zdarzenia', () => {
  it.each([
    ['zwykly link', '<a id="x" href="/kontakt/">k</a>'],
    ['link https z tel w sciezce', '<a id="x" href="https://example.com/tel:600100200">k</a>'],
    ['tekst tel: bez linku', '<p id="x">tel:600100200</p>'],
    ['a bez href', '<a id="x">tel:600100200</a>'],
    [
      'SVG xlink:href https',
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="/kontakt/"><text id="x">k</text></a></svg>',
    ],
    ['sms:', '<a id="x" href="sms:600100200">s</a>'],
  ])('%s', (_label, html) => {
    clickIn(html);
    expect(track).not.toHaveBeenCalled();
  });

  it('po odinstalowaniu brak zdarzen', () => {
    off();
    clickIn('<a id="x" href="tel:600100200">t</a>');
    expect(track).not.toHaveBeenCalled();
    off = () => undefined;
  });
});
