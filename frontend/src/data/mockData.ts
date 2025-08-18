import { User } from '@/src/types/auth';

// Mock user for anonymous mode
export const mockAnonymousUser: User = {
  id: 'anonymous-user-001',
  full_name: 'Demo User',
  email: 'demo@example.com',
};

// Recipe types based on API contract in requirements.md
export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  photo_url: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  is_favorite: boolean;
  created_at: string;
  createdByUserId: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface RecipeStep {
  id: string;
  step_number: number;
  instruction_text: string;
}

// Sample recipe data
export const mockRecipes: Recipe[] = [
  {
    id: 'recipe-001',
    title: 'Classic Spaghetti Carbonara',
    description: 'A traditional Italian pasta dish with eggs, cheese, and pancetta',
    category: 'Italian',
    photo_url: 'https://therecipecritic.com/wp-content/uploads/2018/04/pasta-carbonara-15.jpg',
    ingredients: [
      { id: 'ing-001', name: 'Spaghetti', quantity: '400', unit: 'g' },
      { id: 'ing-002', name: 'Pancetta', quantity: '150', unit: 'g' },
      { id: 'ing-003', name: 'Eggs', quantity: '3', unit: 'large' },
      { id: 'ing-004', name: 'Parmesan cheese', quantity: '100', unit: 'g' },
      { id: 'ing-005', name: 'Black pepper', quantity: '1', unit: 'tsp' },
    ],
    steps: [
      { id: 'step-001', step_number: 1, instruction_text: 'Cook spaghetti in salted boiling water until al dente' },
      { id: 'step-002', step_number: 2, instruction_text: 'Cook pancetta in a large pan until crispy' },
      { id: 'step-003', step_number: 3, instruction_text: 'Whisk eggs with grated Parmesan and black pepper' },
      { id: 'step-004', step_number: 4, instruction_text: 'Drain pasta and add to pancetta pan' },
      { id: 'step-005', step_number: 5, instruction_text: 'Remove from heat and quickly stir in egg mixture' },
    ],
    is_favorite: false,
    created_at: new Date('2024-01-15').toISOString(),
    createdByUserId: mockAnonymousUser.id,
  },
  {
    id: 'recipe-002',
    title: 'Chicken Tikka Masala',
    description: 'Creamy and flavorful Indian curry with tender chicken pieces',
    category: 'Indian',
    photo_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    ingredients: [
      { id: 'ing-006', name: 'Chicken breast', quantity: '500', unit: 'g' },
      { id: 'ing-007', name: 'Yogurt', quantity: '200', unit: 'ml' },
      { id: 'ing-008', name: 'Tomato sauce', quantity: '400', unit: 'ml' },
      { id: 'ing-009', name: 'Heavy cream', quantity: '100', unit: 'ml' },
      { id: 'ing-010', name: 'Garam masala', quantity: '2', unit: 'tbsp' },
      { id: 'ing-011', name: 'Garlic', quantity: '4', unit: 'cloves' },
      { id: 'ing-012', name: 'Ginger', quantity: '1', unit: 'inch' },
    ],
    steps: [
      { id: 'step-006', step_number: 1, instruction_text: 'Marinate chicken in yogurt and spices for 30 minutes' },
      { id: 'step-007', step_number: 2, instruction_text: 'Cook marinated chicken until browned' },
      { id: 'step-008', step_number: 3, instruction_text: 'Sauté garlic and ginger until fragrant' },
      { id: 'step-009', step_number: 4, instruction_text: 'Add tomato sauce and garam masala, simmer' },
      { id: 'step-010', step_number: 5, instruction_text: 'Add chicken back to sauce and stir in cream' },
    ],
    is_favorite: true,
    created_at: new Date('2024-01-20').toISOString(),
    createdByUserId: mockAnonymousUser.id,
  },
  {
    id: 'recipe-003',
    title: 'Chocolate Chip Cookies',
    description: 'Classic homemade cookies with chocolate chips',
    category: 'Dessert',
    photo_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
    ingredients: [
      { id: 'ing-013', name: 'All-purpose flour', quantity: '2', unit: 'cups' },
      { id: 'ing-014', name: 'Butter', quantity: '1', unit: 'cup' },
      { id: 'ing-015', name: 'Brown sugar', quantity: '3/4', unit: 'cup' },
      { id: 'ing-016', name: 'White sugar', quantity: '1/4', unit: 'cup' },
      { id: 'ing-017', name: 'Eggs', quantity: '2', unit: 'large' },
      { id: 'ing-018', name: 'Chocolate chips', quantity: '2', unit: 'cups' },
      { id: 'ing-019', name: 'Vanilla extract', quantity: '1', unit: 'tsp' },
    ],
    steps: [
      { id: 'step-011', step_number: 1, instruction_text: 'Preheat oven to 375°F (190°C)' },
      { id: 'step-012', step_number: 2, instruction_text: 'Cream butter and sugars until fluffy' },
      { id: 'step-013', step_number: 3, instruction_text: 'Beat in eggs and vanilla extract' },
      { id: 'step-014', step_number: 4, instruction_text: 'Gradually mix in flour until combined' },
      { id: 'step-015', step_number: 5, instruction_text: 'Fold in chocolate chips' },
      { id: 'step-016', step_number: 6, instruction_text: 'Drop spoonfuls on baking sheet and bake 9-11 minutes' },
    ],
    is_favorite: false,
    created_at: new Date('2024-01-25').toISOString(),
    createdByUserId: mockAnonymousUser.id,
  },
  {
    id: 'recipe-004',
    title: 'Caesar Salad',
    description: 'Fresh romaine lettuce with classic Caesar dressing',
    category: 'Salad',
    photo_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    ingredients: [
      { id: 'ing-020', name: 'Romaine lettuce', quantity: '2', unit: 'heads' },
      { id: 'ing-021', name: 'Parmesan cheese', quantity: '1/2', unit: 'cup' },
      { id: 'ing-022', name: 'Croutons', quantity: '1', unit: 'cup' },
      { id: 'ing-023', name: 'Mayonnaise', quantity: '1/2', unit: 'cup' },
      { id: 'ing-024', name: 'Lemon juice', quantity: '2', unit: 'tbsp' },
      { id: 'ing-025', name: 'Garlic', quantity: '2', unit: 'cloves' },
    ],
    steps: [
      { id: 'step-017', step_number: 1, instruction_text: 'Wash and chop romaine lettuce' },
      { id: 'step-018', step_number: 2, instruction_text: 'Make dressing with mayo, lemon, and minced garlic' },
      { id: 'step-019', step_number: 3, instruction_text: 'Toss lettuce with dressing' },
      { id: 'step-020', step_number: 4, instruction_text: 'Top with croutons and grated Parmesan' },
    ],
    is_favorite: true,
    created_at: new Date('2024-02-01').toISOString(),
    createdByUserId: mockAnonymousUser.id,
  },
  {
    id: 'recipe-005',
    title: 'Beef Tacos',
    description: 'Spicy ground beef tacos with fresh toppings',
    category: 'Mexican',
    photo_url: 'https://bing.com/th?id=OSK.142b082b5c3ce860574bd1f2bbf98695',
    ingredients: [
      { id: 'ing-026', name: 'Ground beef', quantity: '500', unit: 'g' },
      { id: 'ing-027', name: 'Taco shells', quantity: '8', unit: 'pieces' },
      { id: 'ing-028', name: 'Lettuce', quantity: '1', unit: 'head' },
      { id: 'ing-029', name: 'Tomatoes', quantity: '2', unit: 'medium' },
      { id: 'ing-030', name: 'Cheddar cheese', quantity: '200', unit: 'g' },
      { id: 'ing-031', name: 'Taco seasoning', quantity: '1', unit: 'packet' },
    ],
    steps: [
      { id: 'step-021', step_number: 1, instruction_text: 'Brown ground beef in a large skillet' },
      { id: 'step-022', step_number: 2, instruction_text: 'Add taco seasoning and water, simmer' },
      { id: 'step-023', step_number: 3, instruction_text: 'Warm taco shells in oven' },
      { id: 'step-024', step_number: 4, instruction_text: 'Prepare toppings: shred lettuce, dice tomatoes, grate cheese' },
      { id: 'step-025', step_number: 5, instruction_text: 'Assemble tacos with beef and desired toppings' },
    ],
    is_favorite: false,
    created_at: new Date('2024-02-05').toISOString(),
    createdByUserId: mockAnonymousUser.id,
  },
];

// Available categories
export const mockCategories = [
  'Italian',
  'Indian',
  'Dessert',
  'Salad',
  'Mexican',
  'American',
  'Asian',
  'Mediterranean',
];

// Helper function to get recipes by category
export const getRecipesByCategory = (category?: string): Recipe[] => {
  if (!category) return mockRecipes;
  return mockRecipes.filter(recipe => recipe.category.toLowerCase() === category.toLowerCase());
};

// Helper function to search recipes
export const searchRecipes = (query: string): Recipe[] => {
  if (!query.trim()) return mockRecipes;
  
  const lowerQuery = query.toLowerCase();
  return mockRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(lowerQuery) ||
    recipe.description.toLowerCase().includes(lowerQuery) ||
    recipe.category.toLowerCase().includes(lowerQuery) ||
    recipe.ingredients.some(ing => ing.name.toLowerCase().includes(lowerQuery))
  );
};

// Helper function to get favorite recipes
export const getFavoriteRecipes = (): Recipe[] => {
  return mockRecipes.filter(recipe => recipe.is_favorite);
};