// services/auditService.ts
const API_URL = '/api/audit/run_audit';
const CAPTURE_URL = '/api/audit/capture-lead';

export interface AuditResult {
  client: {
    url: string;
    /** ISO czas pomiaru (od MIX-893; starsze wpisy cache go nie mają). */
    generated_at?: string;
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
    /**
     * Wynik częściowy: któreś źródło było niedostępne (timeout, błąd sieci, strona
     * błędu) — `scrape` = treść strony, `reputation` = Google Places. Kary za
     * niezmierzone elementy nie są wtedy naliczane.
     */
    partial?: boolean;
    unavailable?: Array<'scrape' | 'reputation'>;
  };
  competitor?: {
    url: string;
    psi_score: number;
  };
  /** Ustawione, gdy to wynik z cache, bo pomiar na żywo nie zdążył (np. „Wynik z 04.11.2026, 10:15, …”). */
  notice?: string;
}

/** Błąd odpowiedzi serwera audytu: status HTTP + komunikat z pola `message`. */
export class AuditError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AuditError';
  }
}

export interface CaptureLeadResult {
  ok: boolean;
  /** Status HTTP; 0 = błąd sieci (fetch odrzucony). */
  status: number;
}

export const auditService = {
  // MIX-1324: serwer wymaga tokenu Turnstile; `force` (pomijanie cache) usunięty.
  // Błąd (AuditError) niesie status HTTP i komunikat serwera (np. 429 = limit z bramki).
  async runAudit(
    url: string,
    companyName: string = '',
    captchaToken?: string,
  ): Promise<AuditResult> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, companyName, captcha_token: captchaToken }),
    });

    if (!response.ok) {
      // Serwer zwraca { status:'error', message } — przekazujemy komunikat do UI
      // (wcześniej ginął i użytkownik zawsze czytał „Sprawdź adres URL”).
      let message = '';
      try {
        const body = (await response.json()) as { message?: unknown };
        if (typeof body?.message === 'string') message = body.message;
      } catch {
        /* odpowiedź nie-JSON (np. strona błędu brzegu) — bez komunikatu serwera */
      }
      throw new AuditError(response.status, message);
    }

    const json = await response.json();
    return typeof json.notice === 'string' ? { ...json.data, notice: json.notice } : json.data;
  },

  // Zapis leada po przejsciu bramki e-mail (source='audit') + wysyłka raportu
  // PDF do użytkownika (multipart — wzorzec kalkulatora). Nie blokuje raportu online,
  // ale WYNIK wraca do UI: przy 403 (captcha), 429 czy 5xx PDF nie wychodzi, a użytkownik
  // musi się o tym dowiedzieć (wcześniej odpowiedź była ignorowana i lead ginął po cichu).
  // Nigdy nie rzuca; status 0 = błąd sieci.
  async captureLead(payload: {
    email: string;
    url: string;
    companyName?: string;
    score?: number;
    pdf?: Blob;
    captchaToken?: string;
  }): Promise<CaptureLeadResult> {
    try {
      const form = new FormData();
      form.append('email', payload.email);
      form.append('url', payload.url);
      if (payload.companyName) form.append('companyName', payload.companyName);
      if (typeof payload.score === 'number') form.append('score', String(payload.score));
      if (payload.pdf) form.append('pdf', payload.pdf, 'audyt_mixture.pdf');
      if (payload.captchaToken) form.append('captcha_token', payload.captchaToken);
      const res = await fetch(CAPTURE_URL, { method: 'POST', body: form });
      return { ok: res.ok, status: res.status };
    } catch {
      return { ok: false, status: 0 };
    }
  },
};
