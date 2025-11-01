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
        // Clean URL hash after Supabase processes it
        if (window.location.hash) {
          window.history.replaceState({}, '', '/auth/callback');
        }

        // Wait 1 second for Supabase's detectSessionInUrl to process the hash
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check for session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setStatus('error');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }

        if (session?.user) {
          setStatus('success');
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
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
