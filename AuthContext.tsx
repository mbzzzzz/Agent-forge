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
    let isMounted = true;
    
    // Helper function to map session to user
    const mapSessionToUser = (session: any): User | null => {
      if (!session?.user) return null;
      return {
        uid: session.user.id,
        email: session.user.email ?? null,
        displayName: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null,
        photoURL: session.user.user_metadata?.avatar_url ?? session.user.user_metadata?.picture ?? null,
      };
    };

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!isMounted) return;
      
      const mappedUser = mapSessionToUser(session);
      setUser(mappedUser);
      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      
      if (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
        setLoading(false);
        return;
      }
      
      const session = data.session;
      console.log('Initial session:', session?.user?.email || 'No session');
      const mappedUser = mapSessionToUser(session);
      setUser(mappedUser);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    console.log('🔐 Attempting login for:', email);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password: pass });
      console.log('Login response:', { error: error?.message, hasSession: !!data?.session, hasUser: !!data?.session?.user });
      
      if (error) {
        const errorMessage = error.message || 'Failed to sign in. Please check your credentials.';
        setError(errorMessage);
        console.error('❌ Login error:', error);
        setLoading(false);
        return;
      }
      
      // Set user immediately if session exists to avoid redirect delay
      // The onAuthStateChange listener will also fire and confirm/update the state
      if (data?.session?.user) {
        console.log('✅ Login successful, user:', data.session.user.email);
        const mapped: User = {
          uid: data.session.user.id,
          email: data.session.user.email ?? null,
          displayName: data.session.user.user_metadata?.full_name ?? data.session.user.user_metadata?.name ?? null,
          photoURL: data.session.user.user_metadata?.avatar_url ?? data.session.user.user_metadata?.picture ?? null,
        };
        setUser(mapped);
        setLoading(false);
      } else {
        // Wait for session to be processed
        console.log('⏳ No session in response, checking stored session...');
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          console.log('✅ Session found, user:', sessionData.session.user.email);
          const mapped: User = {
            uid: sessionData.session.user.id,
            email: sessionData.session.user.email ?? null,
            displayName: sessionData.session.user.user_metadata?.full_name ?? sessionData.session.user.user_metadata?.name ?? null,
            photoURL: sessionData.session.user.user_metadata?.avatar_url ?? sessionData.session.user.user_metadata?.picture ?? null,
          };
          setUser(mapped);
          setLoading(false);
        } else {
          console.error('❌ No session found after login attempt');
          setError('Login successful but session not found. Please try again.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      console.error('❌ Login exception:', err);
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    console.log('📝 Attempting signup for:', email);
    
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
      
      console.log('Signup response:', { 
        error: error?.message, 
        hasUser: !!data?.user, 
        hasSession: !!data?.session,
        needsEmailConfirmation: !!data?.user && !data?.session
      });
      
      if (error) {
        const errorMessage = error.message || 'Failed to create account. Please try again.';
        setError(errorMessage);
        console.error('❌ Signup error:', error);
        setLoading(false);
        return;
      }
      
      if (data?.user && data?.session) {
        // Signup successful and session created (email confirmation might be disabled)
        console.log('✅ Signup successful with session, user:', data.user.email);
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
        console.log('📧 User created, email confirmation required');
        setError('Check your email to confirm your account!');
        setLoading(false);
      } else {
        // Wait a moment and check for session
        console.log('⏳ No user/session in response, checking stored session...');
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
          setError('Account created but session error. Please try logging in.');
          setLoading(false);
          return;
        }
        
        if (sessionData.session?.user) {
          console.log('✅ Session found after wait, user:', sessionData.session.user.email);
          const mapped: User = {
            uid: sessionData.session.user.id,
            email: sessionData.session.user.email ?? null,
            displayName: sessionData.session.user.user_metadata?.full_name ?? sessionData.session.user.user_metadata?.name ?? null,
            photoURL: sessionData.session.user.user_metadata?.avatar_url ?? sessionData.session.user.user_metadata?.picture ?? null,
          };
          setUser(mapped);
        } else {
          console.log('ℹ️ No session found, user may need to confirm email');
          setError('Account created! Please check your email to confirm your account.');
        }
        setLoading(false);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      console.error('❌ Signup exception:', err);
      setLoading(false);
    }
  };
  
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    console.log('🔐 Attempting Google OAuth login');
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('OAuth redirect URL:', redirectUrl);
      
      const { error, data } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        const errorMessage = error.message || 'Failed to sign in with Google. Please try again.';
        setError(errorMessage);
        console.error('❌ OAuth error:', error);
        setLoading(false);
      } else {
        console.log('✅ OAuth redirect initiated, redirecting to Google...');
        // Note: OAuth redirects to Google, so loading will be handled by auth state change
        // Don't set loading to false here as the redirect will happen
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      console.error('❌ OAuth exception:', err);
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
