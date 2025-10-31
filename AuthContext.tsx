import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import { supabase } from './services/supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const mapped: User = {
          uid: session.user.id,
          email: session.user.email ?? null,
          displayName: session.user.user_metadata?.full_name ?? null,
          photoURL: session.user.user_metadata?.avatar_url ?? null,
        };
        setUser(mapped);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user) {
        const mapped: User = {
          uid: session.user.id,
          email: session.user.email ?? null,
          displayName: session.user.user_metadata?.full_name ?? null,
          photoURL: session.user.user_metadata?.avatar_url ?? null,
        };
        setUser(mapped);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        setError(error.message || 'Failed to sign in. Please check your credentials.');
        console.error('Login error', error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error', err);
    }
    setLoading(false);
  };

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      if (pass.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password: pass,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        setError(error.message || 'Failed to create account. Please try again.');
        console.error('Signup error', error);
      } else if (data?.user && !data.session) {
        setError('Check your email to confirm your account!');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Signup error', err);
    }
    setLoading(false);
  };
  
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        setError(error.message || 'Failed to sign in with Google. Please try again.');
        console.error('OAuth error', error);
        setLoading(false);
      }
      // Note: OAuth redirects to Google, so loading will be handled by auth state change
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('OAuth error', err);
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error', error);
    }
    setLoading(false);
  };

  const clearError = () => setError(null);

  const value = { user, loading, error, login, signup, loginWithGoogle, logout, clearError };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
