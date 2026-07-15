import type { DecisionCard } from '@/lib/estimation/documents';
import { registerPlFont, PDF_FONT } from './fontPl';

// Karta decyzji technicznych — dokument WEWNĘTRZNY (załącznik do oferty / brief wykonawczy).
// Dwa wyjścia z tej samej struktury: markdown (do wklejenia jako kontekst projektu, plan F2
// „brief wykonawczy") i PDF (załącznik). Render, zero logiki — ta jest w documents.ts.

const BRAND = '#213261';
const GRAY = '#6b7280';
const M = 18;
const W = 210;

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
  L.push(`- **Wybrana:** ${c.platform.chosen}`);
  if (c.platform.recommended) L.push(`- **Rekomendacja systemu:** ${c.platform.recommended}`);
  if (c.platform.againstRecommendation) {
    L.push(`- ⚠️ **Wybór wbrew rekomendacji.** Powód: ${c.platform.reason ?? '(brak)'}`);
  } else if (c.platform.reason) {
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
  let y = 20;

  const brk = (need = 12) => {
    if (y + need > 280) {
      doc.addPage();
      y = 20;
    }
  };
  const h = (t: string, size = 12) => {
    brk(14);
    doc.setFont(PDF_FONT, 'bold');
    doc.setFontSize(size);
    doc.setTextColor(BRAND);
    doc.text(t, M, y);
    y += size / 2 + 3;
  };
  const p = (t: string, size = 9, color = '#111827') => {
    doc.setFont(PDF_FONT, 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color);
    for (const line of doc.splitTextToSize(t, W - 2 * M) as string[]) {
      brk();
      doc.text(line, M, y);
      y += size / 2 + 1.6;
    }
  };

  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(BRAND);
  doc.text('Karta decyzji technicznych', M, y);
  y += 7;
  p(
    `${c.meta.projectName} · wycena #${c.meta.quoteNumber}${c.meta.clientName ? ` · ${c.meta.clientName}` : ''} · ${c.meta.issuedAt}`,
    8.5,
    GRAY,
  );
  y += 5;

  h('Platforma');
  p(
    `Wybrana: ${c.platform.chosen}${c.platform.recommended ? ` · rekomendacja systemu: ${c.platform.recommended}` : ''}`,
  );
  if (c.platform.againstRecommendation)
    p(`Wybór wbrew rekomendacji. Powód: ${c.platform.reason ?? '(brak)'}`, 9, '#b45309');
  else if (c.platform.reason) p(`Powód: ${c.platform.reason}`, 9, GRAY);
  y += 3;

  if (c.alerts.length) {
    h('Alerty');
    c.alerts.forEach((a) => p(`• ${a}`, 9, '#b45309'));
    y += 3;
  }

  h('Decyzje architektoniczne');
  for (const d of c.decisions) {
    brk(14);
    doc.setFont(PDF_FONT, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor('#111827');
    doc.text(`${d.title} — ${lvl(d)}`, M, y);
    y += 5;
    if (d.levelDescription) p(`   ${d.levelDescription}`, 8.5, GRAY);
    d.reasons.forEach((r) => p(`   → ${r}`, 8.5, '#374151'));
    if (d.overrideReason) p(`   Korekta: ${d.overrideReason}`, 8.5, '#b45309');
    y += 1;
  }
  y += 2;

  if (c.outOfScope.length) {
    h('Czego świadomie nie robimy');
    c.outOfScope.forEach((o) => p(`• ${o.title} — ${o.reason ?? '(brak powodu)'}`));
    y += 3;
  }

  h('Pewność i ryzyka');
  p(`Confidence: ${c.confidence.score ?? '—'}%`);
  (c.confidence.breakdown ?? []).forEach((b) => p(`   ${b.reason} (${b.delta})`, 8.5, GRAY));
  c.risks.forEach((r) => p(`   Mnożnik: ${r.name} (+${Math.round(r.value * 100)}%)`, 8.5, GRAY));

  return doc.output('blob');
}
