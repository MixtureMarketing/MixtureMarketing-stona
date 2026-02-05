import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { leadService } from '../../services/leadService';

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

          expect(global.fetch).toHaveBeenCalledWith('/api/contact_submit', {
            method: 'POST',        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_notification',
          id: leadId,
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
    it('should return lead object with an ID on success', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success' }),
      });

      const leadData = { name: 'Test', email: 'test@example.com' };
      const result = await leadService.createLead(leadData);

      expect(result).toMatchObject(leadData);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
    });

    it('should throw error if email/name missing', async () => {
      await expect(leadService.createLead({ email: '', name: '' })).rejects.toThrow(
        'Email and Name are required',
      );
    });
  });
});
