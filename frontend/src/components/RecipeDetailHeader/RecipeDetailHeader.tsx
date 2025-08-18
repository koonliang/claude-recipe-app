import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '@/src/types';
import { colors, typography, spacing, borderRadius } from '@/src/utils/theme';

export interface RecipeDetailHeaderProps {
  recipe: Recipe;
  onToggleFavorite: (recipeId: string) => void;
  testID?: string;
}

export const RecipeDetailHeader = memo(({ 
  recipe, 
  onToggleFavorite,
  testID 
}: RecipeDetailHeaderProps) => {
  const handleFavoritePress = () => {
    onToggleFavorite(recipe.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: recipe.photo_url }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
          transition={300}
        />
        <View style={styles.overlay} />
        <Pressable
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          testID={`${testID}-favorite`}
        >
          <Ionicons
            name={recipe.is_favorite ? 'heart' : 'heart-outline'}
            size={28}
            color={recipe.is_favorite ? colors.primary : colors.white}
          />
        </Pressable>
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {recipe.category}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description}>
          {recipe.description}
        </Text>
        
        <View style={styles.metaInfo}>
          <View style={styles.statItem}>
            <Ionicons name="restaurant-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>
              {recipe.ingredients.length} ingredients
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="list-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>
              {recipe.steps.length} steps
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>
              {formatDate(recipe.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

RecipeDetailHeader.displayName = 'RecipeDetailHeader';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: borderRadius.full,
    padding: spacing.sm,
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  categoryText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});