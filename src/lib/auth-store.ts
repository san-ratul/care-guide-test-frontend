const STORAGE_KEY = "care-guide.auth";

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;

function persist(): void {
  if (typeof window === "undefined") return;
  if (accessToken && refreshToken) {
    const payload: StoredAuth = { accessToken, refreshToken };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function loadTokensFromStorage(): { accessToken: string; refreshToken: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (parsed.accessToken && parsed.refreshToken) {
      accessToken = parsed.accessToken;
      refreshToken = parsed.refreshToken;
      return { accessToken, refreshToken };
    }
  } catch {
    // Corrupt storage is treated as logged out.
  }
  return null;
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  persist();
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  persist();
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}
