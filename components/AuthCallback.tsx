import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../services/supabaseClient';
import Loader from './common/Loader';

/**
 * OAuth callback handler - handles redirect from Google OAuth
 */
const AuthCallback: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if there's a hash fragment in the URL (OAuth tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        if (hashParams.has('access_token') || hashParams.has('error')) {
          if (hashParams.has('error')) {
            // OAuth error occurred
            console.error('OAuth error:', hashParams.get('error_description') || hashParams.get('error'));
            setStatus('error');
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
            return;
          }

          // Wait for Supabase to automatically process the hash fragment
          // The detectSessionInUrl option should handle this, but we need to wait
          let sessionFound = false;
          for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Error getting session:', error);
              break;
            }
            
            if (session?.user) {
              sessionFound = true;
              // Clean up the URL
              window.history.replaceState({}, '', '/auth/callback');
              setStatus('success');
              // Give auth state change time to update
              await new Promise(resolve => setTimeout(resolve, 300));
              window.location.href = '/';
              return;
            }
          }
          
          if (!sessionFound) {
            console.error('Session not found after waiting');
            setStatus('error');
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          }
        } else {
          // No hash params, check if we already have a session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setStatus('success');
            setTimeout(() => {
              window.location.href = '/';
            }, 500);
          } else {
            // If no session and no hash, we might be here by mistake
            console.log('No OAuth tokens and no session found');
            setStatus('error');
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          }
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

  // Also listen for auth state changes in case user gets set
  useEffect(() => {
    if (user) {
      setStatus('success');
      // Clean up URL if there's still a hash
      if (window.location.hash) {
        window.history.replaceState({}, '', '/auth/callback');
      }
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }
  }, [user]);

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

