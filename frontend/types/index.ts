export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  goal: string;
  budget: number;
  selectedDiets: string[];
  notifReminders: boolean;
  emailList: boolean;
}

export interface GroceryItem {
  id: number;
  name: string;
  qty: string;
  category: "produce" | "dairy" | "meat" | "pantry" | "other";
  checked: boolean;
}

export interface MealPlan {
  id: string;
  day: string;
  dateStr: string;
  dateNum: number;
  isToday: boolean;
  meals: {
    breakfast?: RecipeSummary;
    lunch?: RecipeSummary;
    dinner?: RecipeSummary;
  };
}

export interface RecipeSummary {
  id: string;
  title: string;
  prepTime: string;
  calories: string;
  image?: string;
  tags?: string[];
}
