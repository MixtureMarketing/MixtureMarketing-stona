import { describe, it, expect } from 'vitest';
import { contactSchema } from '../types/validation';

describe('Contact Form Validation Schema', () => {
  it('should validate a correct contact form data', () => {
    const validData = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '123456789',
      privacy: true,
      message: 'Hello world',
      website: 'https://mixturemarketing.pl',
    };

    const result = contactSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid email', () => {
    const invalidData = {
      name: 'Jan Kowalski',
      email: 'invalid-email',
      phone: '123456789',
      privacy: true,
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nieprawidłowy adres e-mail');
    }
  });

  it('should fail on short name', () => {
    const invalidData = {
      name: 'J',
      email: 'jan@example.com',
      phone: '123456789',
      privacy: true,
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Imię i nazwisko musi mieć co najmniej 2 znaki');
    }
  });

  it('should fail if privacy is not accepted', () => {
    const invalidData = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '123456789',
      privacy: false,
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Zgoda na przetwarzanie danych jest wymagana');
    }
  });

  it('should validate international phone formats', () => {
    const dataWithIntPhone = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '+48 123 456 789',
      privacy: true,
    };

    const result = contactSchema.safeParse(dataWithIntPhone);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid URL', () => {
    const invalidData = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '123456789',
      privacy: true,
      website: 'not-a-url',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should allow empty website URL', () => {
    const dataWithEmptyUrl = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '123456789',
      privacy: true,
      website: '',
    };

    const result = contactSchema.safeParse(dataWithEmptyUrl);
    expect(result.success).toBe(true);
  });
});
