import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { 
  TextInput, 
  Button, 
  ErrorMessage, 
  PasswordStrengthIndicator 
} from '@/src/components';
import { colors, typography, spacing } from '@/src/utils/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { validatePasswordStrength } from '@/src/utils/passwordValidation';
import { signupSchema, SignupFormData } from '@/src/validation/signupSchema';
import { ApiError } from '@/src/services/apiClient';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const password = watch('password');
  const passwordStrength = validatePasswordStrength(password || '');

  const onSubmit = async (data: SignupFormData) => {
    if (isLoading) return;

    setApiError(null);

    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Navigate to home screen after successful signup
      router.replace('/');
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle API errors with specific messages
      if (error && typeof error === 'object' && 'message' in error) {
        const apiError = error as ApiError;
        setApiError(apiError.message || 'Signup failed. Please try again.');
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Sign up to start managing your recipes
            </Text>
          </View>

          <View style={styles.form}>
            {apiError && (
              <View style={styles.apiError}>
                <ErrorMessage message={apiError} />
              </View>
            )}

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Full Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  accessibilityLabel="Full name input"
                  accessibilityHint="Enter your full name"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email Address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  accessibilityLabel="Email address input"
                  accessibilityHint="Enter your email address"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    placeholder="Create a password"
                    isPassword
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    accessibilityLabel="Password input"
                    accessibilityHint="Create a secure password"
                  />
                  
                  <PasswordStrengthIndicator
                    strength={passwordStrength}
                    password={value}
                  />
                </View>
              )}
            />

            <View style={styles.submitButton}>
              <Button
                title={isLoading ? 'Creating Account...' : 'Create Account'}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || !isDirty || isLoading}
                fullWidth
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Pressable onPress={navigateToLogin}>
                <Text style={styles.loginLink}>Sign in</Text>
              </Pressable>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  form: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  apiError: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});