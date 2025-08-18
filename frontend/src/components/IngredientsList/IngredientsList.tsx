import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ingredient } from '@/src/types';
import { colors, typography, spacing, borderRadius } from '@/src/utils/theme';

export interface IngredientsListProps {
  ingredients: Ingredient[];
  testID?: string;
}

export const IngredientsList = memo(({ ingredients, testID }: IngredientsListProps) => {
  const formatIngredient = (ingredient: Ingredient) => {
    const quantity = ingredient.quantity.trim();
    const unit = ingredient.unit.trim();
    const name = ingredient.name.trim();
    
    return `${quantity} ${unit} ${name}`.trim();
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Ionicons name="restaurant" size={24} color={colors.primary} />
        <Text style={styles.title}>Ingredients</Text>
        <View style={styles.count}>
          <Text style={styles.countText}>{ingredients.length}</Text>
        </View>
      </View>
      
      <View style={styles.ingredientsList}>
        {ingredients.map((ingredient, index) => (
          <View key={ingredient.id} style={styles.ingredientItem}>
            <View style={styles.bullet} />
            <Text style={styles.ingredientText}>
              {formatIngredient(ingredient)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

IngredientsList.displayName = 'IngredientsList';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    margin: spacing.md,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.sm,
  },
  count: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  countText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  ingredientsList: {
    gap: spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 10,
    marginRight: spacing.md,
    flexShrink: 0,
  },
  ingredientText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
});