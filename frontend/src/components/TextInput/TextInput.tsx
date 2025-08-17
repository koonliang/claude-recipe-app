import React, { useState } from 'react';
import { 
  View, 
  TextInput as RNTextInput, 
  Text, 
  StyleSheet, 
  Pressable,
  TextInputProps as RNTextInputProps 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/src/utils/theme';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function TextInput({
  label,
  error,
  helperText,
  isPassword = false,
  fullWidth = true,
  disabled = false,
  value,
  onChangeText,
  ...props
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = !!error;
  const showHelperText = error || helperText;

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      <Text style={[styles.label, hasError && styles.labelError]}>
        {label}
      </Text>
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        hasError && styles.inputContainerError,
        disabled && styles.inputContainerDisabled,
      ]}>
        <RNTextInput
          style={[
            styles.input,
            disabled && styles.inputDisabled,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          editable={!disabled}
          placeholderTextColor={colors.placeholder}
          {...props}
        />
        
        {isPassword && (
          <Pressable
            style={styles.passwordToggle}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      
      {showHelperText && (
        <Text style={[
          styles.helperText,
          hasError && styles.helperTextError,
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  labelError: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.inputBorderFocus,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputContainerDisabled: {
    opacity: 0.6,
    backgroundColor: colors.surfaceVariant,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.inputText,
    paddingVertical: spacing.sm,
  },
  inputDisabled: {
    color: colors.textDisabled,
  },
  passwordToggle: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  helperTextError: {
    color: colors.error,
  },
});