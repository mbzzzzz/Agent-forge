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
        // Try multiple times to ensure session is processed
        let session = null;
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts && !session) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (data?.session?.user) {
            session = data.session;
            console.log(`✅ Session found after ${attempts + 1} attempt(s)`);
            break;
          }
          attempts++;
        }

        // Clean URL now (whether session found or not)
        cleanUrl();

        // Final session check if not found yet
        if (!session) {
          const { data: { session: finalSession }, error } = await supabase.auth.getSession();
          session = finalSession;
        }
        
        console.log('AuthCallback: Session check result', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email
        });

        if (session?.user) {
          console.log('✅ AuthCallback: Session found, redirecting to workspace');
          setStatus('success');
          // Clean URL completely before redirecting
          window.history.replaceState({}, '', '/');
          // Give a moment for auth state to propagate, then redirect
          setTimeout(() => {
            // Use replace to avoid adding to history
            window.location.replace('/');
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
