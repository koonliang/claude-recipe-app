import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components/Button';
import { colors, spacing } from '@/src/utils/theme';

export interface RecipeActionsProps {
  onEdit?: () => void;
  onDelete: () => void;
  onShare?: () => void;
  isDeleting?: boolean;
  testID?: string;
}

export const RecipeActions = memo(({ 
  onEdit,
  onDelete, 
  onShare,
  isDeleting = false,
  testID 
}: RecipeActionsProps) => {
  return (
    <View style={styles.container} testID={testID}>
      {onEdit && (
        <Button
          variant="primary"
          onPress={onEdit}
          style={styles.editButton}
          testID={`${testID}-edit`}
        >
          <Ionicons name="create-outline" size={18} color={colors.white} />
          Edit Recipe
        </Button>
      )}
      
      <Button
        variant="danger"
        onPress={onDelete}
        disabled={isDeleting}
        loading={isDeleting}
        style={styles.deleteButton}
        testID={`${testID}-delete`}
      >
        <Ionicons name="trash-outline" size={18} color={colors.white} />
        Delete Recipe
      </Button>
      
      {onShare && (
        <Button
          variant="outline"
          onPress={onShare}
          style={styles.shareButton}
          testID={`${testID}-share`}
        >
          <Ionicons name="share-outline" size={18} color={colors.primary} />
          Share Recipe
        </Button>
      )}
    </View>
  );
});

RecipeActions.displayName = 'RecipeActions';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});