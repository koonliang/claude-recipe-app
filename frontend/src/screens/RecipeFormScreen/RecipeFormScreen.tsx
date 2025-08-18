import React, { useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { RecipeForm } from '@/src/components/RecipeForm';
import { Recipe } from '@/src/types';
import { RecipeFormMode } from '@/src/types/recipeForm';

export function RecipeFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse navigation parameters
  const mode = (params.mode as RecipeFormMode) || 'create';
  const recipeId = params.recipeId as string | undefined;

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleSuccess = useCallback((recipe: Recipe) => {
    const successMessage = mode === 'create' 
      ? `Recipe "${recipe.title}" created successfully!`
      : `Recipe "${recipe.title}" updated successfully!`;

    // Show success message
    Alert.alert(
      'Success',
      successMessage,
      [
        {
          text: 'OK',
          onPress: () => {
            if (mode === 'create') {
              // Navigate to the new recipe detail screen
              router.replace({
                pathname: '/recipe-detail',
                params: { recipeId: recipe.id }
              });
            } else {
              // Navigate back to recipe detail screen
              router.back();
            }
          },
        },
      ]
    );
  }, [mode, router]);

  const handleError = useCallback((error: string) => {
    Alert.alert(
      'Error',
      error,
      [{ text: 'OK' }]
    );
  }, []);

  return (
    <RecipeForm
      mode={mode}
      recipeId={recipeId}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}