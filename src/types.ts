export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'very_active'
  | 'extra_active';

export type FitnessGoal =
  | 'weight_loss'
  | 'weight_gain'
  | 'maintain_weight'
  | 'muscle_gain';

export type DietaryPreference = 'vegetarian' | 'non_vegetarian' | 'vegan';

export type MealType =
  | 'breakfast'
  | 'mid_morning_snack'
  | 'lunch'
  | 'evening_snack'
  | 'dinner';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  age: number;
  gender: Gender;
  height: number; // in cm
  weight: number; // in kg
  activity_level: ActivityLevel;
  fitness_goal: FitnessGoal;
  dietary_preference: DietaryPreference;
  allergies: string[];
  food_preferences: string;
  target_calories?: number;
  target_protein?: number;
  target_water?: number; // in Liters
  created_at: string;
  updated_at: string;
}

export type AppTheme = 'emerald' | 'midnight' | 'sapphire' | 'sunset' | 'berry';

export interface FoodItem {
  id: string;
  name: string;
  category: 'Grains' | 'Dairy' | 'Protein' | 'Vegetables' | 'Fruits' | 'Legumes' | 'Snacks' | 'Beverages' | 'Nuts & Seeds';
  serving_size: string; // e.g. "1 medium (40g)", "1 bowl (150g)"
  serving_weight_g: number;
  calories: number; // per serving
  protein: number; // in grams
  carbohydrates: number; // in grams
  fat: number; // in grams
  fiber?: number; // in grams
  vegetarian: boolean;
  vegan: boolean;
  is_indian: boolean;
  image_url?: string;
  created_at?: string;
}

export interface MealPlanItem {
  id: string;
  user_id: string;
  meal_date: string; // YYYY-MM-DD
  meal_type: MealType;
  food_id: string;
  serving_quantity: number;
  created_at: string;
  food?: FoodItem;
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_id: string;
  meal_type: MealType;
  quantity: number; // multiple of serving
  consumed_at: string; // ISO date-time
  food?: FoodItem;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount: number; // in Liters, e.g. 0.25 (250ml)
  logged_at: string; // ISO date-time
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight: number; // in kg
  note?: string;
  logged_at: string; // ISO date-time or YYYY-MM-DD
}

export interface GroceryItem {
  id: string;
  user_id: string;
  item_name: string;
  category: 'Vegetables' | 'Fruits' | 'Dairy' | 'Grains' | 'Protein' | 'Nuts & Seeds' | 'Other';
  quantity: string;
  completed: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  isGuest: boolean;
}

export interface AdminCredentials {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface NutritionTargets {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number; // g
  targetCarbs: number; // g
  targetFat: number; // g
  targetWater: number; // L
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  healthyBmiRange: string;
}
