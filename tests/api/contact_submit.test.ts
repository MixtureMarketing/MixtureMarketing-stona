/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequest } from '../../functions/api/contact_submit';

describe('contact_submit API notification logic', () => {
  const mockEnv = {
    DB: {
      prepare: vi.fn().mockReturnThis(),
      bind: vi.fn().mockReturnThis(),
      first: vi.fn(),
      run: vi.fn(),
    },
    RESEND_API_KEY: 'test_key',
    NOTIFY_EMAIL: 'admin@example.com',
    RECAPTCHA_SECRET: 'test_secret',
  };

  const mockRequest = (body: any) => ({
    method: 'POST',
    url: 'https://mixturemarketing.pl/api/contact_submit',
    json: async () => body,
  });

  const mockContext = (body: any) => ({
    request: mockRequest(body),
    env: mockEnv,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Global fetch mock
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
      text: async () => 'OK',
    });
  });

  it('sends success emails (admin + user) with correct templates', async () => {
    const leadData = {
      id: 'lead-123',
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      service_type: 'web',
      budget: '5k',
      details: JSON.stringify({ goal: 'Sales' }),
    };

    mockEnv.DB.first.mockResolvedValue(leadData);

    const response = await onRequest(
      mockContext({
        action: 'send_notification',
        id: 'lead-123',
        type: 'success',
      }) as any,
    );

    expect(response.status).toBe(200);

    // Should call fetch twice (Admin + User)
    expect(global.fetch).toHaveBeenCalledTimes(2);

    const adminCall = (global.fetch as any).mock.calls.find(
      (call: any) => JSON.parse(call[1].body).to[0] === 'admin@example.com',
    );
    const userCall = (global.fetch as any).mock.calls.find(
      (call: any) => JSON.parse(call[1].body).to[0] === 'jan@example.com',
    );

    expect(adminCall).toBeDefined();
    expect(userCall).toBeDefined();

    // Check for branded content
    expect(adminCall[1].body).toContain('Nowe, kompletne zgłoszenie');
    expect(userCall[1].body).toContain('Dziękujemy za zaufanie');
    expect(userCall[1].body).toContain('UMÓW ROZMOWĘ WIDEO');
  });

  it('sends recovery email for abandoned step 1', async () => {
    const leadData = {
      id: 'lead-123',
      name: 'Anna Nowak',
      email: 'anna@example.com',
      service_type: 'marketing',
      email_abandoned_1_sent: 0,
    };

    mockEnv.DB.first.mockResolvedValue(leadData);

    await onRequest(
      mockContext({
        action: 'send_notification',
        id: 'lead-123',
        type: 'abandoned_step_1',
      }) as any,
    );

    expect(global.fetch).toHaveBeenCalledTimes(2); // User Recovery + Admin Alert

    const recoveryCall = (global.fetch as any).mock.calls.find((call: any) =>
      JSON.parse(call[1].body).subject.includes('dokończmy Twoją wycenę'),
    );

    expect(recoveryCall[1].body).toContain('DOKOŃCZ ZGŁOSZENIE');
    expect(recoveryCall[1].body).toContain('resume_lead=lead-123');
    expect(recoveryCall[1].body).toContain('step=2');

    // Verify DB was updated
    expect(mockEnv.DB.prepare).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE leads SET email_abandoned_1_sent = 1'),
    );
  });

  it('does not send duplicate recovery emails', async () => {
    const leadData = {
      id: 'lead-123',
      name: 'Anna Nowak',
      email: 'anna@example.com',
      email_abandoned_1_sent: 1, // ALREADY SENT
    };

    mockEnv.DB.first.mockResolvedValue(leadData);

    const response = await onRequest(
      mockContext({
        action: 'send_notification',
        id: 'lead-123',
        type: 'abandoned_step_1',
      }) as any,
    );

    const json = await response.json();
    expect(json.note).toBe('Email already sent');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
