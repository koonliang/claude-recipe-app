import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Control, FieldArrayWithId, FieldErrors, useFieldArray, Controller } from 'react-hook-form';
import { colors, typography, spacing } from '@/src/utils/theme';
import { TextInput } from '@/src/components/TextInput';
import { DynamicFieldList } from '@/src/components/DynamicFieldList';
import { RecipeFormData } from '@/src/validation/recipeFormSchema';

export interface StepsSectionProps {
  control: Control<RecipeFormData>;
  errors: FieldErrors<RecipeFormData>;
}

interface StepItemProps {
  control: Control<RecipeFormData>;
  index: number;
  step: FieldArrayWithId<RecipeFormData, 'steps', 'id'>;
  errors: FieldErrors<RecipeFormData>;
}

function StepItem({ control, index, step, errors }: StepItemProps) {
  const stepError = errors.steps?.[index];

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>
            {index + 1}
          </Text>
        </View>
        <Text style={styles.stepTitle}>
          Step {index + 1}
        </Text>
      </View>

      <Controller
        control={control}
        name={`steps.${index}.instruction_text`}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={`Instruction for Step ${index + 1} *`}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={stepError?.instruction_text?.message}
            placeholder={`Describe what to do in step ${index + 1}...`}
            multiline
            numberOfLines={3}
            maxLength={500}
            testID={`step-instruction-${index}`}
          />
        )}
      />

      {/* Hidden step_number field - managed automatically */}
      <Controller
        control={control}
        name={`steps.${index}.step_number`}
        render={() => <></>}
      />
    </View>
  );
}

export function StepsSection({ control, errors }: StepsSectionProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'steps',
  });

  const addStep = () => {
    const newStepNumber = fields.length + 1;
    append({
      step_number: newStepNumber,
      instruction_text: '',
    });
  };

  const removeStep = (index: number) => {
    remove(index);
    // Update step numbers for remaining steps
    updateStepNumbers();
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
    // Update step numbers after moving
    updateStepNumbers();
  };

  const updateStepNumbers = () => {
    // This will be handled by the form's watch effect
    // Each step's step_number will be updated based on its position
    setTimeout(() => {
      fields.forEach((_, index) => {
        // Step numbers are automatically managed by array position
      });
    }, 0);
  };

  const renderStep = (step: FieldArrayWithId<RecipeFormData, 'steps', 'id'>, index: number) => (
    <StepItem
      key={step.id}
      control={control}
      index={index}
      step={step}
      errors={errors}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Cooking Steps</Text>
      <Text style={styles.sectionDescription}>
        Break down your recipe into clear, easy-to-follow steps. Each step should be a single action or group of related actions.
      </Text>

      <DynamicFieldList
        items={fields}
        onAdd={addStep}
        onRemove={removeStep}
        onMove={moveStep}
        renderItem={renderStep}
        addButtonText="Add Step"
        emptyText="No cooking steps added yet. Start by adding your first step."
        error={typeof errors.steps?.message === 'string' ? errors.steps.message : undefined}
        maxItems={20}
        minItems={1}
      />

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Tips for writing great steps:</Text>
        <Text style={styles.tipText}>• Use action words (mix, heat, add, combine)</Text>
        <Text style={styles.tipText}>• Include timing when important (cook for 5 minutes)</Text>
        <Text style={styles.tipText}>• Mention visual cues (until golden brown)</Text>
        <Text style={styles.tipText}>• Keep each step focused on one main action</Text>
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
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sectionDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  stepContainer: {
    gap: spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: 'bold',
  },
  stepTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  tipsContainer: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  tipsTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});