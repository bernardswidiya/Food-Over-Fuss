const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

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

export async function loginUser(payload: LoginPayload): Promise<AuthToken> {
  const res = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthToken>(res);
}

export async function registerUser(payload: RegisterPayload): Promise<{ id: number; name: string; email: string }> {
  const res = await fetch(`${API_BASE_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** Redirects the browser to the backend's Google OAuth endpoint. */
export function loginWithGoogle(): void {
  window.location.href = `${API_BASE_URL}/auth/google`;
}
