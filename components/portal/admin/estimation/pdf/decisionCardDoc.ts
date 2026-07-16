import type { DecisionCard } from '@/lib/estimation/documents';
import { registerPlFont, PDF_FONT } from '@/lib/pdf/fontPl';
import { createLayout, rysujLogo, stopka } from '@/lib/pdf/layout';
import { KOLOR, ODSTEP, STRONA, TRACKING, TYPO, interlinia } from '@/lib/pdf/theme';
import { SITE_CONFIG } from '@/config/site';

// Karta decyzji technicznych — dokument WEWNĘTRZNY (załącznik do oferty / brief wykonawczy).
// Dwa wyjścia z tej samej struktury: markdown (do wklejenia jako kontekst projektu, plan F2
// „brief wykonawczy") i PDF (załącznik). Render, zero logiki — ta jest w documents.ts.
// Wymiary, kolory i rytm: lib/pdf/theme.ts (te same, co oferta — jedna rodzina dokumentów).

const M = STRONA.margines;
const PRAWA = STRONA.szerokosc - STRONA.margines;

const lvl = (d: { level: number; levelName: string | null }) =>
  `poziom ${d.level}${d.levelName ? ` — ${d.levelName}` : ''}`;

/** Markdown: „brief wykonawczy" do wklejenia jako kontekst projektu. */
export function decisionCardMarkdown(c: DecisionCard): string {
  const L: string[] = [];
  L.push(`# Karta decyzji technicznych — ${c.meta.projectName}`);
  L.push(
    `Wycena #${c.meta.quoteNumber}${c.meta.clientName ? ` · ${c.meta.clientName}` : ''} · ${c.meta.issuedAt}`,
  );
  L.push('');

  L.push('## Platforma');
  L.push(`- **Rekomendowana:** ${c.platform.recommended ?? '(brak rekomendacji)'}`);
  L.push(`- **Wybrana:** ${c.platform.chosen}`);
  if (c.platform.againstRecommendation) {
    L.push(`- ⚠️ **Wybór wbrew rekomendacji.** Powód: ${c.platform.reason ?? '(brak)'}`);
  } else if (c.platform.recommended) {
    L.push('- Zgodna z rekomendacją.');
  }
  if (!c.platform.againstRecommendation && c.platform.reason) {
    L.push(`- Powód: ${c.platform.reason}`);
  }
  L.push('');

  if (c.alerts.length) {
    L.push('## Alerty');
    c.alerts.forEach((a) => L.push(`- ⚠️ ${a}`));
    L.push('');
  }

  L.push('## Decyzje architektoniczne');
  for (const d of c.decisions) {
    L.push(`### ${d.title} — ${lvl(d)}`);
    if (d.levelDescription) L.push(d.levelDescription);
    if (d.reasons.length) {
      L.push('');
      L.push('**Dlaczego:**');
      d.reasons.forEach((r) => L.push(`- ${r}`));
    }
    if (d.fromArchetypeDefault)
      L.push(
        `- _Poziom domyślny dla archetypu **${c.platform.chosen}** — żadna reguła go nie podniosła._`,
      );
    if (d.overrideReason) L.push(`- 🖊️ Korekta ręczna: ${d.overrideReason}`);
    L.push('');
  }

  if (c.overrides.length) {
    L.push('## Odstępstwa od sugestii systemu');
    c.overrides.forEach((o) =>
      L.push(`- **${o.title}**: ${o.suggested} → ${o.chosen} — ${o.reason ?? '(bez powodu!)'}`),
    );
    L.push('');
  }

  if (c.outOfScope.length) {
    L.push('## Czego świadomie nie robimy');
    c.outOfScope.forEach((o) => L.push(`- **${o.title}** — ${o.reason ?? '(brak powodu)'}`));
    L.push('');
  }

  L.push('## Pewność i ryzyka');
  L.push(`- **Confidence:** ${c.confidence.score ?? '—'}%`);
  (c.confidence.breakdown ?? []).forEach((b) => L.push(`  - ${b.reason} (${b.delta})`));
  c.risks.forEach((r) =>
    L.push(`- **Mnożnik ryzyka:** ${r.name} (+${Math.round(r.value * 100)}%)`),
  );

  return L.join('\n');
}

export async function generateDecisionCardPdf(c: DecisionCard): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  await registerPlFont(doc);

  // ── Nagłówek: ta sama konstrukcja co oferta (jedna rodzina), ale plakietka
  // „dokument wewnętrzny" — Karta pokazuje Confidence, mnożniki ryzyka i powody
  // wyłączeń (INTERNAL_ONLY_FIELDS). Wysłana klientowi przez pomyłkę robi szkodę,
  // więc dokument ma o sobie mówić, czym jest — na każdej stronie.
  const dolLogo = await rysujLogo(doc, M, 16, 32);
  doc.setFillColor(KOLOR.tlo);
  doc.roundedRect(M, dolLogo + 1.5, 40, 5, 0.8, 0.8, 'F');
  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(TYPO.stopka);
  doc.setTextColor(KOLOR.uwaga);
  doc.setCharSpace(TRACKING);
  doc.text('DOKUMENT WEWNĘTRZNY', M + 2.5, dolLogo + 5);
  doc.setCharSpace(0);

  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(KOLOR.marka);
  doc.text('Karta decyzji technicznych', PRAWA, 20, { align: 'right' });
  doc.setFont(PDF_FONT, 'normal');
  doc.setFontSize(TYPO.drobny);
  doc.setTextColor(KOLOR.tekstSlaby);
  doc.text(
    `Wycena nr ${c.meta.quoteNumber}${c.meta.clientName ? ` · ${c.meta.clientName}` : ''}`,
    PRAWA,
    25.5,
    { align: 'right' },
  );
  doc.text(`Wystawiona: ${c.meta.issuedAt}`, PRAWA, 30.5, { align: 'right' });

  doc.setDrawColor(KOLOR.akcent);
  doc.setLineWidth(0.8);
  doc.line(M, 37, PRAWA, 37);

  const L = createLayout(doc, 46);
  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(TYPO.tytul);
  doc.setTextColor(KOLOR.marka);
  doc.text(c.meta.projectName, M, L.y);
  L.odstep(2);

  // Rekomendacja NAD wyborem: czytający ma najpierw zobaczyć, co radził system, a dopiero
  // potem co wybraliśmy — inaczej zgodność z rekomendacją wygląda tak samo jak jej brak.
  L.sekcja('Platforma');
  L.wiersz('Rekomendowana przez system', c.platform.recommended ?? '(brak rekomendacji)', {
    rozmiar: TYPO.tekst,
    kolor: KOLOR.tekstSlaby,
    grubo: false,
    rozmiarPrawo: TYPO.tekst,
  });
  L.wiersz('Wybrana', c.platform.chosen, {
    rozmiar: TYPO.tekst,
    kolor: KOLOR.tekstSlaby,
    grubo: false,
    rozmiarPrawo: TYPO.pozycja,
    kolorPrawo: KOLOR.tekst,
    gruboPrawo: true,
  });
  L.odstep(1.5);
  if (c.platform.againstRecommendation)
    L.tekst(`Wybór wbrew rekomendacji. Powód: ${c.platform.reason ?? '(brak)'}`, {
      kolor: KOLOR.uwaga,
    });
  else if (c.platform.recommended) L.tekst('Zgodna z rekomendacją.', { kolor: KOLOR.tekstSlaby });
  if (!c.platform.againstRecommendation && c.platform.reason)
    L.tekst(`Powód: ${c.platform.reason}`, { kolor: KOLOR.tekstSlaby });

  if (c.alerts.length) {
    L.sekcja('Alerty');
    L.punkty(c.alerts, { kolor: KOLOR.uwaga });
  }

  L.sekcja('Decyzje architektoniczne');
  for (const d of c.decisions) {
    // Tytuł decyzji nie zostaje sam na dole strony: rezerwujemy go razem z opisem poziomu
    // i pierwszym uzasadnieniem. Całego bloku nie rezerwujemy — decyzja z ośmioma powodami
    // wypchnęłaby pół pustej strony.
    const opis = d.levelDescription
      ? L.wysokoscTekstu(d.levelDescription, { rozmiar: 8.5, wciecie: 4 })
      : 0;
    const pierwszyPowod = d.reasons[0]
      ? L.wysokoscTekstu(`– ${d.reasons[0]}`, { rozmiar: 8.5, wciecie: 4 })
      : 0;
    L.lamStrone(interlinia(TYPO.pozycja) + opis + pierwszyPowod);
    L.wiersz(d.title, lvl(d));
    if (d.levelDescription)
      L.tekst(d.levelDescription, { rozmiar: 8.5, kolor: KOLOR.tekstSlaby, wciecie: 4 });
    // En dash, NIE strzałka: Manrope nie ma glifu U+2192 (patrz build-pdf-font.py).
    d.reasons.forEach((r) => L.tekst(`– ${r}`, { rozmiar: 8.5, kolor: '#374151', wciecie: 4 }));
    if (d.fromArchetypeDefault)
      L.tekst(
        `– Poziom domyślny dla archetypu ${c.platform.chosen} (żadna reguła nie podniosła).`,
        {
          rozmiar: 8.5,
          kolor: KOLOR.tekstSlaby,
          wciecie: 4,
        },
      );
    if (d.overrideReason)
      L.tekst(`Korekta: ${d.overrideReason}`, { rozmiar: 8.5, kolor: KOLOR.uwaga, wciecie: 4 });
    L.odstep(ODSTEP.miedzyPozycjami);
  }

  if (c.outOfScope.length) {
    L.sekcja('Czego świadomie nie robimy');
    L.punkty(c.outOfScope.map((o) => `${o.title} — ${o.reason ?? '(brak powodu)'}`));
  }

  L.sekcja('Pewność i ryzyka');
  L.wiersz('Confidence', `${c.confidence.score ?? '—'}%`, {
    rozmiar: TYPO.tekst,
    kolor: KOLOR.tekstSlaby,
    grubo: false,
    rozmiarPrawo: TYPO.pozycja,
    kolorPrawo: KOLOR.tekst,
    gruboPrawo: true,
  });
  (c.confidence.breakdown ?? []).forEach((b) =>
    L.tekst(`${b.reason} (${b.delta})`, { rozmiar: 8.5, kolor: KOLOR.tekstSlaby, wciecie: 4 }),
  );
  c.risks.forEach((r) =>
    L.tekst(`Mnożnik: ${r.name} (+${Math.round(r.value * 100)}%)`, {
      rozmiar: 8.5,
      kolor: KOLOR.tekstSlaby,
      wciecie: 4,
    }),
  );

  stopka(
    doc,
    [
      'Karta decyzji technicznych · dokument wewnętrzny — nie wysyłamy klientowi',
      SITE_CONFIG.companyName,
    ],
    [`Wycena nr ${c.meta.quoteNumber} · ${c.meta.issuedAt}`, '{strona}'],
  );
  return doc.output('blob');
}
