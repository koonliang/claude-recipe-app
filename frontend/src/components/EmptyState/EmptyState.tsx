import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components';
import { colors, typography, spacing } from '@/src/utils/theme';

export interface EmptyStateProps {
  type: 'no-recipes' | 'no-search-results' | 'no-favorites' | 'error';
  searchQuery?: string;
  onAction?: () => void;
  actionTitle?: string;
  testID?: string;
}

export function EmptyState({ 
  type, 
  searchQuery, 
  onAction, 
  actionTitle,
  testID 
}: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'no-recipes':
        return {
          icon: 'restaurant-outline' as const,
          title: 'No Recipes Yet',
          message: 'Start building your recipe collection by adding your first recipe.',
          actionTitle: actionTitle || 'Add Recipe',
        };
      case 'no-search-results':
        return {
          icon: 'search-outline' as const,
          title: 'No Results Found',
          message: searchQuery 
            ? `No recipes found for "${searchQuery}". Try a different search term.`
            : 'No recipes match your search criteria.',
          actionTitle: actionTitle || 'Clear Search',
        };
      case 'no-favorites':
        return {
          icon: 'heart-outline' as const,
          title: 'No Favorites Yet',
          message: 'Tap the heart icon on recipes you love to add them to your favorites.',
          actionTitle: actionTitle || 'Browse Recipes',
        };
      case 'error':
        return {
          icon: 'alert-circle-outline' as const,
          title: 'Something Went Wrong',
          message: 'Unable to load recipes. Please check your connection and try again.',
          actionTitle: actionTitle || 'Try Again',
        };
      default:
        return {
          icon: 'help-outline' as const,
          title: 'Empty',
          message: 'Nothing to show here.',
          actionTitle: actionTitle || 'Continue',
        };
    }
  };

  const content = getContent();

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={content.icon} 
          size={64} 
          color={colors.textSecondary}
        />
      </View>
      
      <Text style={styles.title}>
        {content.title}
      </Text>
      
      <Text style={styles.message}>
        {content.message}
      </Text>
      
      {onAction && (
        <Button
          title={content.actionTitle}
          onPress={onAction}
          variant="outline"
          style={styles.button}
          testID={`${testID}-action`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 120,
  },
});