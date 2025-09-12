import { getConfig } from './config';

// API client configuration
const config = getConfig();

// Create a centralized API client
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = config.apiUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  // Get headers with auth token if available
  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const token = this.getAuthToken();
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Generic request method
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(options.headers as Record<string, string>);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response as unknown as T;
      }

      const data = await response.json();

      // Handle API errors
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // GET request
  async get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  // POST request
  async post<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  // Upload file
  async uploadFile<T = any>(
    endpoint: string,
    formData: FormData,
    headers?: Record<string, string>
  ): Promise<T> {
    const token = this.getAuthToken();
    const uploadHeaders: Record<string, string> = { ...headers };
    
    if (token) {
      uploadHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    // Remove Content-Type header to let browser set it with boundary
    delete uploadHeaders['Content-Type'];

    return this.request<T>(endpoint, {
      method: 'POST',
      headers: uploadHeaders,
      body: formData,
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export specific API methods for common operations
export const api = {
  // Auth endpoints
  auth: {
    register: (data: { firstName: string; lastName: string; email: string; password: string; confirmPassword: string }) =>
      apiClient.post('/api/auth/register', data),
    login: (data: { email: string; password: string }) =>
      apiClient.post('/api/auth/login', data),
    logout: () => apiClient.post('/api/auth/logout'),
    getProfile: () => apiClient.get('/api/auth/me'),
    updateProfile: (data: { firstName?: string; lastName?: string; email?: string }) =>
      apiClient.put('/api/auth/profile', data),
    changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      apiClient.put('/api/auth/change-password', data),
  },

  // Product endpoints
  products: {
    getAll: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return apiClient.get(`/api/products${queryString}`);
    },
    getById: (id: string) => apiClient.get(`/api/products/${id}`),
    getFeatured: () => apiClient.get('/api/products/featured/featured'),
    getRandom: (limit?: number) => {
      const queryString = limit ? `?limit=${limit}` : '';
      return apiClient.get(`/api/products/random/random${queryString}`);
    },
    create: (data: any) => apiClient.post('/api/products', data),
    update: (id: string, data: any) => apiClient.put(`/api/products/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/products/${id}`),
    upload: (formData: FormData) => apiClient.uploadFile('/api/products/upload', formData),
  },

  // Category endpoints
  categories: {
    getAll: () => apiClient.get('/api/categories'),
    getById: (id: string) => apiClient.get(`/api/categories/${id}`),
    getBySlug: (slug: string) => apiClient.get(`/api/categories/slug/${slug}`),
    create: (data: any) => apiClient.post('/api/categories', data),
    update: (id: string, data: any) => apiClient.put(`/api/categories/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/categories/${id}`),
  },

  // Cart endpoints
  cart: {
    get: () => apiClient.get('/api/cart'),
    addItem: (data: { productId: string; size: string; color: string; quantity: number }) =>
      apiClient.post('/api/cart/add', data),
    updateItem: (itemId: string, data: { quantity: number }) =>
      apiClient.patch(`/api/cart/items/${itemId}`, data),
    removeItem: (itemId: string) => apiClient.delete(`/api/cart/items/${itemId}`),
    clear: () => apiClient.delete('/api/cart/clear'),
    getCount: () => apiClient.get('/api/cart/count'),
  },


  // Order endpoints
  orders: {
    getAll: () => apiClient.get('/api/orders'),
    getMine: () => apiClient.get('/api/orders/my-orders'),
    getById: (id: string) => apiClient.get(`/api/orders/${id}`),
    create: (data: any) => apiClient.post('/api/orders', data),
    updateStatus: (id: string, data: { status: string }) =>
      apiClient.put(`/api/orders/${id}/status`, data),
    cancel: (id: string) => apiClient.put(`/api/orders/${id}/cancel`),
    getTracking: (id: string) => apiClient.get(`/api/orders/${id}/tracking`),
    // Admin endpoints
    getAllAdmin: () => apiClient.get('/api/orders/admin/all'),
    getByIdAdmin: (id: string) => apiClient.get(`/api/orders/admin/${id}`),
    updateStatusAdmin: (id: string, data: { status: string; adminNotes?: string }) =>
      apiClient.put(`/api/orders/admin/${id}/status`, data),
    updateNotesAdmin: (id: string, data: { adminNotes: string }) =>
      apiClient.put(`/api/orders/admin/${id}/notes`, data),
    getCount: () => apiClient.get('/api/orders/count'),
    getRecentActivity: (limit?: number) => {
      const queryString = limit ? `?limit=${limit}` : '';
      return apiClient.get(`/api/orders/admin/recent-activity${queryString}`);
    },
    getAnalytics: () => apiClient.get('/api/orders/admin/analytics'),
  },

  // User endpoints
  users: {
    getProfile: () => apiClient.get('/api/users/profile'),
    updateProfile: (data: any) => apiClient.put('/api/users/profile', data),
    updatePreferences: (data: any) => apiClient.put('/api/users/preferences', data),
    getAll: () => apiClient.get('/api/users'),
    getById: (id: string) => apiClient.get(`/api/users/${id}`),
    update: (id: string, data: any) => apiClient.put(`/api/users/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/users/${id}`),
    getStats: () => apiClient.get('/api/users/stats/overview'),
    getCount: () => apiClient.get('/api/users/count'),
  },
};

export default apiClient;
