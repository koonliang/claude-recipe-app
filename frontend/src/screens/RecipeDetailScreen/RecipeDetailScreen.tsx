import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { RecipeDetailHeader } from '@/src/components/RecipeDetailHeader';
import { IngredientsList } from '@/src/components/IngredientsList';
import { CookingSteps } from '@/src/components/CookingSteps';
import { RecipeActions } from '@/src/components/RecipeActions';
import { ConfirmationDialog } from '@/src/components/ConfirmationDialog';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { useRecipeDetail, useConfirmDialog } from '@/src/hooks';
import { colors, spacing } from '@/src/utils/theme';
import { isDemoMode } from '@/src/services/apiService';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    recipe,
    isLoading,
    error,
    refetch,
    deleteRecipe,
    toggleFavorite,
    isDeleting,
  } = useRecipeDetail({ recipeId: id || '' });

  const handleDeleteConfirm = async () => {
    const success = await deleteRecipe();
    if (success) {
      Alert.alert(
        'Recipe Deleted', 
        'The recipe has been successfully deleted.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert('Error', 'Failed to delete recipe. Please try again.');
    }
  };

  const {
    showDialog: showDeleteDialog,
    dialogProps: deleteDialogProps,
  } = useConfirmDialog(handleDeleteConfirm, {
    title: 'Delete Recipe',
    message: 'Are you sure you want to delete this recipe? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
  });

  if (!id) {
    Alert.alert('Error', 'Recipe ID is required', [
      { text: 'Go Back', onPress: () => router.back() }
    ]);
    return null;
  }

  const handleShare = () => {
    // TODO: Implement recipe sharing functionality
    Alert.alert('Coming Soon', 'Recipe sharing feature will be available soon!');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ErrorMessage 
            message="Loading recipe..." 
            showRetry={false}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ErrorMessage 
            message={error || 'Recipe not found'} 
            onRetry={refetch}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <RecipeDetailHeader 
          recipe={recipe}
          onToggleFavorite={toggleFavorite}
          testID="recipe-detail-header"
        />
        
        <IngredientsList 
          ingredients={recipe.ingredients}
          testID="ingredients-list"
        />
        
        <CookingSteps 
          steps={recipe.steps}
          testID="cooking-steps"
        />
        
        {!isDemoMode() && (
          <RecipeActions 
            onDelete={showDeleteDialog}
            onShare={handleShare}
            isDeleting={isDeleting}
            testID="recipe-actions"
          />
        )}
      </ScrollView>
      
      <ConfirmationDialog {...deleteDialogProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
});