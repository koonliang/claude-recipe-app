import { appConfig } from '@/src/config/appConfig';
import { StorageService } from './storage';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, any>;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
}

export class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 10000; // 10 seconds

  constructor(baseURL?: string) {
    this.baseURL = baseURL || appConfig.apiBaseUrl;
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAuth = false,
    } = config;

    // Build URL
    const url = `${this.baseURL}${endpoint}`;

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth header if required
    if (requiresAuth) {
      const token = await StorageService.getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);
      requestOptions.signal = controller.signal;

      // Log request in development mode
      if (__DEV__) {
        console.log(`API Request: ${method} ${url}`, { body });
      }

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Handle response
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Handle empty responses (like DELETE)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        if (__DEV__) {
          console.log(`API Response: ${response.status} - Empty response`);
        }
        return {} as T;
      }

      const responseData = await response.json();
      
      // Log response in development mode
      if (__DEV__) {
        console.log(`API Response: ${response.status}`, responseData);
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.createApiError(408, 'Request timeout');
        }
        if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          throw this.createApiError(0, 'Network error. Please check your connection.');
        }
      }
      throw error;
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any = {};
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      // Ignore JSON parse errors
    }

    const apiError: ApiError = {
      status: response.status,
      message: this.getErrorMessage(response.status, errorData.message),
      code: errorData.code,
      field: errorData.field,
      details: errorData.details,
    };

    // Handle unauthorized errors
    if (response.status === 401) {
      // Clear stored token on unauthorized
      try {
        await StorageService.removeToken();
        await StorageService.removeUser();
      } catch {
        // Ignore storage errors during cleanup
      }
    }

    throw apiError;
  }

  private createApiError(status: number, message: string): ApiError {
    return {
      status,
      message,
    };
  }

  private getErrorMessage(status: number, serverMessage?: string): string {
    if (serverMessage) {
      return serverMessage;
    }

    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'Conflict. The resource already exists.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  // Helper methods for common HTTP operations
  async get<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  async post<T>(endpoint: string, data?: any, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data, requiresAuth });
  }

  async put<T>(endpoint: string, data?: any, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data, requiresAuth });
  }

  async delete<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }
}