import React, { useEffect } from 'react';
import { useAuth } from '../AuthContext';
import Loader from './common/Loader';

/**
 * OAuth callback handler - handles redirect from Google OAuth
 */
const AuthCallback: React.FC = () => {
  const { loading } = useAuth();

  useEffect(() => {
    // Supabase handles the OAuth callback automatically via onAuthStateChange
    // This component just shows loading while processing
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Loader text="Completing sign in..." />
    </div>
  );
};

export default AuthCallback;

