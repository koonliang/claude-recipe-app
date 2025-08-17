import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/src/utils/theme';

interface ErrorMessageProps {
  message: string;
  visible?: boolean;
  type?: 'error' | 'warning' | 'info';
  showIcon?: boolean;
}

export default function ErrorMessage({
  message,
  visible = true,
  type = 'error',
  showIcon = true,
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
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
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
});