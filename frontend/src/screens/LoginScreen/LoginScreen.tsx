import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Button, TextInput, ErrorMessage } from '@/src/components';
import { colors, typography, spacing } from '@/src/utils/theme';
import { useAuth } from '@/src/contexts';
import { LoginCredentials, AuthError } from '@/src/types';

const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setAuthError(null);

    try {
      await login(data);
      console.log('Login successful');
      router.replace('/home');
    } catch (error) {
      console.error('Login error:', error);
      
      if (error && typeof error === 'object' && 'message' in error) {
        const authError = error as AuthError;
        setAuthError(authError.message);
      } else {
        setAuthError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const navigateToSignup = () => {
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your MyRecipeBox account</Text>
          </View>

          <View style={styles.form}>
            {authError && (
              <ErrorMessage
                message={authError}
                visible={true}
                type="error"
              />
            )}

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
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  isPassword={true}
                  autoComplete="password"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              )}
            />

            <Button
              title={isLoading ? 'Signing In...' : 'Sign In'}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || !isDirty || isLoading}
              fullWidth
            />
          </View>

          <View style={styles.footer}>
            <Button
              title="Forgot Password?"
              onPress={handleForgotPassword}
              variant="outline"
              disabled={isLoading}
            />
            
            <View style={styles.signupPrompt}>
              <Text style={styles.signupText}>
                Don&apos;t have an account?{' '}
                <Pressable onPress={navigateToSignup}>
                  <Text style={styles.signupLink}>Sign up</Text>
                </Pressable>
              </Text>
            </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
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
    maxWidth: 280,
  },
  form: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  signupPrompt: {
    marginTop: spacing.md,
  },
  signupText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  signupLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});