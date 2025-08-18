import * as yup from 'yup';

// Ingredient validation schema
const ingredientSchema = yup.object().shape({
  name: yup
    .string()
    .required('Ingredient name is required')
    .min(1, 'Ingredient name cannot be empty')
    .max(100, 'Ingredient name must be less than 100 characters')
    .trim(),
  quantity: yup
    .string()
    .required('Quantity is required')
    .min(1, 'Quantity cannot be empty')
    .max(20, 'Quantity must be less than 20 characters')
    .trim(),
  unit: yup
    .string()
    .required('Unit is required')
    .min(1, 'Unit cannot be empty')
    .max(20, 'Unit must be less than 20 characters')
    .trim(),
});

// Recipe step validation schema
const stepSchema = yup.object().shape({
  instruction_text: yup
    .string()
    .required('Step instruction is required')
    .min(5, 'Step instruction must be at least 5 characters')
    .max(500, 'Step instruction must be less than 500 characters')
    .trim(),
  step_number: yup
    .number()
    .required('Step number is required')
    .min(1, 'Step number must be at least 1'),
});

// Main recipe form validation schema
export const recipeFormSchema = yup.object().shape({
  title: yup
    .string()
    .required('Recipe title is required')
    .min(3, 'Recipe title must be at least 3 characters')
    .max(100, 'Recipe title must be less than 100 characters')
    .trim(),
  
  description: yup
    .string()
    .required('Recipe description is required')
    .min(10, 'Recipe description must be at least 10 characters')
    .max(500, 'Recipe description must be less than 500 characters')
    .trim(),
  
  category: yup
    .string()
    .required('Recipe category is required')
    .oneOf(
      ['Italian', 'Indian', 'Dessert', 'Salad', 'Mexican', 'American', 'Asian', 'Mediterranean'],
      'Please select a valid category'
    ),
  
  photo_url: yup
    .string()
    .optional()
    .url('Please provide a valid image URL'),
  
  ingredients: yup
    .array()
    .of(ingredientSchema)
    .required('At least one ingredient is required')
    .min(1, 'At least one ingredient is required')
    .max(50, 'Too many ingredients (maximum 50)'),
  
  steps: yup
    .array()
    .of(stepSchema)
    .required('At least one cooking step is required')
    .min(1, 'At least one cooking step is required')
    .max(20, 'Too many steps (maximum 20)'),
});

// Image validation
export const imageValidationSchema = yup.object().shape({
  uri: yup
    .string()
    .required('Image is required'),
  size: yup
    .number()
    .optional()
    .max(5 * 1024 * 1024, 'Image must be smaller than 5MB'), // 5MB limit
  type: yup
    .string()
    .optional()
    .oneOf(['image/jpeg', 'image/png', 'image/jpg'], 'Only JPEG and PNG images are allowed'),
});

// Export types
export type RecipeFormData = yup.InferType<typeof recipeFormSchema>;
export type IngredientFormData = yup.InferType<typeof ingredientSchema>;
export type StepFormData = yup.InferType<typeof stepSchema>;
export type ImageValidationData = yup.InferType<typeof imageValidationSchema>;

// Available categories for the form
export const recipeCategories = [
  'Italian',
  'Indian', 
  'Dessert',
  'Salad',
  'Mexican',
  'American',
  'Asian',
  'Mediterranean',
] as const;

// Common units for ingredients
export const commonUnits = [
  'cups',
  'cup',
  'tbsp',
  'tsp',
  'oz',
  'lb',
  'g',
  'kg',
  'ml',
  'l',
  'pieces',
  'cloves',
  'inch',
  'large',
  'medium',
  'small',
  'handful',
  'pinch',
  'to taste',
] as const;