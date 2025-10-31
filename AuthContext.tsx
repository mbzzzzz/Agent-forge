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
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (session?.user) {
        const mapped: User = {
          uid: session.user.id,
          email: session.user.email ?? null,
          displayName: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null,
          photoURL: session.user.user_metadata?.avatar_url ?? session.user.user_metadata?.picture ?? null,
        };
        setUser(mapped);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
        return;
      }
      
      const session = data.session;
      console.log('Initial session:', session?.user?.email || 'No session');
      if (session?.user) {
        const mapped: User = {
          uid: session.user.id,
          email: session.user.email ?? null,
          displayName: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null,
          photoURL: session.user.user_metadata?.avatar_url ?? session.user.user_metadata?.picture ?? null,
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
        setLoading(false);
      } else if (data?.session?.user) {
        // Session is returned, update user state immediately
        const mapped: User = {
          uid: data.session.user.id,
          email: data.session.user.email ?? null,
          displayName: data.session.user.user_metadata?.full_name ?? data.session.user.user_metadata?.name ?? null,
          photoURL: data.session.user.user_metadata?.avatar_url ?? data.session.user.user_metadata?.picture ?? null,
        };
        setUser(mapped);
        setLoading(false);
      } else {
        // Wait a moment for session to be processed
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          const mapped: User = {
            uid: sessionData.session.user.id,
            email: sessionData.session.user.email ?? null,
            displayName: sessionData.session.user.user_metadata?.full_name ?? sessionData.session.user.user_metadata?.name ?? null,
            photoURL: sessionData.session.user.user_metadata?.avatar_url ?? sessionData.session.user.user_metadata?.picture ?? null,
          };
          setUser(mapped);
        }
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error', err);
      setLoading(false);
    }
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
        setLoading(false);
      } else if (data?.user && data?.session) {
        // Signup successful and session created (email confirmation might be disabled)
        const mapped: User = {
          uid: data.user.id,
          email: data.user.email ?? null,
          displayName: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null,
          photoURL: data.user.user_metadata?.avatar_url ?? data.user.user_metadata?.picture ?? null,
        };
        setUser(mapped);
        setLoading(false);
      } else if (data?.user && !data.session) {
        // User created but needs email confirmation
        setError('Check your email to confirm your account!');
        setLoading(false);
      } else {
        // Wait a moment and check for session
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          const mapped: User = {
            uid: sessionData.session.user.id,
            email: sessionData.session.user.email ?? null,
            displayName: sessionData.session.user.user_metadata?.full_name ?? sessionData.session.user.user_metadata?.name ?? null,
            photoURL: sessionData.session.user.user_metadata?.avatar_url ?? sessionData.session.user.user_metadata?.picture ?? null,
          };
          setUser(mapped);
        }
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Signup error', err);
      setLoading(false);
    }
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
