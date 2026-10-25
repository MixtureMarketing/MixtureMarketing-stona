import { trackEvent } from '@/utils/analytics';

export interface LeadBase {
  name: string;
  email: string;
  phone?: string;
  service_interest?: string; // e.g., 'web', 'marketing'
  captcha_token?: string;
  website_verify?: string;
}

interface LeadDetails {
  website?: string;
  budget?: string;
  message?: string;
  package_name?: string;
  // Dynamic fields storage
  [key: string]: string | number | boolean | undefined | Record<string, unknown>;
}

export interface Lead extends LeadBase, LeadDetails {
  id: string;
}

/**
 * Błąd wywołania /api/contact-submit z zachowanym statusem HTTP (0 = brak
 * połączenia), żeby formularz mógł pokazać właściwy komunikat zamiast zawsze
 * „Weryfikacja Turnstile nieudana”.
 */
export class LeadSubmitError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'LeadSubmitError';
  }
}

async function postLeadApi(body: unknown): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new LeadSubmitError(err instanceof Error ? err.message : 'Network error', 0);
  }
  if (!response.ok) {
    // 5xx bywa HTML-em z Cloudflare — response.json() wtedy rzuca.
    const data = (await response.json().catch(() => ({}))) as { message?: string; code?: string };
    throw new LeadSubmitError(data.message || 'Server error', response.status, data.code);
  }
  return response;
}

// Nowy CF Pages Function (zastapil legacy PHP backend).
// Implementacja: functions/api/contact-submit.ts
const API_URL = '/api/contact-submit';

// Tokeny edycji leadów (id → edit_token). Id i token wydaje serwer przy `create`;
// `update`, `send_notification` i `get_lead` bez tokenu dostają 403. Trzymane w pamięci
// modułu, żeby wywołujący (useContactForm) operowali wyłącznie na id — token nie trafia
// do stanu formularza, localStorage ani URL-a.
const editTokens = new Map<string, string>();

export const leadService = {
  /**
   * Creates a new lead via PHP backend.
   * Called after Step 1 of the contact form.
   */
  async createLead(data: LeadBase) {
    // Basic validation
    if (!data.email || !data.name) {
      throw new Error('Email and Name are required');
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // Phone regex check (optional but must be valid if provided)
    if (data.phone) {
      const phoneRegex = /^[+]?[0-9\s-]{9,20}$/;
      if (!phoneRegex.test(data.phone)) {
        throw new Error('Invalid phone format');
      }
    }

    try {
      const response = await postLeadApi({
        action: 'create',
        source_url: window.location.href,
        website_verify: data.website_verify || '', // Honeypot
        lead: data,
      });

      // Id i token edycji wydaje serwer (id od klienta jest ignorowane).
      const { id, edit_token } = (await response.json()) as { id?: string; edit_token?: string };
      if (!id || !edit_token) throw new LeadSubmitError('Server error', response.status);
      editTokens.set(id, edit_token);
      const result = { id, ...data };

      // Track lead creation in Cloudflare Zaraz
      trackEvent('lead_start', {
        service: data.service_interest,
        source: 'contact_form_step_1',
      });

      return result;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  /**
   * Updates an existing lead with additional details via PHP backend.
   * Called after Step 2/3 of the contact form.
   */
  async updateLead(id: string, details: LeadDetails, step?: number) {
    try {
      await postLeadApi({
        action: 'update',
        id: id,
        edit_token: editTokens.get(id),
        details: details,
        step: step,
      });

      return true;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  },

  /**
   * Triggers a specific email notification via PHP backend.
   * Can be used for 'abandoned_step_1', 'abandoned_step_2', or 'success'.
   */
  async sendNotification(id: string, type: 'abandoned_step_1' | 'abandoned_step_2' | 'success') {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_notification',
          id: id,
          edit_token: editTokens.get(id),
          type: type,
        }),
      });

      if (!response.ok) {
        // We generally don't want to throw/block UI for notification errors
        console.warn('Notification failed but proceeding:', await response.text());
        return false;
      }

      // Track full conversion in Cloudflare Zaraz
      if (type === 'success') {
        trackEvent('contact_form_success', { lead_id: id });
      }

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  },

  /**
   * Fetches an existing lead by ID to resume the form.
   * Wymaga tokenu edycji (link `?resume_lead=<id>&token=<edit_token>`).
   * POST, a nie GET — token nie ląduje w logach URL-i.
   */
  async getLead(id: string, editToken: string) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get_lead', id, edit_token: editToken }),
      });
      if (!response.ok) return null;

      const data = await response.json();
      if (data.lead) editTokens.set(id, editToken);
      return data.lead || null;
    } catch (error) {
      console.error('Error fetching lead:', error);
      return null;
    }
  },
};
