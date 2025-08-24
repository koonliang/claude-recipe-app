import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import { colors, typography, spacing } from '@/src/utils/theme';
import { TextInput } from '@/src/components/TextInput';
import { ImagePicker } from '@/src/components/ImagePicker';
import { RecipeFormData, recipeCategories } from '@/src/validation/recipeFormSchema';

export interface BasicInfoSectionProps {
  control: Control<RecipeFormData>;
  errors: FieldErrors<RecipeFormData>;
  imageValue?: string;
  onImageSelect: (imageUri: string) => void;
  onImageRemove: () => void;
}

export function BasicInfoSection({
  control,
  errors,
  imageValue,
  onImageSelect,
  onImageRemove,
}: BasicInfoSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Recipe Title *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.title?.message}
            placeholder="Enter recipe title"
            maxLength={100}
            testID="recipe-title-input"
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Description *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.description?.message}
            placeholder="Describe your recipe"
            multiline
            numberOfLines={4}
            maxLength={500}
            testID="recipe-description-input"
          />
        )}
      />

      <View style={styles.categoryContainer}>
        <Text style={[styles.categoryLabel, errors.category && styles.categoryLabelError]}>
          Category *
        </Text>
        <View style={[
          styles.pickerContainer,
          errors.category && styles.pickerContainerError,
        ]}>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value || ""}
                onValueChange={(itemValue) => {
                  if (itemValue !== "") {
                    onChange(itemValue);
                  }
                }}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                testID="recipe-category-picker"
                mode="dropdown"
              >
                <Picker.Item 
                  label="Select a category" 
                  value="" 
                  color={colors.placeholder || '#999999'}
                  enabled={false}
                />
                {recipeCategories.map((category) => (
                  <Picker.Item
                    key={category}
                    label={category}
                    value={category}
                    color={colors.text || '#000000'}
                  />
                ))}
              </Picker>
            )}
          />
        </View>
        {errors.category && (
          <Text style={styles.categoryError} testID="category-error">
            {errors.category.message}
          </Text>
        )}
      </View>

      <View style={styles.imageSection}>
        <Text style={styles.imageSectionTitle}>Recipe Photo</Text>
        <ImagePicker
          value={imageValue}
          onImageSelect={onImageSelect}
          onImageRemove={onImageRemove}
          error={errors.photo_url?.message}
          placeholder="Add a photo to make your recipe more appealing"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: spacing.md,
  },
  categoryLabel: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  categoryLabelError: {
    color: colors.error,
  },
  pickerContainer: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    minHeight: 48,
    overflow: 'hidden',
  },
  pickerContainerError: {
    borderColor: colors.error,
  },
  picker: {
    height: 48,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 8,
  },
  pickerItem: {
    ...typography.body,
    color: colors.text,
    fontSize: 16,
  },
  categoryError: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  imageSection: {
    marginTop: spacing.md,
  },
  imageSectionTitle: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
});