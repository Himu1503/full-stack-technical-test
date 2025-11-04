global.fetch = jest.fn();

describe('apiClient', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  let apiClient: typeof import('../api').apiClient;

  beforeAll(() => {
    process.env.VITE_API_BASE_URL = 'https://test-api.com';
    process.env.VITE_API_KEY = 'test-key';
  });

  beforeEach(() => {
    jest.resetModules();
    const apiModule = require('../api');
    apiClient = apiModule.apiClient;
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET requests', () => {
    it('should make GET request with correct headers', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.get('/events');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.com/events',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-key',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      await expect(apiClient.get('/events/123')).rejects.toThrow(
        'API Error: Not Found'
      );
    });

    it('should handle GET request without API key', async () => {
      const originalKey = process.env.VITE_API_KEY;
      delete process.env.VITE_API_KEY;
      jest.resetModules();
      const { apiClient: client } = require('../api');

      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await client.get('/events');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.com/events',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      process.env.VITE_API_KEY = originalKey;
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body and headers', async () => {
      const mockResponse = { success: true };
      const requestBody = { name: 'Test Event', date: '2024-01-01' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.post('/events', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.com/events',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-key',
          },
          body: JSON.stringify(requestBody),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when POST response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      } as Response);

      await expect(
        apiClient.post('/events', { invalid: 'data' })
      ).rejects.toThrow('API Error: Bad Request');
    });
  });
});

