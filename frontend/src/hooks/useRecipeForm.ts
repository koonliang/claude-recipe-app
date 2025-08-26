import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { apiService } from '@/src/services/apiService';
import { Recipe } from '@/src/types';
import { RecipeFormData, recipeFormSchema } from '@/src/validation/recipeFormSchema';
import { RecipeFormMode } from '@/src/types/recipeForm';

export interface UseRecipeFormParams {
  mode: RecipeFormMode;
  recipeId?: string;
  onSuccess?: (recipe: Recipe, successMessage?: string) => void;
  onError?: (error: string) => void;
}

export interface UseRecipeFormState {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  initialData?: Recipe;
  hasUnsavedChanges: boolean;
}

export interface UseRecipeFormReturn extends UseRecipeFormState {
  form: UseFormReturn<RecipeFormData>;
  imageUri: string | undefined;
  setImageUri: (uri: string | undefined) => void;
  submitForm: () => Promise<void>;
  resetForm: () => void;
  checkUnsavedChanges: () => boolean;
}

export function useRecipeForm({
  mode,
  recipeId,
  onSuccess,
  onError,
}: UseRecipeFormParams): UseRecipeFormReturn {
  const [state, setState] = useState<UseRecipeFormState>({
    isLoading: mode === 'edit' && !!recipeId,
    isSubmitting: false,
    error: null,
    initialData: undefined,
    hasUnsavedChanges: false,
  });

  const [imageUri, setImageUri] = useState<string | undefined>();

  const form = useForm<RecipeFormData>({
    resolver: yupResolver(recipeFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      category: '',
      photo_url: '',
      ingredients: [{ name: '', quantity: '', unit: '' }],
      steps: [{ step_number: 1, instruction_text: '' }],
    },
  });

  const { watch, reset, handleSubmit, formState } = form;

  // Watch form changes to detect unsaved changes
  watch();

  useEffect(() => {
    const subscription = watch(() => {
      setState(prev => ({ ...prev, hasUnsavedChanges: formState.isDirty }));
    });
    return () => subscription.unsubscribe();
  }, [watch, formState.isDirty]);

  // Load recipe data for edit mode
  const loadRecipeData = useCallback(async () => {
    if (mode !== 'edit' || !recipeId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const recipe = await apiService.getRecipe(recipeId);
      
      // Transform recipe data to form format
      const formData: RecipeFormData = {
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        photo_url: recipe.photo_url,
        ingredients: recipe.ingredients.map(ing => ({
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
        steps: recipe.steps.map(step => ({
          id: step.id,
          step_number: step.step_number,
          instruction_text: step.instruction_text,
        })),
      };

      reset(formData);
      setImageUri(recipe.photo_url);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        initialData: recipe,
        hasUnsavedChanges: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load recipe';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [mode, recipeId, reset, onError]);

  // Submit form
  const submitForm = useCallback(async () => {
    console.log('submitForm called - triggering validation...');
    const isValid = await form.trigger();
    console.log('submitForm validation result:', isValid);
    console.log('submitForm errors:', form.formState.errors);
    console.log('submitForm form data:', form.getValues());
    
    if (!isValid) {
      console.log('submitForm - validation failed, returning early');
      return;
    }

    await handleSubmit(async (data) => {
      try {
        setState(prev => ({ ...prev, isSubmitting: true, error: null }));

        // Prepare form data for API
        const formDataToSubmit = {
          ...data,
          photo_url: imageUri || data.photo_url,
          ingredients: data.ingredients.map((ing, index) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            id: (ing as any).id || `temp-ing-${index}`,
          })),
          steps: data.steps.map((step, index) => ({
            instruction_text: step.instruction_text,
            step_number: index + 1,
            id: (step as any).id || `temp-step-${index}`,
          })),
        };

        let result: Recipe;
        let successMessage: string | undefined;

        if (mode === 'create') {
          result = await apiService.createRecipe(formDataToSubmit);
        } else {
          if (!recipeId) throw new Error('Recipe ID is required for edit mode');
          const updateResponse = await apiService.updateRecipe(recipeId, formDataToSubmit);
          result = updateResponse.recipe;
          successMessage = updateResponse.message;
        }

        setState(prev => ({
          ...prev,
          isSubmitting: false,
          hasUnsavedChanges: false,
        }));

        console.log('Recipe saved successfully, calling onSuccess callback:', result);
        
        // Show success message if we have one
        if (successMessage) {
          // For now, we'll pass the message in the onSuccess callback
          // The parent component can decide how to display it
          onSuccess?.(result, successMessage);
        } else {
          onSuccess?.(result);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save recipe';
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          error: errorMessage,
        }));
        onError?.(errorMessage);
      }
    })();
  }, [handleSubmit, imageUri, mode, recipeId, onSuccess, onError, form]);

  // Reset form
  const resetForm = useCallback(() => {
    if (mode === 'edit' && state.initialData) {
      const formData: RecipeFormData = {
        title: state.initialData.title,
        description: state.initialData.description,
        category: state.initialData.category,
        photo_url: state.initialData.photo_url,
        ingredients: state.initialData.ingredients.map(ing => ({
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
        steps: state.initialData.steps.map(step => ({
          id: step.id,
          step_number: step.step_number,
          instruction_text: step.instruction_text,
        })),
      };
      reset(formData);
      setImageUri(state.initialData.photo_url);
    } else {
      reset({
        title: '',
        description: '',
        category: '',
        photo_url: '',
        ingredients: [{ name: '', quantity: '', unit: '' }],
        steps: [{ step_number: 1, instruction_text: '' }],
      });
      setImageUri(undefined);
    }
    setState(prev => ({ ...prev, hasUnsavedChanges: false }));
  }, [mode, state.initialData, reset]);

  // Check for unsaved changes
  const checkUnsavedChanges = useCallback(() => {
    return state.hasUnsavedChanges;
  }, [state.hasUnsavedChanges]);

  // Load recipe data on mount for edit mode
  useEffect(() => {
    if (mode === 'edit' && recipeId) {
      loadRecipeData();
    }
  }, [loadRecipeData, mode, recipeId]);

  // Update image in form when imageUri changes
  useEffect(() => {
    if (imageUri !== undefined) {
      form.setValue('photo_url', imageUri, { shouldDirty: true });
    }
  }, [imageUri, form]);

  return {
    ...state,
    form,
    imageUri,
    setImageUri,
    submitForm,
    resetForm,
    checkUnsavedChanges,
  };
}