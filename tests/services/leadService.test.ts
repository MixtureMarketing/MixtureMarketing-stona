/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { leadService } from '../../services/leadService';

// Mock MixtureApiClient
vi.mock('../../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import MixtureApiClient from '../../services/apiClient';

describe('leadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('createLead should call API with correct data', async () => {
    const mockData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '123456789',
      service_interest: 'web',
    };

    (MixtureApiClient.post as any).mockResolvedValue({ status: 'success' });

    const result = await leadService.createLead(mockData);

    expect(MixtureApiClient.post).toHaveBeenCalledWith(
      '/api/contact_submit',
      expect.objectContaining({
        action: 'create',
        lead: expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com',
        }),
      }),
    );
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test User');
  });

  test('updateLead should call API with correct details', async () => {
    (MixtureApiClient.post as any).mockResolvedValue({ status: 'success' });

    await leadService.updateLead('test-id', { budget: 'medium' }, 2);

    expect(MixtureApiClient.post).toHaveBeenCalledWith('/api/contact_submit', {
      action: 'update',
      id: 'test-id',
      details: { budget: 'medium' },
      step: 2,
    });
  });

  test('sendNotification should call API', async () => {
    (MixtureApiClient.post as any).mockResolvedValue({ status: 'success' });

    const result = await leadService.sendNotification('test-id', 'success');

    expect(MixtureApiClient.post).toHaveBeenCalledWith('/api/contact_submit', {
      action: 'send_notification',
      id: 'test-id',
      type: 'success',
    });
    expect(result).toBe(true);
  });

  test('sendNotification should return false if API call fails', async () => {
    (MixtureApiClient.post as any).mockRejectedValue(new Error('API Error'));

    const result = await leadService.sendNotification('test-id', 'success');
    expect(result).toBe(false);
  });
});
