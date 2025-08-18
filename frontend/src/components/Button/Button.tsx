import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '@/src/utils/theme';

export interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'link' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function Button({ 
  title, 
  children,
  onPress, 
  variant = 'primary', 
  disabled = false,
  fullWidth = false,
  loading = false,
  style,
  testID
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <Pressable
      style={[
        styles.button,
        styles[variant],
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
    >
      {children || (
        <Text style={[styles.text, styles[`${variant}Text`]]}>
          {loading ? 'Loading...' : title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  link: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: spacing.xs,
  },
  danger: {
    backgroundColor: '#DC2626',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    ...typography.button,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  linkText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.white,
  },
});