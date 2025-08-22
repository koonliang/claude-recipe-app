import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';

import { 
  Button, 
  TextInput, 
  ErrorMessage, 
  SuccessMessage,
  PasswordStrengthIndicator 
} from '@/src/components';
import { theme } from '@/src/utils/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/src/validation/resetPasswordSchema';
import { calculatePasswordStrength } from '@/src/utils/passwordValidation';
import { isValidJWTFormat, isJWTExpired } from '@/src/utils/tokenValidation';
import type { ApiError } from '@/src/services/apiClient';

export const ResetPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { token: routeToken } = useLocalSearchParams<{ token?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const newPassword = watch('newPassword');
  const passwordStrength = newPassword ? calculatePasswordStrength(newPassword) : null;

  useEffect(() => {
    // Extract token from route params (from deep link)
    if (routeToken) {
      // Validate token format
      if (typeof routeToken === 'string' && isValidJWTFormat(routeToken)) {
        // Check if token appears expired (client-side check)
        if (isJWTExpired(routeToken)) {
          setTokenError('This reset link has expired. Please request a new password reset.');
        } else {
          setToken(routeToken);
        }
      } else {
        setTokenError('Invalid reset link format. Please request a new password reset.');
      }
    } else {
      setTokenError('No reset token provided. Please use the link from your email.');
    }
  }, [routeToken]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (isLoading || !token) return;

    setIsLoading(true);
    setApiError(null);

    try {
      await resetPassword(token, data.newPassword);
      setIsSuccess(true);
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        const apiError = error as ApiError;
        
        // Handle specific error cases
        if (apiError.message.toLowerCase().includes('token') || 
            apiError.message.toLowerCase().includes('expired')) {
          setTokenError('This reset link has expired or is invalid. Please request a new password reset.');
        } else {
          setApiError(apiError);
        }
      } else {
        setApiError({
          status: 0,
          message: 'Unable to reset password. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleRequestNewReset = () => {
    router.push('/forgot-password');
  };

  // Show token error screen
  if (tokenError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Invalid Reset Link</Text>
          
          <ErrorMessage
            message={tokenError}
            testID="token-error"
          />

          <Text style={styles.instructions}>
            Reset links expire after 2 hours for your security. Please request a new password reset.
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Request New Reset"
              onPress={handleRequestNewReset}
              style={styles.primaryButton}
              testID="request-new-reset-button"
            />
            
            <Button
              title="Back to Login"
              onPress={handleBackToLogin}
              variant="outline"
              style={styles.secondaryButton}
              testID="back-to-login-button"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show success screen
  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Password Reset Complete</Text>
          
          <SuccessMessage
            message="Your password has been successfully reset!"
            description="You can now log in with your new password."
            testID="reset-password-success"
          />

          <Button
            title="Continue to Login"
            onPress={handleBackToLogin}
            style={styles.primaryButton}
            testID="continue-to-login-button"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show main reset password form
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below.
            </Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="New Password"
                    placeholder="Enter new password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    autoFocus
                    error={errors.newPassword?.message}
                    rightIcon={
                      <Button
                        title={showNewPassword ? "👁️" : "👁️‍🗨️"}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        variant="link"
                        style={styles.eyeButton}
                        testID="toggle-new-password-visibility"
                      />
                    }
                    testID="new-password-input"
                  />
                )}
              />

              {newPassword && passwordStrength && (
                <PasswordStrengthIndicator 
                  password={newPassword}
                  strength={passwordStrength}
                />
              )}

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    rightIcon={
                      <Button
                        title={showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        variant="link"
                        style={styles.eyeButton}
                        testID="toggle-confirm-password-visibility"
                      />
                    }
                    testID="confirm-password-input"
                  />
                )}
              />

              {apiError && (
                <ErrorMessage
                  message={apiError.message}
                  testID="reset-password-error"
                />
              )}

              <Button
                title={isLoading ? "Resetting..." : "Reset Password"}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isLoading || !token}
                loading={isLoading}
                style={styles.submitButton}
                testID="reset-password-button"
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
    marginTop: theme.spacing.lg,
  },
  primaryButton: {
    marginBottom: theme.spacing.sm,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  eyeButton: {
    padding: 0,
    minHeight: 'auto',
  },
});