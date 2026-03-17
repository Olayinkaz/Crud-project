/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "../utils/api.js";

const AuthContext = createContext(null);
const storageKey = "fullstack-eval-auth-token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey));
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(token));
  const [authError, setAuthError] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem(storageKey);
    setToken(null);
    setUser(null);
    setAuthError("");
  }, []);

  const persistSession = useCallback((data) => {
    localStorage.setItem(storageKey, data.token);
    setToken(data.token);
    setUser(data.user);
    setAuthError("");
  }, []);

  const register = useCallback(
    async (formData) => {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: formData,
      });
      persistSession(data);
      return data;
    },
    [persistSession]
  );

  const login = useCallback(
    async (formData) => {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: formData,
      });
      persistSession(data);
      return data;
    },
    [persistSession]
  );

  useEffect(() => {
    if (!token) {
      setAuthLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadUser() {
      setAuthLoading(true);

      try {
        const data = await apiRequest("/auth/me", { token });
        if (!cancelled) {
          setUser(data.user);
          setAuthError("");
        }
      } catch (error) {
        if (!cancelled) {
          logout();
          setAuthError(error.message);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [logout, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      authError,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [token, user, authLoading, authError, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
