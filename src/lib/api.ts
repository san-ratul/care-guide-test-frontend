import axios, { AxiosError, AxiosHeaders } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth-store";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ApiErrorBody {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Array<{ path: string; message: string }>;
  };
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error?.message) {
      const details = body.error.details;
      if (details && details.length > 0) {
        return `${body.error.message}: ${details.map((d) => d.message).join(", ")}`;
      }
      return body.error.message;
    }
    if (error.code === "ERR_NETWORK") {
      return "Cannot reach the server. Make sure the backend is running on port 4000.";
    }
  }
  return fallback;
}

export function getApiErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as ApiErrorBody | undefined)?.error?.code;
  }
  return undefined;
}

type ForceSignOut = () => void;
let forceSignOutHandler: ForceSignOut | null = null;

export function onForceSignOut(handler: ForceSignOut): () => void {
  forceSignOutHandler = handler;
  return () => {
    if (forceSignOutHandler === handler) forceSignOutHandler = null;
  };
}

function triggerForceSignOut(): void {
  clearTokens();
  if (forceSignOutHandler) forceSignOutHandler();
}

async function rotateSession(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  // Raw axios instance: bypasses this file's interceptors to avoid loops.
  const response = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken }
  );
  const { accessToken, refreshToken: nextRefresh } = response.data.data;
  setTokens(accessToken, nextRefresh);
  return accessToken;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshInFlight: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    const code = (error.response?.data as ApiErrorBody | undefined)?.error?.code;

    if (
      error.response?.status === 401 &&
      code === "TOKEN_EXPIRED" &&
      original &&
      !original._retried
    ) {
      original._retried = true;
      try {
        refreshInFlight ??= rotateSession().finally(() => {
          refreshInFlight = null;
        });
        const token = await refreshInFlight;
        (original.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
        return api(original);
      } catch {
        triggerForceSignOut();
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && code === "TOKEN_INVALID") {
      triggerForceSignOut();
    }

    return Promise.reject(error);
  }
);
