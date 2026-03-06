// src/services/api.service.ts
export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

class ApiService {
  private refreshPromise: Promise<boolean> | null = null;

  private getHeaders(contentType: string = 'application/json') {
    const headers: Record<string, string> = {};
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (!data?.access_token) return false;

      localStorage.setItem('access_token', data.access_token);
      // refresh_token may not be returned by backend; only overwrite if present
      if (data?.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Generic request wrapper handling parsing and basic HTTP errors
  async request<T>(endpoint: string, options: RequestInit = {}, retryCount: number = 0): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const isFormData = options.body instanceof FormData;

    // IMPORTANT: do not mutate the caller's options object
    // and ensure fresh Authorization wins on retry
    const mergedHeaders: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
      ...this.getHeaders(isFormData ? '' : 'application/json'),
    };

    // Clean up empty headers like Content-Type when using FormData
    if (isFormData) {
      delete mergedHeaders['Content-Type'];
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: mergedHeaders,
    };

    try {
      const response = await fetch(url, requestOptions);

      // Handle 401 Unauthorized - attempt refresh token once
      if (response.status === 401 && retryCount === 0) {
        // Avoid multiple concurrent refresh
        if (!this.refreshPromise) {
          this.refreshPromise = this.refreshToken();
        }

        const refreshed = await this.refreshPromise;
        this.refreshPromise = null;

        if (refreshed) {
          return this.request<T>(endpoint, options, retryCount + 1);
        }

        // Hard fail: clear tokens to prevent loops
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('current_user');
        throw new Error('Sesión expirada. Inicia sesión de nuevo.');
      }

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errData = await response.json();
          errorMessage = errData.detail || errData.message || errorMessage;
        } catch {
          // ignore parsing error for non-json fallback
        }
        throw new Error(errorMessage);
      }

      // Return Blob directly if we expect PDF/Bytes
      if (requestOptions.headers && (requestOptions.headers as Record<string, string>)['Accept'] === 'application/pdf') {
        const blob = await response.blob();
        return blob as unknown as T;
      }

      // Check if there is body to parse
      const text = await response.text();
      return (text ? JSON.parse(text) : null) as T;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
    }
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, isFormData: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
