const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// ── Shared ──

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

function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

// ── Auth ──

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

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse<LoginResponse>(res);
}

export async function registerUser(payload: RegisterPayload): Promise<UserResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse<UserResponse>(res);
}

export async function logoutUser(): Promise<void> {
  await authFetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST" });
}

export async function getMe(): Promise<UserResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/auth/me`);
  return handleResponse<UserResponse>(res);
}

export function loginWithGoogle(): void {
  window.location.href = `${API_BASE_URL}/api/auth/google`;
}

// ── Users / Avatar ──

export async function uploadAvatar(file: File): Promise<UserResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/users/avatar`, {
    method: "POST",
    credentials: "include",
    body: formData,
    // Note: Do not set Content-Type header for FormData, browser will set it with boundary
  });
  return handleResponse<UserResponse>(res);
}

export async function deleteAvatar(): Promise<UserResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/users/avatar`, {
    method: "DELETE",
  });
  return handleResponse<UserResponse>(res);
}

export async function deleteAccount(): Promise<void> {
  await authFetch(`${API_BASE_URL}/api/users/me`, { method: "DELETE" });
}

// ── Preferences (Onboarding / Settings) ──

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

// ── Meals ──

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

// ── Groceries ──

export interface AggregatedGroceryItem {
  name: string;
  qty: string;
  source_meals: string[];
}

export async function getGroceries(startDate: string, endDate: string, sortBy: string = "quantity_desc"): Promise<AggregatedGroceryItem[]> {
  const res = await authFetch(`${API_BASE_URL}/api/groceries?start_date=${startDate}&end_date=${endDate}&sort_by=${sortBy}`);
  return handleResponse<AggregatedGroceryItem[]>(res);
}

// ── Admin ──

export async function uploadRecipeImage(file: File): Promise<{ image_url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/api/admin/recipes/upload-image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return handleResponse<{ image_url: string }>(res);
}

// ── Chat ──

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

// ── Password Reset ──

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await authFetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function resetPassword(token: string, new_password: string): Promise<{ message: string }> {
  const res = await authFetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify({ token, new_password }),
  });
  return handleResponse<{ message: string }>(res);
}

// ── Notifications ──

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
