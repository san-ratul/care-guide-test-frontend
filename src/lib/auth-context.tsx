"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onForceSignOut } from "./api";
import { clearTokens, getRefreshToken, loadTokensFromStorage, setTokens } from "./auth-store";
import { fetchCurrentUser, loginRequest, logoutRequest } from "./services/auth.service";
import { queryClient } from "./query-client";
import type { User } from "../types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const router = useRouter();

  const signOutLocally = useCallback(() => {
    clearTokens();
    setUser(null);
    setStatus("unauthenticated");
    queryClient.clear();
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    const unsubscribe = onForceSignOut(signOutLocally);
    return unsubscribe;
  }, [signOutLocally]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const stored = loadTokensFromStorage();
      if (!stored) {
        setStatus("unauthenticated");
        return;
      }
      try {
        const me = await fetchCurrentUser();
        if (!cancelled) {
          setUser(me);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          signOutLocally();
        }
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await loginRequest(email, password);
      setTokens(session.accessToken, session.refreshToken);
      setUser(session.user);
      setStatus("authenticated");
      queryClient.clear();
    },
    []
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await logoutRequest(refreshToken);
    }
    signOutLocally();
  }, [signOutLocally]);

  const value = useMemo(
    () => ({ user, status, login, logout }),
    [user, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
