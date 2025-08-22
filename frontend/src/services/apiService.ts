import { isAnonymousModeEnabled } from '@/src/config/appConfig';
import { mockApiService } from './mockApi';
import { authService } from './auth';
import { recipeService } from './recipeService';

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
    
    return recipeService.getRecipes(params);
  },

  async getRecipe(id: string): Promise<Recipe> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.getRecipe(id);
    }
    
    return recipeService.getRecipe(id);
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
    
    return recipeService.createRecipe(recipeData);
  },

  async updateRecipe(id: string, updates: {
    title: string;
    description: string;
    category: string;
    photo_url?: string;
    ingredients: { id?: string; name: string; quantity: string; unit: string }[];
    steps: { id?: string; instruction_text: string; step_number: number }[];
  }): Promise<Recipe> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.updateRecipe(id, updates as Partial<Recipe>);
    }
    
    return recipeService.updateRecipe(id, updates);
  },

  async deleteRecipe(id: string): Promise<void> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.deleteRecipe(id);
    }
    
    return recipeService.deleteRecipe(id);
  },

  async toggleFavorite(id: string): Promise<{ is_favorite: boolean }> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.toggleFavorite(id);
    }
    
    // First get the current recipe to check favorite status
    const currentRecipe = await recipeService.getRecipe(id);
    const newFavoriteStatus = !currentRecipe.is_favorite;
    
    return recipeService.toggleFavorite(id, newFavoriteStatus);
  },

  async getFavorites(): Promise<Recipe[]> {
    if (isAnonymousModeEnabled()) {
      return mockApiService.getFavorites();
    }
    
    return recipeService.getFavorites();
  },
};

// Helper function to check if we're in demo mode
export const isDemoMode = (): boolean => isAnonymousModeEnabled();

// Export type for TypeScript
export type ApiService = typeof apiService;