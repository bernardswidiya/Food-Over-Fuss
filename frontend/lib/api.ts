import { supabase } from "@/lib/supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// ── Shared ────────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ detail: "An unexpected error occurred." }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json() as Promise<T>;
}

// Sends cookie (email/password users) AND Bearer token (Google OAuth users) if available.
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      ...options.headers,
    },
  });
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  profile_picture: string | null;
}

export interface LoginResponse {
  message: string;
  has_preferences: boolean;
  role: string;
  user: UserResponse;
}

// Email/password login — backend sets HttpOnly cookie
export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<LoginResponse>(res);
}

// Email/password register — backend creates user
export async function registerUser(payload: RegisterPayload): Promise<UserResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<UserResponse>(res);
}

// Logout — clears backend cookie AND Supabase session (if Google user)
export async function logoutUser(): Promise<void> {
  await Promise.allSettled([
    fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" }),
    supabase.auth.signOut(),
  ]);
}

export async function getMe(): Promise<UserResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/auth/me`);
  return handleResponse<UserResponse>(res);
}

// Google OAuth — goes through Supabase (HTTPS), not backend
export function loginWithGoogle(): void {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "http://localhost:3000/auth/callback";

  supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
}

// ── Users / Avatar ────────────────────────────────────────────────────────────

export async function uploadAvatar(file: File): Promise<UserResponse> {
  const headers = await getAuthHeader();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/api/users/avatar`, {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
  });
  return handleResponse<UserResponse>(res);
}

export async function deleteAvatar(): Promise<UserResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/users/avatar`, { method: "DELETE" });
  return handleResponse<UserResponse>(res);
}

export async function deleteAccount(): Promise<void> {
  await authFetch(`${API_BASE_URL}/api/users/me`, { method: "DELETE" });
}

// ── Preferences ───────────────────────────────────────────────────────────────

export interface PreferencesPayload {
  diet_goal: string;
  daily_budget: number;
  allergies?: string;
}

export interface PreferencesResponse {
  id: number;
  user_id: number;
  diet_goal: string;
  daily_budget: number;
  allergies: string | null;
}

export async function savePreferences(payload: PreferencesPayload): Promise<PreferencesResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/preferences`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return handleResponse<PreferencesResponse>(res);
}

export async function getPreferences(): Promise<PreferencesResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/preferences`);
  return handleResponse<PreferencesResponse>(res);
}

// ── Meals ─────────────────────────────────────────────────────────────────────

export interface DailyMenuResponse {
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
  image_url: string | null;
}

export interface MealPlanResponse {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  daily_menus: DailyMenuResponse[];
}

export async function getMealHistory(): Promise<MealPlanResponse[]> {
  const res = await authFetch(`${API_BASE_URL}/api/meals/history`);
  return handleResponse<MealPlanResponse[]>(res);
}

export async function getMeals(startDate: string, endDate: string): Promise<DailyMenuResponse[]> {
  const res = await authFetch(`${API_BASE_URL}/api/meals?start_date=${startDate}&end_date=${endDate}`);
  return handleResponse<DailyMenuResponse[]>(res);
}

export async function generateWeekMeals(startDate: string, endDate: string): Promise<MealPlanResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/meals/generate-week`, {
    method: "POST",
    body: JSON.stringify({ start_date: startDate, end_date: endDate }),
  });
  return handleResponse<MealPlanResponse>(res);
}

export async function regenerateMeal(menuId: number): Promise<DailyMenuResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/meals/${menuId}/regenerate`, { method: "PUT" });
  return handleResponse<DailyMenuResponse>(res);
}

export async function clearMeal(menuId: number): Promise<void> {
  await authFetch(`${API_BASE_URL}/api/meals/${menuId}`, { method: "DELETE" });
}

// ── Groceries ─────────────────────────────────────────────────────────────────

export interface AggregatedGroceryItem {
  name: string;
  qty: string;
  source_meals: string[];
}

export async function getGroceries(startDate: string, endDate: string, sortBy = "quantity_desc"): Promise<AggregatedGroceryItem[]> {
  const res = await authFetch(`${API_BASE_URL}/api/groceries?start_date=${startDate}&end_date=${endDate}&sort_by=${sortBy}`);
  return handleResponse<AggregatedGroceryItem[]>(res);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function uploadRecipeImage(file: File): Promise<{ image_url: string }> {
  const headers = await getAuthHeader();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/api/admin/recipes/upload-image`, {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
  });
  return handleResponse<{ image_url: string }>(res);
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  image_url?: string;
}

export interface ChatResponse {
  message: string;
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<ChatResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/chat/`, {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
  return handleResponse<ChatResponse>(res);
}

// ── Password Reset (email/password users — via backend SMTP) ──────────────────

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function resetPassword(token: string, new_password: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password }),
  });
  return handleResponse<{ message: string }>(res);
}

// ── Recipe Detail (via DailyMenu ID) ─────────────────────────────────────────

export interface MealDetail {
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
  image_url: string | null;
  prep_time: number | null;
  instructions: string[];
  allergens: string[];
  estimated_cost: number;
}

export interface RecipeCard {
  id: number;
  name: string;
  meal_type: string;
  prep_time: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string | null;
  allergens: string[];
  estimated_cost: number;
  instructions?: string[];
}

export async function getMealDetail(menuId: number): Promise<MealDetail> {
  const res = await authFetch(`${API_BASE_URL}/api/meals/${menuId}/detail`);
  return handleResponse<MealDetail>(res);
}

export async function getMealAlternatives(menuId: number): Promise<RecipeCard[]> {
  const res = await authFetch(`${API_BASE_URL}/api/meals/${menuId}/alternatives`);
  return handleResponse<RecipeCard[]>(res);
}

export async function getMealSubstitute(menuId: number): Promise<RecipeCard> {
  const res = await authFetch(`${API_BASE_URL}/api/meals/${menuId}/substitute`);
  return handleResponse<RecipeCard>(res);
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const res = await authFetch(`${API_BASE_URL}/api/notifications`);
  return handleResponse<NotificationItem[]>(res);
}

export async function markNotificationRead(id: number): Promise<NotificationItem> {
  const res = await authFetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: "PATCH" });
  return handleResponse<NotificationItem>(res);
}

export async function markAllNotificationsRead(): Promise<void> {
  await authFetch(`${API_BASE_URL}/api/notifications/read-all`, { method: "POST" });
}
