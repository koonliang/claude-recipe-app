import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '@/src/types';
import { colors, typography, spacing, borderRadius } from '@/src/utils/theme';

export interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
  testID?: string;
}

export const RecipeCard = memo(({ 
  recipe, 
  onPress, 
  onToggleFavorite,
  testID 
}: RecipeCardProps) => {
  const handlePress = () => {
    onPress(recipe);
  };

  const handleFavoritePress = () => {
    onToggleFavorite(recipe.id);
  };

  return (
    <Pressable 
      style={styles.container}
      onPress={handlePress}
      testID={testID}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: recipe.photo_url }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
          transition={200}
        />
        <Pressable
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          testID={`${testID}-favorite`}
        >
          <Ionicons
            name={recipe.is_favorite ? 'heart' : 'heart-outline'}
            size={24}
            color={recipe.is_favorite ? colors.primary : colors.white}
          />
        </Pressable>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {recipe.category}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.ingredientCount}>
            {recipe.ingredients.length} ingredients
          </Text>
          <Text style={styles.stepCount}>
            {recipe.steps.length} steps
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

RecipeCard.displayName = 'RecipeCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.full,
    padding: spacing.xs,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stepCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});