import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demonstration purposes
const MOCK_USER: User = {
  uid: '12345',
  email: 'creator@agentforge.ai',
  displayName: 'Alex Chroma',
  photoURL: null,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    const session = sessionStorage.getItem('user-session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    console.log(`Mock login with ${email}`);
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    setUser(MOCK_USER);
    sessionStorage.setItem('user-session', JSON.stringify(MOCK_USER));
    setLoading(false);
  };

  const signup = async (email: string, pass: string) => {
    console.log(`Mock signup with ${email}`);
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    setUser(MOCK_USER);
     sessionStorage.setItem('user-session', JSON.stringify(MOCK_USER));
    setLoading(false);
  };
  
  const loginWithGoogle = async () => {
    console.log('Mock login with Google');
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    setUser(MOCK_USER);
    sessionStorage.setItem('user-session', JSON.stringify(MOCK_USER));
    setLoading(false);
  };

  const logout = async () => {
    console.log('Mock logout');
    setLoading(true);
    await new Promise(res => setTimeout(res, 500));
    setUser(null);
    sessionStorage.removeItem('user-session');
    setLoading(false);
  };

  const value = { user, loading, login, signup, loginWithGoogle, logout };

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
