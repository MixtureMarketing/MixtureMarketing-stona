export const generatePdf = async (data: PdfData): Promise<Blob> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const { selections, result, contact } = data;

  // --- CONFIG ---
  const margin = 20;
  let y = 30;
  const lineHeight = 10;
  const brandColor = '#213261';
  const accentColor = '#61B6DE';

  // --- HEADER ---
  // Logo placeholder (text for now, can be image)
  doc.setFontSize(24);
  doc.setTextColor(brandColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Mixture Marketing', margin, y);

  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('Software House & Marketing Agency', margin, y);
  doc.text('ul. Piłsudskiego 17/4, Rzeszów', margin, y + 5);
  doc.text('kontakt@mixturemarketing.pl', margin, y + 10);

  // Date aligned right
  const date = new Date().toLocaleDateString('pl-PL');
  doc.text(`Data: ${date}`, 200 - margin, 30, { align: 'right' });

  // --- TITLE ---
  y += 40;
  doc.setDrawColor(accentColor);
  doc.setLineWidth(1);
  doc.line(margin, y, 200 - margin, y);

  y += 15;
  doc.setFontSize(18);
  doc.setTextColor(brandColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Wstępny Kosztorys Projektu', margin, y);

  // --- SUMMARY ---
  y += 20;
  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.text('Wybrana konfiguracja:', margin, y);

  y += 10;
  doc.setFontSize(11);
  doc.setTextColor(0);

  const addRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, y);
    y += 8;
  };

  const projectLabels: Record<string, string> = {
    landingPage: 'Landing Page',
    corporate: 'Strona Firmowa',
    ecommerce: 'Sklep Internetowy',
    webApp: 'Aplikacja Webowa / SaaS',
  };

  const designLabels: Record<string, string> = {
    template: 'Minimalistyczny / Template',
    custom: 'Custom Standard',
    premium: 'Premium / High-End',
  };

  addRow('Typ Projektu', projectLabels[selections.projectType] || selections.projectType);
  addRow('Design', designLabels[selections.designLevel] || selections.designLevel);

  if (selections.features.length > 0) {
    addRow('Funkcjonalności', selections.features.join(', '));
  }

  if (selections.marketing.length > 0) {
    addRow('Marketing', selections.marketing.join(', '));
  }

  // --- PRICING ---
  y += 20;
  doc.setFillColor(245, 247, 250); // Light gray bg
  doc.rect(margin, y, 170, 40, 'F');

  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(brandColor);
  doc.text('Szacunkowy Budżet:', margin + 10, y);

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const priceRange = `${result.minPrice.toLocaleString()} - ${result.maxPrice.toLocaleString()}`;
  doc.text(priceRange, margin + 10, y + 15);

  const priceWidth = doc.getTextWidth(priceRange);
  doc.setFontSize(14);
  doc.setTextColor(180, 180, 180); // Light gray
  doc.text(' PLN', margin + 10 + priceWidth, y + 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180); // Light gray
  doc.text('*Kwoty netto', margin + 120, y + 15);

  // --- TIME ---
  y += 40;
  doc.setFontSize(12);
  doc.setTextColor(brandColor);
  doc.text(
    `Przewidywany czas realizacji: ${result.minTime} - ${result.maxTime} tygodni`,
    margin,
    y,
  );

  // --- FOOTER ---
  const pageHeight = doc.internal.pageSize.height;
  y = pageHeight - 40;

  doc.setDrawColor(200);
  doc.line(margin, y, 200 - margin, y);

  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180); // Light gray
  doc.text(
    'Niniejszy dokument jest wstępnym szacunkiem i nie stanowi oferty handlowej w rozumieniu Kodeksu Cywilnego.',
    margin,
    y,
  );
  doc.text('Ostateczna wycena wymaga konsultacji i doprecyzowania specyfikacji.', margin, y + 5);

  y += 15;
  doc.setTextColor(brandColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Umów bezpłatną konsultację: +48 123 456 789 | www.mixturemarketing.pl', margin, y);

  return doc.output('blob');
};
