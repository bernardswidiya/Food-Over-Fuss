export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_picture: string | null;
}

export interface PreferenceProfile {
  id: number;
  user_id: number;
  diet_goal: string;
  daily_budget: number;
  allergies: string | null;
}

export interface DailyMenu {
  id: number;
  meal_plan_id: number;
  date: string;
  meal_type: string;
  recipe_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string | null;
  recipe_id: number | null;
  is_cleared: boolean;
}

export interface MealPlan {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  daily_menus: DailyMenu[];
}

export interface GroceryItem {
  name: string;
  qty: string;
  source_meals: string[];
}

export interface RecipeSummary {
  id: number;
  name: string;
  meal_type: string;
  prep_time: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  is_published: boolean;
  image_url: string | null;
}
