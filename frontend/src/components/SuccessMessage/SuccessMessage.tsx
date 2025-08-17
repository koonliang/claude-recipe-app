import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/src/utils/theme';

interface SuccessMessageProps {
  message: string;
  description?: string;
  testID?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  description,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✅</Text>
      </View>
      <Text style={styles.message} accessibilityRole="text">
        {message}
      </Text>
      {description && (
        <Text style={styles.description} accessibilityRole="text">
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  icon: {
    fontSize: 32,
    color: theme.colors.success,
  },
  message: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});