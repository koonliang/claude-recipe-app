import { AuthResponse, LoginCredentials, SignupData, User } from '@/src/types';
import { StorageService } from './storage';
import { ApiClient, ApiError } from './apiClient';

class AuthService extends ApiClient {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>('/auth/login', credentials);

      // Store token and user data
      await StorageService.setToken(response.token);
      await StorageService.setUser(response.user);

      return response;
    } catch (error) {
      // Re-throw ApiError as is, convert others to generic error
      if (this.isApiError(error)) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }

  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>('/auth/signup', userData);

      // Store token and user data
      await StorageService.setToken(response.token);
      await StorageService.setUser(response.user);

      return response;
    } catch (error) {
      // Re-throw ApiError as is, convert others to generic error
      if (this.isApiError(error)) {
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
      await this.post('/auth/forgot-password', { email });
    } catch (error) {
      // Re-throw ApiError as is, convert others to generic error
      if (this.isApiError(error)) {
        throw error;
      }
      throw new Error('Password reset request failed');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await this.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      // Re-throw ApiError as is, convert others to generic error
      if (this.isApiError(error)) {
        throw error;
      }
      throw new Error('Password reset failed');
    }
  }

  async getStoredToken(): Promise<string | null> {
    return StorageService.getToken();
  }

  async getStoredUser(): Promise<User | null> {
    return StorageService.getUser() as Promise<User | null>;
  }

  async getProfile(): Promise<User> {
    try {
      return await this.get<User>('/auth/profile', true);
    } catch (error) {
      // Re-throw ApiError as is, convert others to generic error
      if (this.isApiError(error)) {
        throw error;
      }
      throw new Error('Failed to get user profile');
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch {
      return false;
    }
  }

  private isApiError(error: any): error is ApiError {
    return error && typeof error.status === 'number' && typeof error.message === 'string';
  }
}

export const authService = new AuthService();