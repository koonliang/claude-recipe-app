import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/src/utils/theme';
import { Button } from '@/src/components/Button';

export interface DynamicFieldListProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove?: (fromIndex: number, toIndex: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  addButtonText: string;
  emptyText: string;
  title?: string;
  error?: string;
  maxItems?: number;
  minItems?: number;
}

export function DynamicFieldList<T>({
  items,
  onAdd,
  onRemove,
  onMove,
  renderItem,
  addButtonText,
  emptyText,
  title,
  error,
  maxItems = 50,
  minItems = 1,
}: DynamicFieldListProps<T>) {
  const canAdd = items.length < maxItems;
  const canRemove = items.length > minItems;

  const handleRemove = (index: number) => {
    if (!canRemove) {
      Alert.alert(
        'Cannot Remove',
        `You must have at least ${minItems} item${minItems > 1 ? 's' : ''}.`
      );
      return;
    }

    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemove(index) },
      ]
    );
  };

  const handleAdd = () => {
    if (!canAdd) {
      Alert.alert(
        'Maximum Reached',
        `You can only add up to ${maxItems} items.`
      );
      return;
    }
    onAdd();
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="list-outline" 
            size={48} 
            color={colors.textSecondary} 
          />
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <View style={styles.itemContent}>
                {renderItem(item, index)}
              </View>
              
              {canRemove && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemove(index)}
                  testID={`remove-item-${index}`}
                >
                  <Ionicons 
                    name="trash-outline" 
                    size={20} 
                    color={colors.error} 
                  />
                </TouchableOpacity>
              )}
              
              {onMove && items.length > 1 && (
                <View style={styles.moveButtons}>
                  {index > 0 && (
                    <TouchableOpacity
                      style={styles.moveButton}
                      onPress={() => onMove(index, index - 1)}
                      testID={`move-up-${index}`}
                    >
                      <Ionicons 
                        name="chevron-up" 
                        size={16} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>
                  )}
                  
                  {index < items.length - 1 && (
                    <TouchableOpacity
                      style={styles.moveButton}
                      onPress={() => onMove(index, index + 1)}
                      testID={`move-down-${index}`}
                    >
                      <Ionicons 
                        name="chevron-down" 
                        size={16} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.addButtonContainer}>
        <Button
          title={addButtonText}
          variant="outline"
          onPress={handleAdd}
          disabled={!canAdd}
          style={styles.addButton}
          testID="add-item-button"
        >
          <View style={styles.addButtonContent}>
            <Ionicons 
              name="add" 
              size={20} 
              color={canAdd ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.addButtonText, 
                !canAdd && styles.addButtonTextDisabled
              ]}
            >
              {addButtonText}
            </Text>
          </View>
        </Button>
      </View>

      {error && (
        <Text style={styles.errorText} testID="dynamic-list-error">
          {error}
        </Text>
      )}

      {maxItems && (
        <Text style={styles.helperText}>
          {items.length} of {maxItems} items
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  itemsContainer: {
    gap: spacing.sm,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemContent: {
    flex: 1,
  },
  removeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
    borderRadius: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  moveButtons: {
    marginLeft: spacing.sm,
    gap: spacing.xs,
  },
  moveButton: {
    padding: spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  addButtonContainer: {
    marginTop: spacing.md,
  },
  addButton: {
    borderStyle: 'dashed',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  addButtonTextDisabled: {
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});