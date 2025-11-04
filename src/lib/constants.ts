const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

export const API_BASE_URL = getEnvVar('VITE_API_BASE_URL');
export const API_KEY = getEnvVar('VITE_API_KEY');
export const EMAILJS_SERVICE_ID = getEnvVar('VITE_EMAILJS_SERVICE_ID');
export const EMAILJS_TEMPLATE_ID = getEnvVar('VITE_EMAILJS_TEMPLATE_ID');
export const EMAILJS_PUBLIC_KEY = getEnvVar('VITE_EMAILJS_PUBLIC_KEY');

