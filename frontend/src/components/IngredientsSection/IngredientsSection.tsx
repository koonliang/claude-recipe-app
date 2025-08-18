import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Control, FieldArrayWithId, FieldErrors, useFieldArray, Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import { colors, typography, spacing } from '@/src/utils/theme';
import { TextInput } from '@/src/components/TextInput';
import { DynamicFieldList } from '@/src/components/DynamicFieldList';
import { RecipeFormData, commonUnits } from '@/src/validation/recipeFormSchema';

export interface IngredientsSectionProps {
  control: Control<RecipeFormData>;
  errors: FieldErrors<RecipeFormData>;
}

interface IngredientItemProps {
  control: Control<RecipeFormData>;
  index: number;
  ingredient: FieldArrayWithId<RecipeFormData, 'ingredients', 'id'>;
  errors: FieldErrors<RecipeFormData>;
}

function IngredientItem({ control, index, ingredient, errors }: IngredientItemProps) {
  const ingredientError = errors.ingredients?.[index];

  return (
    <View style={styles.ingredientContainer}>
      <View style={styles.ingredientRow}>
        <View style={styles.quantityContainer}>
          <Controller
            control={control}
            name={`ingredients.${index}.quantity`}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Quantity *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={ingredientError?.quantity?.message}
                placeholder="1"
                keyboardType="numeric"
                testID={`ingredient-quantity-${index}`}
              />
            )}
          />
        </View>

        <View style={styles.unitContainer}>
          <Text style={[styles.unitLabel, ingredientError?.unit && styles.unitLabelError]}>
            Unit *
          </Text>
          <View style={[
            styles.unitPickerContainer,
            ingredientError?.unit && styles.unitPickerContainerError,
          ]}>
            <Controller
              control={control}
              name={`ingredients.${index}.unit`}
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.unitPicker}
                  testID={`ingredient-unit-${index}`}
                >
                  <Picker.Item 
                    label="Unit" 
                    value="" 
                    color={colors.placeholder}
                  />
                  {commonUnits.map((unit) => (
                    <Picker.Item
                      key={unit}
                      label={unit}
                      value={unit}
                      color={colors.text}
                    />
                  ))}
                </Picker>
              )}
            />
          </View>
          {ingredientError?.unit && (
            <Text style={styles.unitError} testID={`ingredient-unit-error-${index}`}>
              {ingredientError.unit.message}
            </Text>
          )}
        </View>
      </View>

      <Controller
        control={control}
        name={`ingredients.${index}.name`}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Ingredient Name *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={ingredientError?.name?.message}
            placeholder="e.g. All-purpose flour"
            maxLength={100}
            testID={`ingredient-name-${index}`}
          />
        )}
      />
    </View>
  );
}

export function IngredientsSection({ control, errors }: IngredientsSectionProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const addIngredient = () => {
    append({
      name: '',
      quantity: '',
      unit: '',
    });
  };

  const removeIngredient = (index: number) => {
    remove(index);
  };

  const moveIngredient = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
  };

  const renderIngredient = (ingredient: FieldArrayWithId<RecipeFormData, 'ingredients', 'id'>, index: number) => (
    <IngredientItem
      key={ingredient.id}
      control={control}
      index={index}
      ingredient={ingredient}
      errors={errors}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ingredients</Text>
      <Text style={styles.sectionDescription}>
        Add all the ingredients needed for your recipe. Be specific with quantities and units.
      </Text>

      <DynamicFieldList
        items={fields}
        onAdd={addIngredient}
        onRemove={removeIngredient}
        onMove={moveIngredient}
        renderItem={renderIngredient}
        addButtonText="Add Ingredient"
        emptyText="No ingredients added yet. Start by adding your first ingredient."
        error={typeof errors.ingredients?.message === 'string' ? errors.ingredients.message : undefined}
        maxItems={50}
        minItems={1}
      />
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
  ingredientContainer: {
    gap: spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quantityContainer: {
    flex: 1,
  },
  unitContainer: {
    flex: 1,
  },
  unitLabel: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  unitLabelError: {
    color: colors.error,
  },
  unitPickerContainer: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    minHeight: 48,
  },
  unitPickerContainerError: {
    borderColor: colors.error,
  },
  unitPicker: {
    height: 48,
    color: colors.text,
  },
  unitError: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});