import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';

import { Button, TextInput, ErrorMessage, SuccessMessage } from '@/src/components';
import { theme } from '@/src/utils/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/src/validation/forgotPasswordSchema';
import type { ApiError } from '@/src/services/apiClient';

export const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (isLoading) return;

    setIsLoading(true);
    setApiError(null);

    try {
      await forgotPassword(data.email);
      setIsSuccess(true);
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        setApiError(error as ApiError);
      } else {
        setApiError({
          status: 0,
          message: 'Unable to send reset email. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleResendEmail = () => {
    setIsSuccess(false);
    if (email) {
      onSubmit({ email });
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Check Your Email</Text>
          
          <SuccessMessage
            message="Reset link sent!"
            description={`We&apos;ve sent a password reset link to ${email}. Please check your email and follow the instructions to reset your password.`}
            testID="forgot-password-success"
          />

          <Text style={styles.instructions}>
            Didn&apos;t receive the email? Check your spam folder or try again.
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Resend Email"
              onPress={handleResendEmail}
              variant="outline"
              style={styles.resendButton}
              disabled={isLoading}
              testID="resend-email-button"
            />
            
            <Button
              title="Back to Login"
              onPress={handleBackToLogin}
              style={styles.backButton}
              testID="back-to-login-button"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Email Address"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoFocus
                    error={errors.email?.message}
                    testID="email-input"
                  />
                )}
              />

              {apiError && (
                <ErrorMessage
                  message={apiError.message}
                  testID="forgot-password-error"
                />
              )}

              <Button
                title={isLoading ? "Sending..." : "Send Reset Link"}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isLoading}
                loading={isLoading}
                style={styles.submitButton}
                testID="send-reset-button"
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Remember your password?{' '}
              </Text>
              <Button
                title="Back to Login"
                onPress={handleBackToLogin}
                variant="link"
                testID="back-to-login-link"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  form: {
    gap: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  instructions: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  resendButton: {
    backgroundColor: 'transparent',
  },
  backButton: {
    marginTop: theme.spacing.sm,
  },
});