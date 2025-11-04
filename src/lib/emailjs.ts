import emailjs from '@emailjs/browser';
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
} from './constants';

export const initializeEmailJS = () => {
  if (EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
};

export interface EmailParams {
  to_name?: string;
  to_email?: string;
  subject?: string;
  message?: string;
  [key: string]: unknown;
}

export const sendEmail = async (params: EmailParams): Promise<void> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    throw new Error('EmailJS configuration is missing. Please check your environment variables.');
  }

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
  } catch (error) {
    console.error('EmailJS error:', error);
    throw error;
  }
};

