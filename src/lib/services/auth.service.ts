import { api } from "../api";
import type { User } from "../../types";

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<{ data: AuthResponse }>("/auth/login", { email, password });
  return response.data.data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  try {
    await api.post("/auth/logout", { refreshToken });
  } catch {
    // The server-side revocation is best-effort; local cleanup always proceeds.
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get<{ data: { user: User } }>("/auth/me");
  return response.data.data.user;
}
