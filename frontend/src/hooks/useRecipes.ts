import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/src/services/apiService';
import { Recipe } from '@/src/types';

export interface UseRecipesState {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean;
}

export interface UseRecipesParams {
  category?: string | null;
  search?: string;
}

export interface UseRecipesReturn extends UseRecipesState {
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleFavorite: (recipeId: string) => Promise<void>;
}

export function useRecipes(params: UseRecipesParams = {}): UseRecipesReturn {
  const [state, setState] = useState<UseRecipesState>({
    recipes: [],
    isLoading: true,
    error: null,
    isRefreshing: false,
  });

  const fetchRecipes = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setState(prev => ({ ...prev, isRefreshing: true, error: null }));
      } else {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      }

      const fetchParams: { category?: string; search?: string } = {};
      
      if (params.category) {
        fetchParams.category = params.category;
      }
      
      if (params.search && params.search.trim()) {
        fetchParams.search = params.search.trim();
      }

      const recipes = await apiService.getRecipes(fetchParams);
      
      setState({
        recipes,
        isLoading: false,
        error: null,
        isRefreshing: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load recipes';
      setState({
        recipes: [],
        isLoading: false,
        error: errorMessage,
        isRefreshing: false,
      });
    }
  }, [params.category, params.search]);

  const toggleFavorite = useCallback(async (recipeId: string) => {
    try {
      const result = await apiService.toggleFavorite(recipeId);
      
      setState(prev => ({
        ...prev,
        recipes: prev.recipes.map(recipe =>
          recipe.id === recipeId
            ? { ...recipe, is_favorite: result.is_favorite }
            : recipe
        ),
      }));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, []);

  const refetch = useCallback(() => fetchRecipes(false), [fetchRecipes]);
  const refresh = useCallback(() => fetchRecipes(true), [fetchRecipes]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    ...state,
    refetch,
    refresh,
    toggleFavorite,
  };
}