import { useState, useEffect, useCallback } from 'react';
import { Recipe } from '@/src/types';
import { apiService } from '@/src/services/apiService';

export interface UseRecipeDetailOptions {
  recipeId: string;
}

export interface UseRecipeDetailReturn {
  recipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteRecipe: () => Promise<boolean>;
  toggleFavorite: () => Promise<void>;
  isDeleting: boolean;
  isToggling: boolean;
}

export const useRecipeDetail = ({ recipeId }: UseRecipeDetailOptions): UseRecipeDetailReturn => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getRecipe(recipeId);
      setRecipe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe');
      console.error('Failed to fetch recipe:', err);
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  const deleteRecipe = useCallback(async (): Promise<boolean> => {
    if (!recipe) return false;
    
    try {
      setIsDeleting(true);
      setError(null);
      await apiService.deleteRecipe(recipe.id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
      console.error('Failed to delete recipe:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [recipe]);

  const toggleFavorite = useCallback(async () => {
    if (!recipe || isToggling) return;
    
    try {
      setIsToggling(true);
      setError(null);
      
      // Optimistic update
      const updatedRecipe = { ...recipe, is_favorite: !recipe.is_favorite };
      setRecipe(updatedRecipe);
      
      // API call
      const result = await apiService.toggleFavorite(recipe.id);
      
      // Update with actual result
      setRecipe(prev => prev ? { ...prev, is_favorite: result.is_favorite } : null);
    } catch (err) {
      // Rollback on error
      setRecipe(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
      setError(err instanceof Error ? err.message : 'Failed to update favorite status');
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsToggling(false);
    }
  }, [recipe, isToggling]);

  const refetch = useCallback(async () => {
    await fetchRecipe();
  }, [fetchRecipe]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  return {
    recipe,
    isLoading,
    error,
    refetch,
    deleteRecipe,
    toggleFavorite,
    isDeleting,
    isToggling,
  };
};