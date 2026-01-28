/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { supabase } from './supabaseClient'; // Removed Supabase

declare global {
  interface Window {
    zaraz?: {
      track: (event: string, data?: Record<string, unknown>) => void;
    };
  }
}

export interface LeadBase {
  name: string;
  email: string;
  phone?: string;
  service_interest?: string; // e.g., 'web', 'marketing'
  recaptcha_token?: string;
  website_verify?: string;
}

export interface LeadDetails {
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

const API_URL = '/api/contact_submit.php';

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

    const id = generateUUID();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          source_url: window.location.href,
          website_verify: data.website_verify || '', // Honeypot
          lead: {
            id: id,
            ...data,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error');
      }

      // Return the lead object with ID
      const result = { id, ...data };

      // Track lead creation in Cloudflare Zaraz
      if (typeof window !== 'undefined' && window.zaraz) {
        window.zaraz.track('lead_start', {
          service: data.service_interest,
          source: 'contact_form_step_1',
        });
      }

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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          id: id,
          details: details,
          step: step,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error');
      }

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
      if (type === 'success' && typeof window !== 'undefined' && window.zaraz) {
        window.zaraz.track('contact_form_success', {
          lead_id: id,
        });
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
