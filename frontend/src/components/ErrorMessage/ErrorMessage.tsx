import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/src/utils/theme';

export interface ErrorMessageProps {
  message: string;
  visible?: boolean;
  type?: 'error' | 'warning' | 'info';
  showIcon?: boolean;
  onRetry?: () => void;
  showRetry?: boolean;
  testID?: string;
}

export function ErrorMessage({
  message,
  visible = true,
  type = 'error',
  showIcon = true,
  onRetry,
  showRetry = true,
  testID,
}: ErrorMessageProps) {
  if (!visible || !message) {
    return null;
  }

  const getIconName = () => {
    switch (type) {
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'alert-circle';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.error;
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.messageContainer}>
        {showIcon && (
          <Ionicons
            name={getIconName()}
            size={16}
            color={getTextColor()}
            style={styles.icon}
          />
        )}
        <Text style={[styles.message, { color: getTextColor() }]}>
          {message}
        </Text>
      </View>
      {onRetry && showRetry && (
        <Pressable 
          style={styles.retryButton} 
          onPress={onRetry}
          testID={`${testID}-retry`}
        >
          <Ionicons name="refresh" size={16} color={colors.primary} />
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
    marginTop: 2,
  },
  message: {
    flex: 1,
    ...typography.bodySmall,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  retryText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
});