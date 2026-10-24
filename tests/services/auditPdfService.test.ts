import { describe, it, expect } from 'vitest';
import { generateAuditPdf } from '@/services/auditPdfService';
import type { AuditResult } from '@/services/auditService';

// REALNY render PDF (bez mocka jspdf) — bug żył między stringiem a glifem:
// wbudowana helvetica (WinAnsi) nie ma ą ć ę ł ń ś ź ż, więc lead dostawał
// „wydajno[", „gBówna tre[", „Zdjcia", „Mo|na". Mock jspdf by tego nie złapał.

async function pdfText(blob: Blob): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  // Blob z jsPDF pod jsdom nie ma arrayBuffer() — czytamy przez FileReader.
  const buf = await new Promise<Buffer>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(Buffer.from(fr.result as ArrayBuffer));
    fr.onerror = () => reject(fr.error);
    fr.readAsArrayBuffer(blob);
  });
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

const RESULT: AuditResult = {
  client: {
    url: 'https://zażółć-gęślą-jaźń.pl/',
    total_score: 61,
    metrics: {
      lcp_value: 3.1,
      cls_value: 0.05,
      speed_score: 55,
      scores: { performance: 55, accessibility: 80, seo: 90, best_practices: 75 },
    },
    tech: { gtm: false, pixel: false, analytics: true, ssl: true, schema_org: false },
    seo: { title: 'T', h1: 'H', description: null },
    content: {
      images_count: 10,
      images_no_alt: 3,
      h1_count: 1,
      h2_count: 2,
      h3_count: 0,
      text_ratio: 0.2,
      word_count: 400,
    },
    reputation: { rating: 4.5, reviews_count: 12, score: 80 },
    audit_results: { MED_LCP: true, NO_CITY_KEYWORD: true },
    screenshot: null,
  },
};

describe('generateAuditPdf — polskie znaki', () => {
  it('tekst PDF zawiera poprawne polskie znaki (nie WinAnsi-krzaki)', async () => {
    const text = await pdfText(await generateAuditPdf(RESULT));
    for (const s of [
      'wydajność',
      'główna treść',
      'Zdjęcia bez opisu ALT',
      'Można Szybciej',
      'Dostępność',
      'działa w konkretnym mieście',
      'zażółć-gęślą-jaźń.pl',
      // Znaki spoza Latin-1/Ext-A użyte w szablonie — muszą mieć glif w subsecie.
      '• Można',
      'Audyt 360 — SEO',
      'Mixture Marketing · mixturemarketing.pl',
    ]) {
      expect(text, `brak frazy: ${s}`).toContain(s);
    }
    // Krzaki z helvetiki — nie mogą wrócić.
    expect(text).not.toMatch(/wydajno\[|gBówna|Mo\|na/);
  });
});
