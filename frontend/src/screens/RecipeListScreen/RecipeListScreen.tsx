import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { router } from 'expo-router';
import { RecipeCard } from '@/src/components/RecipeCard';
import { SearchBar } from '@/src/components/SearchBar';
import { CategoryFilter } from '@/src/components/CategoryFilter';
import { EmptyState } from '@/src/components/EmptyState';
import { useRecipes, useDebounce } from '@/src/hooks';
import { Recipe } from '@/src/types';
import { colors, spacing } from '@/src/utils/theme';

export default function RecipeListScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(searchText, 300);
  
  const {
    recipes,
    isLoading,
    error,
    isRefreshing,
    refetch,
    refresh,
    toggleFavorite,
  } = useRecipes({
    category: selectedCategory,
    search: debouncedSearch,
  });

  const handleRecipePress = useCallback((recipe: Recipe) => {
    router.push(`/recipe/${recipe.id}` as any);
  }, []);

  const handleClearSearch = () => {
    setSearchText('');
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleAddRecipe = useCallback(() => {
    // TODO: Navigate to recipe creation screen when implemented
    console.log('Navigate to add recipe');
  }, []);

  const getEmptyStateType = useCallback(() => {
    if (error) return 'error';
    if (debouncedSearch && recipes.length === 0) return 'no-search-results';
    if (recipes.length === 0) return 'no-recipes';
    return 'no-recipes';
  }, [error, debouncedSearch, recipes.length]);

  const renderRecipeCard: ListRenderItem<Recipe> = ({ item, index }) => (
    <RecipeCard
      recipe={item}
      onPress={handleRecipePress}
      onToggleFavorite={toggleFavorite}
      testID={`recipe-card-${index}`}
    />
  );

  const keyExtractor = (item: Recipe) => item.id;

  const getItemLayout = (_: any, index: number) => ({
    length: 280, // Estimated card height
    offset: 280 * index,
    index,
  });

  const ListHeaderComponent = useMemo(() => (
    <View style={styles.header}>
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        onClear={handleClearSearch}
        testID="recipe-search"
      />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        testID="category-filter"
      />
    </View>
  ), [searchText, selectedCategory]);

  const ListEmptyComponent = useMemo(() => (
    <EmptyState
      type={getEmptyStateType()}
      searchQuery={debouncedSearch}
      onAction={error ? handleRetry : handleAddRecipe}
      testID="recipe-list-empty"
    />
  ), [error, debouncedSearch, getEmptyStateType, handleRetry, handleAddRecipe]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recipes}
        renderItem={renderRecipeCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={!isLoading ? ListEmptyComponent : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={recipes.length === 0 ? styles.emptyContainer : undefined}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        testID="recipe-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flexGrow: 1,
    paddingTop: spacing.md,
  },
});