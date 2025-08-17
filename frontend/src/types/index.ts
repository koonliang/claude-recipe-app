export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  favoriteRecipes: string[];
}