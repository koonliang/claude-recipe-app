import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/src/utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  fullWidth = false 
}: ButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        fullWidth && styles.fullWidth
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
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
});