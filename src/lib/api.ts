import { API_BASE_URL, API_KEY } from './constants';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(API_KEY && { 'x-api-key': API_KEY }),
});

const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorMessage = `API Error: ${response.statusText}`;
    let errorData: unknown;

    if (isJson) {
      try {
        errorData = await response.json();
        if (typeof errorData === 'object' && errorData !== null) {
          const errorObj = errorData as { message?: string; error?: string };
          errorMessage =
            errorObj.message || errorObj.error || errorMessage;
        }
      } catch {
        // If JSON parsing fails, use default message
      }
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  if (isJson) {
    return response.json();
  }

  return (await response.text()) as T;
};

export const apiClient = {
  get: async <T>(endpoint: string, signal?: AbortSignal): Promise<T> => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('API GET Request:', url);
      console.log('Headers:', getHeaders());
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        signal,
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 500));
        throw new ApiError(
          `Expected JSON response but received ${contentType}. The API URL might be incorrect. URL was: ${url}`,
          response.status
        );
      }

      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request was cancelled', 0);
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred'
      );
    }
  },

  post: async <T>(
    endpoint: string,
    body: unknown,
    signal?: AbortSignal
  ): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
        signal,
      });

      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request was cancelled', 0);
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred'
      );
    }
  },
};

