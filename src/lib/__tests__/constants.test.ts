import {
  API_BASE_URL,
  API_KEY,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
} from '../constants';

describe('Constants', () => {
  beforeEach(() => {
    process.env.VITE_API_BASE_URL = 'https://test-api.com';
    process.env.VITE_API_KEY = 'test-key';
    process.env.VITE_EMAILJS_SERVICE_ID = 'service_123';
    process.env.VITE_EMAILJS_TEMPLATE_ID = 'template_456';
    process.env.VITE_EMAILJS_PUBLIC_KEY = 'public_key_789';
  });

  it('should read API_BASE_URL from environment', () => {
    expect(API_BASE_URL).toBeDefined();
  });

  it('should read API_KEY from environment', () => {
    expect(API_KEY).toBeDefined();
  });

  it('should read EmailJS configuration from environment', () => {
    expect(EMAILJS_SERVICE_ID).toBeDefined();
    expect(EMAILJS_TEMPLATE_ID).toBeDefined();
    expect(EMAILJS_PUBLIC_KEY).toBeDefined();
  });

  it('should return empty string if values are not set', () => {
    delete process.env.VITE_API_BASE_URL;
    jest.resetModules();
    const { API_BASE_URL: emptyUrl } = require('../constants');
    expect(emptyUrl).toBe('');
  });
});

