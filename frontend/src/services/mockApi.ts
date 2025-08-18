import { 
  mockRecipes, 
  mockAnonymousUser, 
  getRecipesByCategory, 
  searchRecipes,
  Recipe, 
  Ingredient, 
  RecipeStep 
} from '@/src/data/mockData';
import { AuthResponse, AnonymousAuthResponse, LoginCredentials, SignupData } from '@/src/types';

// In-memory storage for anonymous mode
class MockApiStorage {
  private recipes: Recipe[] = [...mockRecipes];
  private favorites: Set<string> = new Set(['recipe-002', 'recipe-004']);

  // Recipe operations
  getAllRecipes(category?: string, search?: string): Recipe[] {
    let filteredRecipes = this.recipes;
    
    if (category) {
      filteredRecipes = getRecipesByCategory(category);
    }
    
    if (search) {
      filteredRecipes = searchRecipes(search);
    }
    
    // Update favorite status
    return filteredRecipes.map(recipe => ({
      ...recipe,
      is_favorite: this.favorites.has(recipe.id)
    }));
  }

  getRecipeById(id: string): Recipe | null {
    const recipe = this.recipes.find(r => r.id === id);
    if (!recipe) return null;
    
    return {
      ...recipe,
      is_favorite: this.favorites.has(recipe.id)
    };
  }

  createRecipe(recipeData: Omit<Recipe, 'id' | 'created_at' | 'createdByUserId'>): Recipe {
    const newRecipe: Recipe = {
      ...recipeData,
      id: `recipe-${Date.now()}`,
      created_at: new Date().toISOString(),
      createdByUserId: mockAnonymousUser.id,
      is_favorite: false,
    };
    
    this.recipes.push(newRecipe);
    return newRecipe;
  }

  updateRecipe(id: string, updates: Partial<Recipe>): Recipe | null {
    const index = this.recipes.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    this.recipes[index] = {
      ...this.recipes[index],
      ...updates,
      id, // Ensure ID doesn't change
    };
    
    return this.getRecipeById(id);
  }

  deleteRecipe(id: string): boolean {
    const index = this.recipes.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    this.recipes.splice(index, 1);
    this.favorites.delete(id);
    return true;
  }

  toggleFavorite(id: string): boolean {
    const recipe = this.recipes.find(r => r.id === id);
    if (!recipe) return false;
    
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
      return false;
    } else {
      this.favorites.add(id);
      return true;
    }
  }

  getFavoriteRecipes(): Recipe[] {
    return this.recipes
      .filter(recipe => this.favorites.has(recipe.id))
      .map(recipe => ({ ...recipe, is_favorite: true }));
  }
}

// Singleton instance for demo session
const mockStorage = new MockApiStorage();

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Service
export const mockApiService = {
  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay();
    
    // Always succeed in anonymous mode
    return {
      token: 'mock-jwt-token',
      user: mockAnonymousUser,
    };
  },

  async signup(userData: SignupData): Promise<AuthResponse> {
    await delay();
    
    return {
      token: 'mock-jwt-token',
      user: {
        ...mockAnonymousUser,
        full_name: userData.full_name,
        email: userData.email,
      },
    };
  },

  async loginAnonymous(): Promise<AnonymousAuthResponse> {
    await delay(100);
    
    return {
      user: mockAnonymousUser,
      isAnonymous: true,
    };
  },

  async logout(): Promise<void> {
    await delay();
    // No-op for mock
  },

  async forgotPassword(email: string): Promise<void> {
    await delay();
    // No-op for mock
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await delay();
    // No-op for mock
  },

  // Recipe operations
  async getRecipes(params?: { category?: string; search?: string }): Promise<Recipe[]> {
    await delay();
    
    return mockStorage.getAllRecipes(params?.category, params?.search);
  },

  async getRecipe(id: string): Promise<Recipe> {
    await delay();
    
    const recipe = mockStorage.getRecipeById(id);
    if (!recipe) {
      throw new Error('Recipe not found');
    }
    
    return recipe;
  },

  async createRecipe(recipeData: {
    title: string;
    description: string;
    category: string;
    photo_url?: string;
    ingredients: { id?: string; name: string; quantity: string; unit: string }[];
    steps: { id?: string; instruction_text: string; step_number: number }[];
  }): Promise<Recipe> {
    await delay();
    
    // Generate IDs for ingredients and steps
    const ingredients: Ingredient[] = recipeData.ingredients.map((ing, index) => ({
      ...ing,
      id: `ing-${Date.now()}-${index}`,
    }));
    
    const steps: RecipeStep[] = recipeData.steps.map((step, index) => ({
      ...step,
      id: `step-${Date.now()}-${index}`,
      step_number: index + 1,
    }));
    
    return mockStorage.createRecipe({
      ...recipeData,
      photo_url: recipeData.photo_url || '',
      ingredients,
      steps,
      is_favorite: false,
    });
  },

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    await delay();
    
    const recipe = mockStorage.updateRecipe(id, updates);
    if (!recipe) {
      throw new Error('Recipe not found');
    }
    
    return recipe;
  },

  async deleteRecipe(id: string): Promise<void> {
    await delay();
    
    const success = mockStorage.deleteRecipe(id);
    if (!success) {
      throw new Error('Recipe not found');
    }
  },

  async toggleFavorite(id: string): Promise<{ is_favorite: boolean }> {
    await delay();
    
    const isFavorite = mockStorage.toggleFavorite(id);
    return { is_favorite: isFavorite };
  },

  async getFavorites(): Promise<Recipe[]> {
    await delay();
    
    return mockStorage.getFavoriteRecipes();
  },
};

export type MockApiService = typeof mockApiService;