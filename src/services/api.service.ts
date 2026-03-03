// src/services/api.service.ts
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private refreshPromise: Promise<boolean> | null = null;

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

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Generic request wrapper handling parsing and basic HTTP errors
  async request<T>(endpoint: string, options: RequestInit = {}, retryCount: number = 0): Promise<T> {
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

      // Handle 401 Unauthorized - Intentar refresh token
      if (response.status === 401 && retryCount === 0) {
        console.warn('Unauthorized request, attempting token refresh...');
        
        // Evitar múltiples refresh simultáneos
        if (!this.refreshPromise) {
          this.refreshPromise = this.refreshToken();
        }
        
        const refreshed = await this.refreshPromise;
        this.refreshPromise = null;
        
        if (refreshed) {
          // Reintentar la petición con el nuevo token
          console.log('Token refreshed, retrying request...');
          return this.request<T>(endpoint, options, retryCount + 1);
        } else {
          // Refresh falló, pero no hacemos logout (uso anónimo)
          console.log('Token refresh failed, continuing without auth...');
          throw new Error('Sesión no disponible.继续 usando modo anónimo.');
        }
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
