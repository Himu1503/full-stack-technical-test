const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  return defaultValue;
};

const envApiBaseUrl = getEnvVar('VITE_API_BASE_URL');
export const API_BASE_URL = envApiBaseUrl
  ? envApiBaseUrl.replace(/\/events\/?$/, '') // Remove trailing /events if present
  : '';
export const API_KEY = getEnvVar('VITE_API_KEY');
export const EMAILJS_SERVICE_ID = getEnvVar('VITE_EMAILJS_SERVICE_ID');
export const EMAILJS_TEMPLATE_ID = getEnvVar('VITE_EMAILJS_TEMPLATE_ID');
export const EMAILJS_PUBLIC_KEY = getEnvVar('VITE_EMAILJS_PUBLIC_KEY');

