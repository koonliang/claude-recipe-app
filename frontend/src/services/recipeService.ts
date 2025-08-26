import { ApiClient, ApiError } from './apiClient';
import { Recipe } from '@/src/data/mockData';

// Request DTOs matching backend structure
export interface CreateRecipeRequest {
  title: string;
  description: string;
  category: string;
  photo?: string | null;
  ingredients: CreateIngredientDto[];
  steps: CreateStepDto[];
}

export interface UpdateRecipeRequest {
  title: string;
  description: string;
  category: string;
  photo?: string | null;
  ingredients: UpdateIngredientDto[];
  steps: UpdateStepDto[];
}

export interface CreateIngredientDto {
  name: string;
  quantity: string;
  unit: string;
}

export interface CreateStepDto {
  stepNumber: number;
  instructionText: string;
}

export interface UpdateIngredientDto {
  id?: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface UpdateStepDto {
  id?: string;
  stepNumber: number;
  instructionText: string;
}

// Response DTOs matching backend structure
export interface RecipeDto {
  id: string;
  title: string;
  description: string;
  category: string;
  photoUrl?: string;
  ingredients: IngredientDto[];
  steps: StepDto[];
  isFavorite: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IngredientDto {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StepDto {
  id: string;
  stepNumber: number;
  instructionText: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetRecipesResponse {
  recipes: RecipeDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateRecipeResponse {
  message: string;
  recipe: RecipeDto;
}

export interface DeleteRecipeResponse {
  message: string;
}

class RecipeService extends ApiClient {

  async getRecipes(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Recipe[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/recipes?${queryString}` : '/recipes';
      
      const response = await this.get<GetRecipesResponse>(endpoint, true);
      
      return response.recipes.map(this.mapRecipeDtoToRecipe);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw new Error('Failed to fetch recipes');
    }
  }

  async getRecipe(id: string): Promise<Recipe> {
    try {
      const response = await this.get<RecipeDto>(`/recipes/${id}`, true);
      return this.mapRecipeDtoToRecipe(response);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw new Error('Failed to fetch recipe');
    }
  }

  async createRecipe(recipeData: {
    title: string;
    description: string;
    category: string;
    photo_url?: string;
    ingredients: { id?: string; name: string; quantity: string; unit: string }[];
    steps: { id?: string; instruction_text: string; step_number: number }[];
  }): Promise<Recipe> {
    try {
      const request: CreateRecipeRequest = {
        title: recipeData.title,
        description: recipeData.description,
        category: recipeData.category,
        photo: recipeData.photo_url || null,
        ingredients: recipeData.ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit
        })),
        steps: recipeData.steps.map(step => ({
          stepNumber: step.step_number,
          instructionText: step.instruction_text
        }))
      };

      const response = await this.post<RecipeDto>('/recipes', request, true);
      return this.mapRecipeDtoToRecipe(response);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw new Error('Failed to create recipe');
    }
  }

  async updateRecipe(id: string, updates: {
    title: string;
    description: string;
    category: string;
    photo_url?: string;
    ingredients: { id?: string; name: string; quantity: string; unit: string }[];
    steps: { id?: string; instruction_text: string; step_number: number }[];
  }): Promise<{ message: string; recipe: Recipe }> {
    try {
      const request: UpdateRecipeRequest = {
        title: updates.title,
        description: updates.description,
        category: updates.category,
        photo: updates.photo_url || null,
        ingredients: updates.ingredients.map(ing => ({
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit
        })),
        steps: updates.steps.map(step => ({
          id: step.id,
          stepNumber: step.step_number,
          instructionText: step.instruction_text
        }))
      };

      const response = await this.put<UpdateRecipeResponse>(`/recipes/${id}`, request, true);
      return {
        message: response.message,
        recipe: this.mapRecipeDtoToRecipe(response.recipe)
      };
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw new Error('Failed to update recipe');
    }
  }

  async deleteRecipe(id: string): Promise<{ message: string }> {
    try {
      const response = await this.delete<DeleteRecipeResponse>(`/recipes/${id}`, true);
      return {
        message: response.message
      };
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw new Error('Failed to delete recipe');
    }
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<{ is_favorite: boolean }> {
    try {
      if (isFavorite) {
        await this.post(`/recipes/${id}/favorite`, undefined, true);
      } else {
        await this.delete(`/recipes/${id}/favorite`, true);
      }
      
      return { is_favorite: isFavorite };
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw new Error('Failed to toggle favorite');
    }
  }

  async getFavorites(): Promise<Recipe[]> {
    try {
      // Get all recipes and filter favorites on the client side
      // Backend doesn't have a specific favorites endpoint, so we get all recipes
      // and rely on the isFavorite flag
      const allRecipes = await this.getRecipes();
      return allRecipes.filter(recipe => recipe.is_favorite);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw new Error('Failed to fetch favorite recipes');
    }
  }

  // Helper method to map backend DTO to frontend Recipe type
  private mapRecipeDtoToRecipe(dto: RecipeDto): Recipe {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      photo_url: dto.photoUrl || '',
      ingredients: dto.ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit
      })),
      steps: dto.steps.map(step => ({
        id: step.id,
        step_number: step.stepNumber,
        instruction_text: step.instructionText
      })),
      is_favorite: dto.isFavorite,
      created_at: dto.createdAt,
      createdByUserId: dto.createdByUserId
    };
  }

  private isApiError(error: any): error is ApiError {
    return error && typeof error.status === 'number' && typeof error.message === 'string';
  }
}

export const recipeService = new RecipeService();