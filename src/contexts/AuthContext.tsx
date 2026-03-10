
import React, { createContext, useContext, useEffect, useState } from 'react';

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

const TOKEN_KEY = 'auth_token';
const USERS_KEY = 'auth_users';

function createToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  const signature = btoa(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

function decodeToken(token: string): (AuthUser & { exp: number }) | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({ id: decoded.id, email: decoded.email, user_metadata: decoded.user_metadata });
        setSession({ token });
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const users = getStoredUsers();
      const passwordHash = await hashPassword(password);
      const found = users.find(u => u.email === email && u.passwordHash === passwordHash);

      if (!found) {
        return { error: { message: 'Invalid email or password' } };
      }

      const authUser: AuthUser = {
        id: found.id,
        email: found.email,
        user_metadata: { full_name: found.fullName },
      };

      const token = createToken(authUser);
      localStorage.setItem(TOKEN_KEY, token);
      setUser(authUser);
      setSession({ token });
      return { error: null };
    } catch {
      return { error: { message: 'Sign in failed' } };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const users = getStoredUsers();

      if (users.find(u => u.email === email)) {
        return { error: { message: 'An account with this email already exists' } };
      }

      const passwordHash = await hashPassword(password);
      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        email,
        passwordHash,
        fullName: fullName || '',
      };
      users.push(newUser);
      saveStoredUsers(users);

      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        user_metadata: { full_name: newUser.fullName },
      };
      const token = createToken(authUser);
      localStorage.setItem(TOKEN_KEY, token);
      setUser(authUser);
      setSession({ token });
      return { error: null };
    } catch {
      return { error: { message: 'Sign up failed' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setSession(null);
  };

  const value = { user, session, loading, signIn, signUp, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
