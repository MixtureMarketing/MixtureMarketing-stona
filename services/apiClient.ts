/**
 * Centralized API Client for Mixture Marketing Backend.
 * Handles authentication headers, error logging, and JSON parsing.
 */

interface FetchOptions extends RequestInit {
  token?: string;
}

class MixtureApiClient {
  private static async request<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;

    const defaultHeaders: Record<string, string> = {};

    // Przy FormData NIE ustawiamy Content-Type — przeglądarka sama dopisze
    // `multipart/form-data; boundary=...`. Wymuszenie `application/json`
    // sprawia, że serwer nie sparsuje formData (upload dokumentów w panelu).
    if (!(rest.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
      defaultHeaders['X-Auth-Token'] = token;
    }

    try {
      const response = await fetch(url, {
        headers: { ...defaultHeaders, ...headers },
        ...rest,
      });

      if (!response.ok) {
        // Handle specific status codes
        if (response.status === 401 || response.status === 403) {
          console.warn('API Authentication Error: Session might be expired.');
        }

        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Server responded with ${response.status}`);
      }

      // Return JSON for all successful requests
      return (await response.json()) as T;
    } catch (error) {
      console.error(`[ApiClient] Error fetching ${url}:`, error);
      throw error;
    }
  }

  static get<T>(url: string, token?: string) {
    return this.request<T>(url, { method: 'GET', token });
  }

  static post<T>(url: string, body: unknown, token?: string) {
    // Content-Type dobiera request() na podstawie typu body (FormData → brak).
    return this.request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      token,
    });
  }
}

export default MixtureApiClient;
