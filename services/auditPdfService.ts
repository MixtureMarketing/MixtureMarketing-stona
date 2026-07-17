import type { AuditResult } from './auditService';
import { getErrorDetails } from '../data/auditErrors';

/**
 * Raport PDF audytu 360 — generowany client-side (jspdf, lazy) z REALNYCH
 * pomiarów (scrape + PageSpeed Insights + Places) i wysyłany użytkownikowi
 * mailem przez /api/audit/capture-lead. Zbudowany 2026-07-17 na decyzję
 * właściciela: bramka obiecywała PDF, który wcześniej nie istniał.
 * Wzorzec: services/pdfService.ts (kalkulator wycen).
 */
export const generateAuditPdf = async (result: AuditResult): Promise<Blob> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const { client } = result;

  const margin = 20;
  const pageW = 210;
  let y = 26;
  const brandColor = '#213261';
  const accentColor = '#61B6DE';

  const newPageIfNeeded = (needed = 12) => {
    if (y > 285 - needed) {
      doc.addPage();
      y = 24;
    }
  };

  // --- HEADER ---
  doc.setFontSize(22);
  doc.setTextColor(brandColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Mixture Marketing', margin, y);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('Audyt 360 — SEO, wydajność, analityka', margin, y + 7);
  doc.text(`Data: ${new Date().toLocaleDateString('pl-PL')}`, pageW - margin, y, {
    align: 'right',
  });

  y += 16;
  doc.setDrawColor(accentColor);
  doc.setLineWidth(1);
  doc.line(margin, y, pageW - margin, y);

  // --- BADANA STRONA + WYNIK ---
  y += 12;
  doc.setFontSize(14);
  doc.setTextColor(brandColor);
  doc.setFont('helvetica', 'bold');
  const urlLines = doc.splitTextToSize(`Badana strona: ${client.url}`, pageW - 2 * margin);
  doc.text(urlLines, margin, y);
  y += urlLines.length * 7 + 4;

  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y, pageW - 2 * margin, 20, 'F');
  doc.setFontSize(12);
  doc.text('Indeks zdrowia witryny:', margin + 6, y + 12);
  doc.setFontSize(18);
  doc.text(`${client.total_score}/100`, pageW - margin - 6, y + 13, { align: 'right' });
  y += 30;

  // --- POMIARY ---
  doc.setFontSize(13);
  doc.text('Zmierzone parametry (Google PageSpeed Insights)', margin, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(40);

  const row = (label: string, value: string) => {
    newPageIfNeeded();
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 90, y);
    y += 7;
  };

  const m = client.metrics;
  row('LCP (główna treść)', `${m.lcp_value.toFixed(1)} s (próg Google: 2,5 s)`);
  if (typeof m.cls_value === 'number') row('CLS (stabilność układu)', m.cls_value.toFixed(3));
  if (m.scores) {
    row('Wydajność', `${m.scores.performance}/100`);
    row('SEO (Lighthouse)', `${m.scores.seo}/100`);
    row('Dostępność', `${m.scores.accessibility}/100`);
    row('Dobre praktyki', `${m.scores.best_practices}/100`);
  }

  // --- TECHNOLOGIA / ANALITYKA ---
  y += 4;
  newPageIfNeeded(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(brandColor);
  doc.text('Wykryte na stronie', margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(40);
  const yesNo = (v: boolean | undefined) => (v ? 'TAK' : 'NIE');
  row('Certyfikat SSL', yesNo(client.tech.ssl));
  row('Google Analytics 4', yesNo(client.tech.analytics));
  row('Google Tag Manager', yesNo(client.tech.gtm));
  row('Piksel Meta', yesNo(client.tech.pixel));
  row('Dane strukturalne (schema.org)', yesNo(client.tech.schema_org));
  row('Zdjęcia bez opisu ALT', `${client.content.images_no_alt} z ${client.content.images_count}`);
  if (client.reputation && client.reputation.reviews_count > 0) {
    row(
      'Google Places',
      `${client.reputation.rating.toFixed(1)}/5 (${client.reputation.reviews_count} opinii)`,
    );
  }

  // --- WYKRYTE PROBLEMY ---
  const details = getErrorDetails(
    m.lcp_value,
    client.reputation?.reviews_count ?? 0,
    client.reputation?.rating ?? 0,
  );
  const issues = Object.entries(client.audit_results || {})
    .filter(([key, failed]) => failed && details[key])
    .map(([key]) => details[key]);

  if (issues.length > 0) {
    y += 4;
    newPageIfNeeded(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(brandColor);
    doc.text(`Wykryte problemy (${issues.length})`, margin, y);
    y += 8;
    doc.setFontSize(10);
    for (const issue of issues) {
      newPageIfNeeded(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40);
      doc.text(`• ${issue.title}`, margin, y);
      y += 5.5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90);
      const descLines = doc.splitTextToSize(issue.desc, pageW - 2 * margin - 6);
      doc.text(descLines, margin + 4, y);
      y += descLines.length * 5 + 4;
    }
  }

  // --- STOPKA ---
  newPageIfNeeded(30);
  y = Math.max(y + 6, 250);
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    'Raport wygenerowany automatycznie z pomiarów: kod strony, Google PageSpeed Insights, Google Places.',
    margin,
    y,
  );
  doc.text(
    'Audyt automatyczny wykrywa część problemów — pełny audyt robi człowiek. Odpowiedz na maila, chętnie pomożemy.',
    margin,
    y + 5,
  );
  y += 14;
  doc.setTextColor(brandColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Mixture Marketing · mixturemarketing.pl · info@mixturemarketing.pl', margin, y);

  return doc.output('blob');
};
