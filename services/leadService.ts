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

// Simple UUID generator (Client-side)
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Nowy CF Pages Function (zastapil legacy PHP backend).
// Implementacja: functions/api/contact-submit.ts
const API_URL = '/api/contact-submit';

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

    const id = generateUUID();

    try {
      await postLeadApi({
        action: 'create',
        source_url: window.location.href,
        website_verify: data.website_verify || '', // Honeypot
        lead: {
          id: id,
          ...data,
        },
      });

      // Return the lead object with ID
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
   */
  async getLead(id: string) {
    try {
      // Use GET request with query params
      const response = await fetch(`${API_URL}?action=get_lead&id=${id}`);
      if (!response.ok) return null;

      const data = await response.json();
      return data.lead || null;
    } catch (error) {
      console.error('Error fetching lead:', error);
      return null;
    }
  },
};
