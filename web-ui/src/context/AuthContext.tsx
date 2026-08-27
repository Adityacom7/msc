import { createContext, ReactNode, useContext, useState } from 'react';
import { getStoredToken, setStoredToken, clearStoredToken } from '../lib/authToken';

interface AuthContextValue {
  token: string | null;
  error: string | null;
  setError: (message: string | null) => void;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [error, setError] = useState<string | null>(null);

  function login(nextToken: string) {
    setStoredToken(nextToken);
    setToken(nextToken);
    setError(null);
  }

  function logout() {
    clearStoredToken();
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, error, setError, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
