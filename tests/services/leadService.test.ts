import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { leadService, LeadSubmitError } from '../../services/leadService';

// Mock global fetch
global.fetch = vi.fn();

describe('leadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('should call the API with correct parameters for abandoned_step_1', async () => {
      // Setup mock response
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success' }),
      });

      const leadId = 'test-uuid-123';
      const type = 'abandoned_step_1';

      const result = await leadService.sendNotification(leadId, type);

      expect(global.fetch).toHaveBeenCalledWith('/api/contact-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_notification',
          id: leadId,
          edit_token: undefined, // lead nieutworzony w tej sesji — brak tokenu
          type: type,
        }),
      });
      expect(result).toBe(true);
    });

    it('should return false if API call fails', async () => {
      // Setup mock error response
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        text: async () => 'Server Error',
      });

      const result = await leadService.sendNotification('123', 'success');

      expect(result).toBe(false);
      // Ensure we didn't throw
    });
  });

  describe('createLead', () => {
    it('should return lead object with the server-issued ID on success', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, id: 'srv-id-1', edit_token: 'tok-1' }),
      });

      const leadData = { name: 'Test', email: 'test@example.com' };
      const result = await leadService.createLead(leadData);

      expect(result).toMatchObject(leadData);
      expect(result.id).toBe('srv-id-1');
      // Id generuje serwer — klient go nie wysyła.
      const sent = JSON.parse((global.fetch as Mock).mock.calls[0][1].body);
      expect(sent.lead.id).toBeUndefined();
    });

    it('dokleja token edycji wydany przy create do update i send_notification', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, id: 'srv-id-2', edit_token: 'tok-2' }),
      });
      await leadService.createLead({ name: 'Test', email: 'test@example.com' });
      await leadService.updateLead('srv-id-2', { budget: '5k' }, 2);
      await leadService.sendNotification('srv-id-2', 'success');

      const bodies = (global.fetch as Mock).mock.calls.map((c) => JSON.parse(c[1].body));
      expect(bodies[1]).toMatchObject({ action: 'update', id: 'srv-id-2', edit_token: 'tok-2' });
      expect(bodies[2]).toMatchObject({
        action: 'send_notification',
        id: 'srv-id-2',
        edit_token: 'tok-2',
      });
    });

    it('rzuca błąd, gdy serwer nie zwrócił id i tokenu (kroki 2–3 i tak by padły)', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      await expect(
        leadService.createLead({ name: 'Test', email: 'test@example.com' }),
      ).rejects.toThrow('Server error');
    });

    it('should throw error if email/name missing', async () => {
      await expect(leadService.createLead({ email: '', name: '' })).rejects.toThrow(
        'Email and Name are required',
      );
    });

    it('błąd serwera → LeadSubmitError ze statusem i kodem (także przy HTML zamiast JSON)', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Nie udało się zapisać', code: 'LEAD_NOT_SAVED' }),
      });
      const err = await leadService
        .createLead({ name: 'T', email: 't@example.com' })
        .catch((e) => e);
      expect(err).toBeInstanceOf(LeadSubmitError);
      expect(err).toMatchObject({ status: 500, code: 'LEAD_NOT_SAVED' });

      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => {
          throw new SyntaxError('Unexpected token <');
        },
      });
      await expect(
        leadService.createLead({ name: 'T', email: 't@example.com' }),
      ).rejects.toMatchObject({ status: 502 });
    });

    it('brak sieci → LeadSubmitError ze statusem 0', async () => {
      (global.fetch as Mock).mockRejectedValueOnce(new TypeError('Failed to fetch'));
      await expect(
        leadService.createLead({ name: 'T', email: 't@example.com' }),
      ).rejects.toMatchObject({ status: 0 });
    });
  });
});
