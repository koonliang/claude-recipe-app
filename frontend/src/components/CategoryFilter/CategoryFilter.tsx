import React from 'react';
import { 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable 
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/src/utils/theme';
import { mockCategories } from '@/src/data/mockData';

export interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  testID?: string;
}

export function CategoryFilter({ 
  selectedCategory, 
  onCategorySelect,
  testID 
}: CategoryFilterProps) {
  const categories = ['All', ...mockCategories];

  const handleCategoryPress = (category: string) => {
    const categoryValue = category === 'All' ? null : category;
    onCategorySelect(categoryValue);
  };

  const isSelected = (category: string) => {
    if (category === 'All') {
      return selectedCategory === null;
    }
    return selectedCategory === category;
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
      testID={testID}
    >
      {categories.map((category) => (
        <Pressable
          key={category}
          style={[
            styles.chip,
            isSelected(category) && styles.chipSelected,
          ]}
          onPress={() => handleCategoryPress(category)}
          testID={`${testID}-${category.toLowerCase()}`}
        >
          <Text style={[
            styles.chipText,
            isSelected(category) && styles.chipTextSelected,
          ]}>
            {category}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
});