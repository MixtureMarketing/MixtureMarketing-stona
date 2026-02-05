import MixtureApiClient from './apiClient';

const API_URL = '/api/audit/run_audit';

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
    competitorUrl?: string,
    placeId?: string,
    force: boolean = false,
  ): Promise<AuditResult> {
    const json = await MixtureApiClient.post<{ data: AuditResult }>('/api/audit/run_audit', {
      url,
      competitorUrl,
      placeId,
      force,
    });

    return json.data;
  },

  async getAuditResult(
    auditId: string | number,
  ): Promise<{ data: AuditResult; meta: Record<string, unknown> }> {
    const json = await MixtureApiClient.get<{ data: AuditResult; meta: Record<string, unknown> }>(
      `/api/audit/get_result?auditId=${auditId}`,
    );

    return { data: json.data, meta: json.meta };
  },
};

