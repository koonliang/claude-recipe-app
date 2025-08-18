import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/src/utils/theme';
import { Button } from '@/src/components/Button';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { BasicInfoSection } from '@/src/components/BasicInfoSection';
import { IngredientsSection } from '@/src/components/IngredientsSection';
import { StepsSection } from '@/src/components/StepsSection';
import { useRecipeForm, UseRecipeFormParams } from '@/src/hooks/useRecipeForm';
import { Recipe } from '@/src/types';

export interface RecipeFormProps extends UseRecipeFormParams {
  onCancel?: () => void;
  onSuccess?: (recipe: Recipe) => void;
  onError?: (error: string) => void;
}

export function RecipeForm({
  mode,
  recipeId,
  onCancel,
  onSuccess,
  onError,
}: RecipeFormProps) {
  const {
    form,
    imageUri,
    setImageUri,
    isLoading,
    isSubmitting,
    error,
    hasUnsavedChanges,
    submitForm,
    resetForm,
  } = useRecipeForm({
    mode,
    recipeId,
    onSuccess,
    onError,
  });

  const { control, formState: { errors, isValid } } = form;

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: onCancel,
          },
        ]
      );
    } else {
      onCancel?.();
    }
  }, [hasUnsavedChanges, onCancel]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to reset all changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetForm,
        },
      ]
    );
  }, [resetForm]);

  const handleImageSelect = useCallback((uri: string) => {
    setImageUri(uri);
  }, [setImageUri]);

  const handleImageRemove = useCallback(() => {
    setImageUri(undefined);
  }, [setImageUri]);

  const handleSubmit = useCallback(async () => {
    try {
      await submitForm();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Form submission failed:', error);
    }
  }, [submitForm]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {mode === 'create' ? 'Create New Recipe' : 'Edit Recipe'}
          </Text>
          {hasUnsavedChanges && (
            <Text style={styles.unsavedIndicator}>• Unsaved changes</Text>
          )}
        </View>

        {error && (
          <ErrorMessage 
            message={error} 
            testID="recipe-form-error"
          />
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BasicInfoSection
            control={control}
            errors={errors}
            imageValue={imageUri}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
          />

          <IngredientsSection
            control={control}
            errors={errors}
          />

          <StepsSection
            control={control}
            errors={errors}
          />

          {/* Bottom padding for FAB */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleCancel}
              disabled={isSubmitting}
              style={styles.cancelButton}
              testID="cancel-button"
            />
            
            {hasUnsavedChanges && (
              <Button
                title="Reset"
                variant="secondary"
                onPress={handleReset}
                disabled={isSubmitting}
                style={styles.resetButton}
                testID="reset-button"
              />
            )}
            
            <Button
              title={mode === 'create' ? 'Create Recipe' : 'Update Recipe'}
              variant="primary"
              onPress={handleSubmit}
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
              style={styles.submitButton}
              testID="submit-button"
            />
          </View>
          
          <Text style={styles.footerHelp}>
            {isValid 
              ? 'All fields are valid. Ready to save!' 
              : 'Please fill all required fields to continue.'
            }
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  unsavedIndicator: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  bottomPadding: {
    height: 100, // Space for the fixed footer
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  resetButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  footerHelp: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});