// API Client - Base Configuration and HTTP Methods
// Centralized API client with error handling, interceptors, and retry logic

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface RequestConfig extends AxiosRequestConfig {
  retry?: boolean;
  retryCount?: number;
}

// ============================================================================
// API Client Class
// ============================================================================

export class ApiClient {
  private instance: AxiosInstance;
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    // Create axios instance
    this.instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup interceptors
    this.setupInterceptors();
  }

  // Setup request/response interceptors
  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config as RequestConfig;

        // Handle 401 Unauthorized - Refresh token
        if (error.response?.status === 401) {
          if (!config.retry) {
            config.retry = true;
            config.retryCount = 0;
            try {
              const newToken = await this.refreshToken();
              if (newToken && config.headers) {
                config.headers.Authorization = `Bearer ${newToken}`;
                return this.instance(config);
              }
            } catch (refreshError) {
              // Redirect to login
              this.handleAuthError();
              return Promise.reject(refreshError);
            }
          }
        }

        // Handle rate limiting - Retry with backoff
        if (error.response?.status === 429) {
          const retryCount = (config.retryCount || 0) + 1;
          if (retryCount < (this.config.retryAttempts || 3)) {
            config.retryCount = retryCount;
            const delay = (this.config.retryDelay || 1000) * Math.pow(2, retryCount - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return this.instance(config);
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  // Get auth token from storage
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }
    return null;
  }

  // Refresh auth token
  private async refreshToken(): Promise<string | null> {
    try {
      // Call refresh endpoint (implement based on your auth service)
      const response = await this.instance.post('/auth/refresh');
      const token = response.data.token || response.data.accessToken;
      
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
      }
      return token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  // Handle auth errors - redirect to login
  private handleAuthError(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  }

  // Format error response
  private formatError(error: AxiosError): ApiError {
    const response = error.response;
    
    if (response) {
      const data = response.data as any;
      return {
        status: response.status,
        message: data?.message || error.message,
        errors: data?.errors,
        code: data?.code,
      };
    }

    return {
      status: 0,
      message: error.message || 'Network error',
      code: 'NETWORK_ERROR',
    };
  }

  // GET request
  async get<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get<T>(url, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  // POST request
  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  // PUT request
  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  // PATCH request
  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  // DELETE request
  async delete<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<T>(url, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  // Upload file
  async upload<T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, JSON.stringify(value));
      });
    }

    const response = await this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      data: response.data,
      status: response.status,
    };
  }

  // Set authorization header
  setAuthToken(token: string): void {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  // Clear authorization header
  clearAuthToken(): void {
    delete this.instance.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }
  }

  // Get axios instance (for advanced usage)
  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// ============================================================================
// Default API Client Instance
// ============================================================================

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiClient = new ApiClient({
  baseURL,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
});

export default apiClient;
