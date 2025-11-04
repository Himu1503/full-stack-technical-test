import { useState } from 'react';
import { sendEmail, type EmailParams } from '@/lib/emailjs';

export const useEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (params: EmailParams) => {
    setIsLoading(true);
    setError(null);

    try {
      await sendEmail(params);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { send, isLoading, error };
};

