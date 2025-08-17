import { AuthResponse, LoginCredentials, SignupData, AuthError } from '@/src/types';
import { StorageService } from './storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: AuthError = {
        message: errorData.message || 'An error occurred',
        field: errorData.field,
      };
      throw error;
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Store token and user data
      await StorageService.setToken(response.token);
      await StorageService.setUser(response.user);

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }

  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      // Store token and user data
      await StorageService.setToken(response.token);
      await StorageService.setUser(response.user);

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Signup failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await StorageService.clearAll();
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await this.makeRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Password reset request failed');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await this.makeRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Password reset failed');
    }
  }

  async getStoredToken(): Promise<string | null> {
    return StorageService.getToken();
  }

  async getStoredUser(): Promise<object | null> {
    return StorageService.getUser();
  }
}

export const authService = new AuthService();