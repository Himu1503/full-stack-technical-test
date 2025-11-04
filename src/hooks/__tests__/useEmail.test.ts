import { renderHook, act } from '@testing-library/react';
import { useEmail } from '../useEmail';
import * as emailjsModule from '@/lib/emailjs';

jest.mock('@/lib/emailjs');

describe('useEmail Hook', () => {
  const mockSendEmail = jest.spyOn(emailjsModule, 'sendEmail');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading false and no error', () => {
    const { result } = renderHook(() => useEmail());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading to true when sending email', async () => {
    mockSendEmail.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    const { result } = renderHook(() => useEmail());

    let sendPromise: Promise<unknown>;
    await act(async () => {
      sendPromise = result.current.send({ to_email: 'test@example.com' });
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await sendPromise;
    });
  });

  it('should send email successfully', async () => {
    mockSendEmail.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useEmail());

    let sendResult;
    await act(async () => {
      sendResult = await result.current.send({
        to_email: 'test@example.com',
        to_name: 'Test User',
      });
    });

    expect(mockSendEmail).toHaveBeenCalledWith({
      to_email: 'test@example.com',
      to_name: 'Test User',
    });
    expect(sendResult).toEqual({ success: true });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle email sending errors', async () => {
    const errorMessage = 'Email service unavailable';
    mockSendEmail.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useEmail());

    let sendResult;
    await act(async () => {
      sendResult = await result.current.send({
        to_email: 'test@example.com',
      });
    });

    expect(sendResult).toEqual({
      success: false,
      error: errorMessage,
    });
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear previous error on new send attempt', async () => {
    mockSendEmail
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useEmail());

    await act(async () => {
      await result.current.send({ to_email: 'test@example.com' });
    });

    expect(result.current.error).toBe('First error');

    await act(async () => {
      await result.current.send({ to_email: 'test2@example.com' });
    });

    expect(result.current.error).toBeNull();
  });
});

