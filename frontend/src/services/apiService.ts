import { isAnonymousModeEnabled } from '@/src/config/appConfig';
import { mockApiService } from './mockApi';
import { authService } from './auth';

// Import the recipe types we need
import type { Recipe } from '@/src/data/mockData';
import type { AuthResponse, LoginCredentials, SignupData } from '@/src/types';

// Service router that switches between real API and mock API
export const apiService = {
  // Authentication operations
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.login(credentials);
    }
    return authService.login(credentials);
  },

  async signup(userData: SignupData): Promise<AuthResponse> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.signup(userData);
    }
    return authService.signup(userData);
  },

  async logout(): Promise<void> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.logout();
    }
    return authService.logout();
  },

  async forgotPassword(email: string): Promise<void> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.forgotPassword(email);
    }
    return authService.forgotPassword(email);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.resetPassword(token, newPassword);
    }
    return authService.resetPassword(token, newPassword);
  },

  // Storage operations (for real auth service)
  async getStoredToken(): Promise<string | null> {
    if (isAnonymousModeEnabled()) {
      return null; // No stored tokens in anonymous mode
    }
    return authService.getStoredToken();
  },

  async getStoredUser(): Promise<any> {
    if (isAnonymousModeEnabled()) {
      return null; // No stored users in anonymous mode
    }
    return authService.getStoredUser();
  },

  async validateToken(): Promise<boolean> {
    if (isAnonymousModeEnabled()) {
      return true; // Anonymous mode doesn't use tokens
    }
    return authService.validateToken();
  },

  async getProfile(): Promise<any> {
    if (isAnonymousModeEnabled()) {
      return null; // No profile in anonymous mode
    }
    return authService.getProfile();
  },

  // Recipe operations
  async getRecipes(params?: { category?: string; search?: string }): Promise<Recipe[]> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.getRecipes(params);
    }
    
    // TODO: Implement real recipe API calls when backend is ready
    // For now, use mock data even in non-anonymous mode for development
    return mockApiService.getRecipes(params);
  },

  async getRecipe(id: string): Promise<Recipe> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.getRecipe(id);
    }
    
    // TODO: Implement real recipe API call
    return mockApiService.getRecipe(id);
  },

  async createRecipe(recipeData: {
    title: string;
    description: string;
    category: string;
    photo_url?: string;
    ingredients: { id?: string; name: string; quantity: string; unit: string }[];
    steps: { id?: string; instruction_text: string; step_number: number }[];
  }): Promise<Recipe> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.createRecipe(recipeData);
    }
    
    // TODO: Implement real recipe creation API call
    return mockApiService.createRecipe(recipeData);
  },

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.updateRecipe(id, updates);
    }
    
    // TODO: Implement real recipe update API call
    return mockApiService.updateRecipe(id, updates);
  },

  async deleteRecipe(id: string): Promise<void> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.deleteRecipe(id);
    }
    
    // TODO: Implement real recipe deletion API call
    return mockApiService.deleteRecipe(id);
  },

  async toggleFavorite(id: string): Promise<{ is_favorite: boolean }> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.toggleFavorite(id);
    }
    
    // TODO: Implement real favorite toggle API call
    return mockApiService.toggleFavorite(id);
  },

  async getFavorites(): Promise<Recipe[]> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.getFavorites();
    }
    
    // TODO: Implement real favorites API call
    return mockApiService.getFavorites();
  },
};

// Helper function to check if we're in demo mode
export const isDemoMode = (): boolean => isAnonymousModeEnabled();

// Export type for TypeScript
export type ApiService = typeof apiService;