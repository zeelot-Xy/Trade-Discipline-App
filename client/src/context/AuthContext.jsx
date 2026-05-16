import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import authService from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [usage, setUsage] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const hydrateAuth = useCallback((authResponse) => {
    setUser(authResponse?.user || null);
    setUsage(authResponse?.usage || null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const response = await authService.getMe();
        if (isMounted) {
          hydrateAuth(response);
        }
      } catch {
        if (isMounted) {
          hydrateAuth(null);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      hydrateAuth(null);
      setAuthLoading(false);
    };

    window.addEventListener("perfect-trade:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("perfect-trade:unauthorized", handleUnauthorized);
    };
  }, []);

  const refreshAuth = useCallback(async () => {
    const response = await authService.getMe();
    hydrateAuth(response);
    return response;
  }, [hydrateAuth]);

  const value = useMemo(
    () => ({
      user,
      usage,
      authLoading,
      setUser,
      setUsage,
      hydrateAuth,
      refreshAuth,
    }),
    [user, usage, authLoading, hydrateAuth, refreshAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
};
