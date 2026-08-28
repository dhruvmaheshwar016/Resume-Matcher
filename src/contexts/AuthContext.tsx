
import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = 'http://localhost:8000';
const TOKEN_KEY = 'auth_token';

// ── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  session: { token: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildAuthUser(user: { id: string; email: string; full_name: string }): AuthUser {
  return {
    id: user.id,
    email: user.email,
    user_metadata: { full_name: user.full_name },
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage by verifying token with backend
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(buildAuthUser(data));
          setSession({ token });
        } else {
          // Token invalid or expired — clear it
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        // Backend unreachable — clear stored token to avoid stale state
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── signIn ──────────────────────────────────────────────────────────────────

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: { message: data.detail || 'Sign in failed' } };
      }

      // data: { access_token, token_type, user: { id, email, full_name } }
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setUser(buildAuthUser(data.user));
      setSession({ token: data.access_token });
      return { error: null };
    } catch {
      return { error: { message: 'Could not connect to server. Is the backend running?' } };
    }
  };

  // ── signUp ──────────────────────────────────────────────────────────────────

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName ?? '' }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: { message: data.detail || 'Sign up failed' } };
      }

      // data: { access_token, token_type, user: { id, email, full_name } }
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setUser(buildAuthUser(data.user));
      setSession({ token: data.access_token });
      return { error: null };
    } catch {
      return { error: { message: 'Could not connect to server. Is the backend running?' } };
    }
  };

  // ── signOut ─────────────────────────────────────────────────────────────────

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setSession(null);
  };

  const value = { user, session, loading, signIn, signUp, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
