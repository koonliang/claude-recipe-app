import { Recipe } from './index';

// Form data types for recipe creation/editing
export interface RecipeFormData {
  title: string;
  description: string;
  category: string;
  photo_url?: string;
  ingredients: IngredientFormData[];
  steps: StepFormData[];
}

export interface IngredientFormData {
  id?: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface StepFormData {
  id?: string;
  step_number: number;
  instruction_text: string;
}

// Image picker types
export interface ImagePickerResult {
  uri: string;
  type?: string;
  name?: string;
  size?: number;
}

// Form mode
export type RecipeFormMode = 'create' | 'edit';

// Form section props
export interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  error?: string;
}

// Dynamic field list props
export interface DynamicFieldListProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove?: (fromIndex: number, toIndex: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  addButtonText: string;
  emptyText: string;
}

// Form state
export interface RecipeFormState {
  mode: RecipeFormMode;
  initialData?: Recipe;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
}

// Navigation params
export interface RecipeFormNavigationParams {
  mode: RecipeFormMode;
  recipeId?: string;
}