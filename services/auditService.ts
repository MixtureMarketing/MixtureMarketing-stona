// services/auditService.ts
const API_URL = '/api/audit/run_audit';
const CAPTURE_URL = '/api/audit/capture-lead';

export interface AuditResult {
  client: {
    url: string;
    total_score: number;
    metrics: {
      lcp_value: number; // Seconds
      cls_value?: number;
      speed_score: number;
      scores?: {
        performance: number;
        accessibility: number;
        seo: number;
        best_practices: number;
      };
      opportunities?: Array<{
        id: string;
        title: string;
        savings: number;
      }>;
    };
    tech: {
      gtm: boolean;
      pixel: boolean;
      analytics: boolean;
      ssl: boolean;
      schema_org?: boolean;
      favicon?: boolean;
      is_ecommerce?: boolean;
      cms?: string[];
    };
    seo: {
      title: string | null;
      h1: string | null;
      description: string | null;
      canonical?: string | null;
      robots?: string | null;
      local?: {
        city: string | null;
        in_title: boolean;
        in_h1: boolean;
        in_content: boolean;
      };
    };
    content: {
      images_count: number;
      images_no_alt: number;
      h1_count: number;
      h2_count: number;
      h3_count: number;
      text_ratio: number;
      word_count: number;
      details?: {
        images_missing_alt: string[];
        headings: Array<{ tag: string; text: string }>;
      };
    };
    social?: Record<string, boolean>; // Now includes og_tags
    security?: {
      headers: Record<string, boolean>;
    };
    reputation: {
      rating: number;
      reviews_count: number;
      score: number;
    };
    audit_results: Record<string, boolean>;
    screenshot: string | null;
  };
  competitor?: {
    url: string;
    psi_score: number;
  };
}

export const auditService = {
  async runAudit(
    url: string,
    companyName: string = '',
    force: boolean = true,
  ): Promise<AuditResult> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, companyName, force }),
    });

    if (!response.ok) {
      throw new Error('Audit failed');
    }

    const json = await response.json();
    return json.data;
  },

  // Zapis leada po przejsciu bramki e-mail (source='audit') + wysyłka raportu
  // PDF do użytkownika (multipart — wzorzec kalkulatora). Best-effort — nie blokuje UI.
  async captureLead(payload: {
    email: string;
    url: string;
    companyName?: string;
    score?: number;
    pdf?: Blob;
  }): Promise<void> {
    try {
      const form = new FormData();
      form.append('email', payload.email);
      form.append('url', payload.url);
      if (payload.companyName) form.append('companyName', payload.companyName);
      if (typeof payload.score === 'number') form.append('score', String(payload.score));
      if (payload.pdf) form.append('pdf', payload.pdf, 'audyt_mixture.pdf');
      await fetch(CAPTURE_URL, { method: 'POST', body: form });
    } catch {
      /* nie przerywamy flow raportu, jesli zapis leada sie nie uda */
    }
  },
};
