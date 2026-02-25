// src/services/api.service.ts
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private getHeaders(contentType: string = 'application/json') {
    const headers: Record<string, string> = {};
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    // Auth token injection
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Generic request wrapper handling parsing and basic HTTP errors
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Inject headers
    options.headers = {
      ...this.getHeaders(
        options.body instanceof FormData ? '' : 'application/json'
      ),
      ...options.headers,
    };
    
    // Clean up empty headers like Content-Type when using FormData
    if (options.body instanceof FormData && options.headers) {
      delete (options.headers as Record<string, string>)['Content-Type'];
    }

    try {
      let response = await fetch(url, options);

      // Handle 401 Unauthorized (Token refresh logic could be injected here)
      if (response.status === 401) {
        console.warn('Unauthorized request, attempting refresh token or force logout...');
        // We will implement `refresh` call inside AuthService and trigger it
        // Or dispatch an event to log the user out if refresh fails.
      }

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errData = await response.json();
          errorMessage = errData.detail || errorMessage;
        } catch {
           // ignore parsing error for non-json fallback
        }
        throw new Error(errorMessage);
      }

      // Return Blob directly if we expect PDF/Bytes
      if (options.headers && (options.headers as Record<string, string>)['Accept'] === 'application/pdf') {
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
