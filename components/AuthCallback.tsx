import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import Loader from './common/Loader';

/**
 * OAuth callback handler - handles redirect from Google OAuth
 */
const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing OAuth callback', {
          hash: window.location.hash.substring(0, 50),
          search: window.location.search.substring(0, 50),
          pathname: window.location.pathname
        });

        // Clean URL after Supabase processes it (both hash and query params)
        const cleanUrl = () => {
          const cleanPath = '/auth/callback';
          if (window.location.hash || window.location.search) {
            window.history.replaceState({}, '', cleanPath);
          }
        };

        // Wait for Supabase's detectSessionInUrl to process the code/hash
        // Supabase handles both hash fragments (#access_token) and query params (?code)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Clean URL now
        cleanUrl();

        // Check for session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('AuthCallback: Session check result', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          error: error?.message
        });
        
        if (error) {
          console.error('Error getting session:', error);
          setStatus('error');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }

        if (session?.user) {
          console.log('✅ AuthCallback: Session found, redirecting to workspace');
          setStatus('success');
          // Give a moment for auth state to propagate
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
          console.warn('⚠️ AuthCallback: No session found after OAuth callback');
          setStatus('error');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('error');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    };

    handleAuthCallback();
  }, []);

  const getMessage = () => {
    switch (status) {
      case 'processing':
        return 'Completing sign in...';
      case 'success':
        return 'Sign in successful! Redirecting...';
      case 'error':
        return 'Sign in failed. Redirecting...';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Loader text={getMessage()} />
    </div>
  );
};

export default AuthCallback;
